import { MongoClient } from 'mongodb';
import BookingModel from '../models/Bookings.js';
import { ReturnObject } from '../util/returnObject.js';
import { ScheduleService } from './ScheduleService.js';
import UserService from './UserService.js';
import { serverEnvVaiables } from '../config/enviornment.js';

export class BookingService {
  dbUrl = serverEnvVaiables.mongoDbUrl;

  /**
   * @param {UserService} userService
   * @param {ScheduleService} scheduleService
   */
  constructor(userService, scheduleService) {
    this.userService = userService;
    this.scheduleService = scheduleService;
  }

  /**
   * Creates a user booking
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns
   */
  createBooking = async (req, res) => {
    const {
      firstName,
      lastName,
      phone,
      email,
      startTime,
      AdditionalNotes,
      customServiceDetail,
      scheduleId,
      service
    } = req.body;

    try {
      if (
        !firstName ||
        !lastName ||
        !phone ||
        !email ||
        !startTime ||
        !service ||
        !service?.duration ||
        !service?.title
      ) {
        console.error('Invalid request argument');
        const response = ReturnObject(false, 'Invalid request argument');
        return res.status(400).send(response);
      }

      //Get the customer
      const user = await this.userService.getCustomerForBooking(
        firstName,
        lastName,
        phone,
        email
      );

      if (!user) {
        console.error('Failed to get user for booking');
        const response = ReturnObject(
          false,
          'Error: Failed to get user for booking'
        );
        return res.status(400).send(response);
      }

      if (user.isBlocked) {
        console.error(
          'Cannot proceed with booking, due to missed appointments in the past. Contact directly to proceed with booking.'
        );
        const response = ReturnObject(
          false,
          'Cannot proceed with booking, due to missed appointments in the past. Contact directly to proceed with booking.'
        );
        return res.status(400).send(response);
      }

      const dbClient = this.getDbClient();
      const session = dbClient.startSession();
      let newBookingReference = null;

      //Run in transaction
      try {
        await session.withTransaction(async () => {
          const scheduleCollection = dbClient
            .db('test')
            .collection('schedules');

          const userCollection = dbClient.db('test').collection('users');

          const bookingCollection = dbClient.db('test').collection('bookings');

          //Create the booking
          newBookingReference = await bookingCollection.insertOne(
            {
              firstName,
              lastName,
              phone,
              email,
              startTime,
              AdditionalNotes,
              customServiceDetail,
              scheduleId,
              service,
              status: 'Upcoming'
            },
            { session }
          );

          //Update the available schedule
          const updatedSchedule =
            await this.scheduleService.updateScheduleAfterBooking(
              scheduleId,
              {
                _id: newBookingReference?.insertedId,
                duration: service?.duration,
                startTime: startTime
              },
              scheduleCollection,
              session
            );

          //Update the users bookings
          await userCollection.updateOne(
            { _id: user?._id },
            {
              $push: { bookings: newBookingReference?.insertedId }
            },
            { session }
          );

          if (!updatedSchedule) {
            throw new Error('Failed to update schedule after booking');
          }
        });
      } catch (error) {
        console.error('Error while creating booking', error?.message ?? error);
        await session.endSession();
        await dbClient.close();
        const response = ReturnObject(
          false,
          error?.message ?? 'Error while creating booking'
        );
        return res.status(400).send(response);
      } finally {
        await session.endSession();
        await dbClient.close();
      }

      /**
       * TODO: Send email to notify the admin
       * Implement with nodemailer and google smtp
       */

      const response = ReturnObject(true, 'Booking created');
      return res.status(201).send(response);
    } catch (error) {
      console.log({ error });
      const response = ReturnObject(
        false,
        'Something went wrong while creating booking'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Get all bookings for a user
   * @param {import('express').Response} req
   * @param {import('express').Request} res
   */
  getUserBookings = async (req, res) => {
    const { firstName, lastName, phone, email } = req.body;
    let bookings;

    if (!phone && !email) {
      const response = ReturnObject(false, 'Missing customers phone or email');
      return res.status(400).send(response);
    }

    if (!firstName || !lastName) {
      const response = ReturnObject(false, 'Missing customers name');
      return res.status(400).send(response);
    }

    try {
      if (phone)
        bookings = await BookingModel.find({ phone, firstName, lastName });
      else if (email) {
        bookings = await BookingModel.find({ email, firstName, lastName });
      }

      const response = ReturnObject(true, bookings);
      return res.status(200).send(response);
    } catch (error) {
      console.log('Error in getUserBookings:', error?.message ?? error);
      const response = ReturnObject(
        false,
        'Something went wrong while getting user bookings'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Get bookings
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getBookings = async (req, res) => {
    const { status } = req.body;

    let bookings;
    try {
      if (!status) {
        bookings = await BookingModel.find();
      } else {
        bookings = await BookingModel.find({ status: status });
      }

      const response = ReturnObject(true, bookings);
      return res.status(200).send(response);
    } catch (error) {
      console.log('Error in getUpcomingBookings:', error?.message ?? error);
      const response = ReturnObject(
        false,
        'Something went wrong while getting all bookings'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Get booking by id
   * @param {import('express').Response} req
   * @param {import('express').Request} res
   */
  getBookingById = async (req, res) => {
    const { bookingId } = req.params;

    try {
      const booking = await BookingModel.findById(bookingId);

      if (!booking) {
        const response = ReturnObject(false, 'Booking not found');
        return res.status(404).send(response);
      }

      const response = ReturnObject(true, booking);
      return res.status(200).send(response);
    } catch (error) {
      console.log('Error in getBookingById:', error?.message ?? error);
      const response = ReturnObject(
        false,
        'Something went wrong while getting booking by id'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Update a booking status to: Pending, Completed, Missed, Cancelled
   * @param {import('express').Response} req
   * @param {import('express').Request} res
   */
  updateBookingById = async (req, res) => {
    const { bookingId, status, price } = req.body;

    if (!bookingId || (!status && !price)) {
      const response = ReturnObject(false, 'Invalid request arguments');
      return res.status(400).send(response);
    }

    try {
      const booking = await BookingModel.findById(bookingId);
      if (!booking) {
        const response = ReturnObject(false, 'Booking not found');
        return res.status(404).send(response);
      }

      if (status === 'Missed') {
        //Get the customer
        const bookingUser = await this.userService.getCustomerForBooking(
          booking.firstName,
          booking.lastName,
          booking.phone,
          booking.email
        );

        //Check their past bookings
        const missedBookings = bookingUser.booking.filter((booking) => {
          if (booking.status === 'Missed') return booking;
        });

        if (missedBookings >= 2) {
          //Block the user
          await this.userService.blockUser(bookingUser?._id);
        }
      }

      booking.status = status ? status : booking.status;
      booking.total = price ? price : booking.total;

      await booking.save();

      const response = ReturnObject(true, 'Booking status updated');
      return res.status(200).send(response);
    } catch (error) {
      console.log('Error in updateBookingStatusById:', error?.message ?? error);
      const response = ReturnObject(
        false,
        'Something went wrong while updating booking'
      );
      return res.status(400).send(response);
    }
  };

  cancelBookingByUser = async (req, res) => {
    try {
    } catch (error) {}
  };

  getDbClient = () => {
    console.log({ DB_URL: this.dbUrl });
    const client = new MongoClient(this.dbUrl);
    return client;
  };
}
