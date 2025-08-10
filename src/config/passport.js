import AdminModel from '../models/Admin';

const bcrypt = require('bcryptjs');
const Auth = require('../models/Auth');

const passport = require('passport');

const {
  reactivateDataFromServices
} = require('../middleware/deleteUserAction');

const GoogleStrategy = require('passport-google-oauth20').Strategy;

// const applePrivateKeyPath = path.join(process.env.APPLE_PRIVATE_KEY);

const PassportConfig = (app) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleRegisterCallbackUrl = process.env.GOOGLE_CALLBACK_URL;

  console.log({ googleRegisterCallbackUrl });
  app.use(passport.initialize());

  //Passport google
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleSecret,
        callbackURL: googleRegisterCallbackUrl,
        passReqToCallback: true // Pass the request to the callback to access query parameters
      },
      async function (req, accessToken, refreshToken, profile, cb) {
        console.log('Calling google strategy');

        try {
          console.log(req.query);
          const state = req.query.state ? JSON.parse(req.query.state) : {};
          const { mode, isNative, firstName, lastName } = state;
          const searchUser = await AdminModel.findOne({
            googleId: profile.id
          }).select('-password');

          //Create the user
          if (!searchUser) {
            const user = await AdminModel.create({
              googleId: profile.id,
              googleEmail: profile.emails[0].value,
              role: 'Admin'
            });

            return cb(null, user);
          } else {
            return cb(null, searchUser);
          }
        } catch (error) {
          console.log('Error in Google Passport authentication', error);
          return cb(error);
        }
      }
    )
  );
};

export default PassportConfig;
