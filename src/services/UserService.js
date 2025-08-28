import passport from 'passport';
import UserModel from '../models/Users.js';
import { ReturnObject } from '../util/returnObject.js';
import {
  generateToken,
  getCSRFToken,
  getExpiryTime
} from '../util/generateCode.js';
import AuthCodeModel from '../models/AuthCodes.js';
import { serverEnvVaiables } from '../config/enviornment.js';
import AdminModel from '../models/Admin.js';

/**
 * @class UserService
 * @classdesc Handles user-related logic
 */
class UserService {
  /**
   * Default User service constructor
   * @param {import('mongoose').Model<UserModel>} userModel
   */
  constructor() {}

  /**
   * Login admin
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  googleAuthHandler = (req, res, next) => {
    try {
      console.log('googleSignUp');
      const { mode } = req.query;
      passport.authenticate('google', {
        scope: [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email'
        ],
        prompt: 'consent',
        state: JSON.stringify({ mode })
      })(req, res, next);
    } catch (error) {
      console.log('Error while saving user', error);
      res.status(400).send(error);
    }
  };

  /**
   * Login admin callback
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  googleAuthHandlerCallback = (req, res, next) => {
    const appUrl = (params) =>
      `${serverEnvVaiables.cmsFrontendUrl}/admin/login?${params?.toString()}`;

    console.log('Google auth handler');
    const isDev = serverEnvVaiables?.nodeEnv === 'development';
    try {
      passport.authenticate('google', async (err, user, info) => {
        if (err) {
          console.error('Error during Google authentication callback', err);
          const params = new URLSearchParams({
            authError:
              'An error occurred during Google authentication. Please try again.'
          });

          return res.redirect(appUrl(params));
        }

        if (!user) {
          const params = new URLSearchParams({
            authError:
              'An error occurred during Google authentication. User not found.'
          });

          return res.redirect(appUrl(params));
        }

        const userId = user._id.toString();
        console.log({ userId });
        // Fetch the most recently updated AuthCodeModel
        const mostRecentAuthCode = await AuthCodeModel.findOne({
          userId: userId
        })
          .sort({ updatedAt: -1 })
          .limit(1);

        const accessToken = generateToken(userId, '15m', 'accessToken'); //Expires in 15m;

        let csrfToken;
        let refreshToken;
        let rtExpiresAt;

        //If the user already has a login session. Generate only new access tokens and csrf tokens
        if (mostRecentAuthCode) {
          console.log(
            'Already logged in. Setting refresh token and generating access and csrf token.'
          );

          refreshToken = mostRecentAuthCode?.refreshToken?.code;
          rtExpiresAt = mostRecentAuthCode?.refreshToken?.expiryDate;
          csrfToken = await getCSRFToken(mostRecentAuthCode._id.toString());
        } else {
          console.log(
            'Not logged in. Generating both csrf token and refresh token'
          );

          refreshToken = generateToken(userId, '7d', 'refreshToken'); //Expires in 7 days
          rtExpiresAt = new Date(Date.now() + getExpiryTime('7d')); // 7 days expiry

          //Log the user in
          const userAuth = await AuthCodeModel.create({
            userId: userId,
            refreshToken: { code: refreshToken, expiryDate: rtExpiresAt }
          });

          csrfToken = await getCSRFToken(userAuth._id.toString());
        }

        const cookieOptions = {
          httpOnly: true,
          maxAge: getExpiryTime('365d'),
          sameSite: isDev ? 'lax' : 'none',
          secure: !isDev,
          partitioned: !isDev
        };

        res.cookie('accessToken', accessToken, cookieOptions); //Set the access token to the request cookies
        res.cookie('csrf_token', csrfToken, cookieOptions); //Set the csrf token
        res.cookie('refreshToken', refreshToken, cookieOptions); //Set the access token to the request cookies

        console.log('Auth codes created');

        const params = new URLSearchParams({
          userId: userId,
          token: csrfToken
        });

        return res.redirect(appUrl(params));
      })(req, res, next);
    } catch (error) {
      console.log('Error during Google authentication callback', error);
      const params = new URLSearchParams({
        authError:
          'An error occured during Google authentication. Please try again.'
      });

      return res.redirect(appUrl(params));
    }
  };

  /**
   * Creates or gets a customer before booking
   * @param {string} firstName
   * @param {string} lastName
   * @param {string} phone
   * @param {string} email
   * @returns {}
   */
  getCustomerForBooking = async (firstName, lastName, phone, email) => {
    try {
      // Try to find an existing customer
      let customer = await UserModel.findOne({ phone, email }).populate(
        'bookings'
      );

      if (!customer) {
        // Create a new user if not found
        const newUser = await UserModel.create({
          firstName,
          lastName,
          phone,
          email,
          bookings: [],
          role: 'Customer'
        });

        const createdUser = await UserModel.findById(newUser?._id).populate(
          'bookings'
        );

        return createdUser;
      }
      return customer;
    } catch (error) {
      console.error('Error in getCustomerForBooking:', error.message ?? error);
      throw new Error(error.message ?? 'Failed to get customer for booking');
    }
  };

  /**
   * Gets a customer by their Id
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns {import('../util/returnObject').ResponseType}
   */
  getCustomerById = async (req, res) => {
    try {
      const { customerId } = req.params;
      const customer = await UserModel.findOne({
        _id: customerId,
        role: 'Customer'
      }).populate('bookings');

      //If the customer does not exist
      if (!customer) {
        const response = ReturnObject(false, 'Customer not found');
        return res.status(404).send(response);
      }

      const response = ReturnObject(true, customer);
      return res.status(200).send(response);
    } catch (error) {
      const response = ReturnObject(
        false,
        'Something went wrong while fetching customer'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Gets a customer by their Id
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns {import('../util/returnObject').ResponseType}
   */
  getAuthenticatedUser = async (req, res) => {
    try {
      const { userId } = req.params;
      console.log({ userId });
      const customer = await AdminModel.findOne({
        _id: userId,
        role: 'Employee'
      });

      //If the customer does not exist
      if (!customer) {
        const response = ReturnObject(false, 'User not found');
        return res.status(404).send(response);
      }

      const response = ReturnObject(true, customer);
      return res.status(200).send(response);
    } catch (error) {
      const response = ReturnObject(
        false,
        'Something went wrong while fetching authorized user'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Gets all customers
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns {import('../util/returnObject').ResponseType}
   */
  getAllCustomer = async (req, res) => {
    try {
      const customers = await UserModel.find().populate('bookings');

      //If the customer does not exist
      if (!customers) {
        return ReturnObject(false, 'Customer does not exist');
      }

      const response = ReturnObject(true, customers);
      return res.status(200).send(response);
    } catch (error) {
      const response = ReturnObject(
        false,
        'Something went wrong while fetching customer'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Called after a user has missed 2 or more bookings
   * @param {*} userId
   */
  blockUser = async (userId) => {
    try {
      const userToBlock = await UserModel.findById(userId);
      userToBlock.isBlocked = true;
      userToBlock.save();
      return true;
    } catch (error) {
      console.error('Error in blockUser:', error.message ?? error);
      throw new Error(
        error.message ?? 'Failed to block customer for missed booking'
      );
    }
  };

  /**
   * unblock a user has missed 2 or more bookings
   * @param {*} userId
   */
  unBlockUser = async (req, res) => {
    try {
      const { customerId } = req.params;
      const userToBlock = await UserModel.findById(customerId);
      userToBlock.isBlocked = false;
      userToBlock.save();
      const response = ReturnObject(true, 'Unblocked user');
      return res.status(200).send(response);
    } catch (error) {
      console.error('Error in blockUser:', error.message ?? error);
      const response = ReturnObject(
        false,
        error.message ?? 'Failed to block customer for missed booking'
      );
      return res.status(400).send(response);
    }
  };

  logout = async (req, res) => {
    const { userId } = req.params;
    const isDev = serverEnvVaiables?.nodeEnv === 'development';

    try {
      const user = await AdminModel.findById(userId);
      if (!user) {
        const response = ReturnObject(false, 'User does not exist.');
        return res.status(404).send(response);
      }

      await AuthCodeModel.deleteMany({ userId });

      const cookieOptions = {
        httpOnly: true,
        maxAge: getExpiryTime('365d'),
        sameSite: isDev ? 'lax' : 'none',
        secure: !isDev,
        partitioned: !isDev
      };

      //Delete the cookies
      res.clearCookie('accessToken', cookieOptions);

      res.clearCookie('refreshToken', cookieOptions);

      res.clearCookie('csrf_token', cookieOptions);

      const response = ReturnObject(true, 'Successfully Logged Out');
      return res.status(200).send(response);
    } catch (error) {
      const response = ReturnObject(false, 'Failed to log out user');
      console.error('Error loggin user out', error);
      return res.status(400).send(response);
    }
  };
}

export default UserService;
