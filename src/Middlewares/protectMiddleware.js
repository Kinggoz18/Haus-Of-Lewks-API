import { generateToken, validateCSRFToken } from '../util/generateCode.js';
import jwt from 'jsonwebtoken';
import AdminModel from '../models/Admin.js';

const getExpiryTime = (expireAt) => {
  const durationFormat = expireAt
    .charAt(expireAt.length - 1)
    .toLocaleLowerCase();
  const duration = parseInt(expireAt.substring(0, expireAt.length - 1));

  if (isNaN(duration)) {
    console.log('Invalid duration value. Returning default expiry.');
    return 60 * 1000; // Default to 1 minute
  }

  switch (durationFormat) {
    case 's':
      return duration * 1000;
    case 'm':
      return 60 * duration * 1000;
    case 'h':
      return 60 * 60 * duration * 1000;
    case 'd':
      return 60 * 60 * 24 * duration * 1000;
    default:
      console.log('Invalid format. Returning default expiry.');
      return 60 * 1000; // Default to 1 minute
  }
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.log('Error while verifing token', error.message);
    return error.message;
  }
};

/**
 * Middleware process.
 * 1. All cookies last 1 year (Fake) from the time they're issued, while the JWT are signed with the TRUE expiry age.
 * This is so that the cookie tokens are always included in the request
 * 2. Check if the user exists
 * 3. Find their auth and see if they have an active session
 * 4. Check if the user has an access token, csrf token from http-only cookie and csrf token from the header
 * 5. Verify the access token and csrf tokens. Case 1: If successful proceed to next
 * 6. Case 2: If not sucessful throw and error
 * 7. Case 3: If it has expired. Check if the refresh token has not expired
 * 8. If the RT has not expired use it to fetch a new access token
 * 9. If the RT has expired fetch a new refresh token
 * 10. Proceed to next
 */
const protectMiddleware = async (req, res, next) => {
  const { accessToken, csrf_token, refreshToken } = req.cookies;
  const csrfTokenFromHeader = req.headers['x-csrf-token'];
  const { userId } = req.body;
  console.log({ csrf_token, csrfTokenFromHeader, accessToken, refreshToken });

  try {
    // Basic validations
    if (!userId) throw new Error('Unauthorized access');
    if (!accessToken) throw new Error('Unauthorized. Please login again.');
    if (!csrf_token) throw new Error('Unauthorized. Please login again.');
    if (csrfTokenFromHeader !== csrf_token) {
      throw new Error('Unauthorized access');
    }

    const userAuthcode = await AuthCode.findOne({ userId })
      .sort({ updatedAt: -1 })
      .limit(1);
    if (!userAuthcode)
      throw new Error('Unauthorized access. Authorization not found');

    // Token verifications
    const isATVerified = verifyToken(accessToken);
    const isRTVerified = verifyToken(refreshToken);
    const isValidated = validateCSRFToken(
      csrfTokenFromHeader?.toString(),
      userAuthcode._id.toString()
    );
    if (!isValidated) throw new Error('Unauthorized access');

    // Token verification cases
    if (isATVerified === 'jwt expired' && isRTVerified === 'jwt expired') {
      // Case 1: Both tokens expired
      if (userAuthcode.refreshToken.code !== refreshToken) {
        throw new Error('Invalid refresh token');
      }
      await fetchNewRefreshToken(userAuthcode, req, res);
    } else if (isATVerified && isRTVerified === 'jwt expired') {
      // Case 2: Valid AT, expired RT
      await fetchNewRefreshToken(userAuthcode, req, res);
    } else if (isATVerified === 'jwt expired' && isRTVerified) {
      // Case 3: Expired AT, valid RT
      if (userAuthcode.refreshToken.code !== refreshToken) {
        throw new Error('Invalid refresh token');
      }
      await refreshAccessToken(userAuthcode, req, res);
    } else {
      // Case 4: Both tokens valid or other cases
      if (!isATVerified?.userId) {
        console.log('Invalid access token');
        throw new Error('Unauthorized access');
      } else if (!isRTVerified?.userId) {
        console.log('Invalid refresh token');
        throw new Error('Unauthorized access');
      } else {
        console.log('Successfull verification');
      }
    }

    console.log('Successfull verification');
    // Final user authorization
    const authrorizedUser = await AdminModel.findById(
      isATVerified?.userId || userId
    ).select('-password');
    req.user = authrorizedUser;
    return next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(401).send(error.message);
  }
};

async function fetchNewRefreshToken(userAuth, req, res) {
  const { refreshToken } = req.cookies;

  console.log({ AuthRefreshToken: userAuth.refreshToken.code, refreshToken });
  try {
    // Generate new tokens
    const newRefreshToken = generateToken(
      userAuth?.userId,
      '7d',
      'refreshToken'
    );
    const newAccessToken = generateToken(
      userAuth?.userId,
      '15m',
      'accessToken'
    );

    // Update userAuth with new tokens and expiry date
    const rtExpiresAt = new Date(Date.now() + getExpiryTime('7d')); // 7 days expiry

    userAuth.refreshToken = { code: newRefreshToken, expiryDate: rtExpiresAt };
    await userAuth.save();

    // Set tokens as cookies
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      maxAge: getExpiryTime('365d'),
      sameSite: isDev ? 'lax' : 'none',
      secure: !isDev,
      partitioned: !isDev
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: getExpiryTime('365d'),
      sameSite: isDev ? 'lax' : 'none',
      secure: !isDev,
      partitioned: !isDev
    });

    console.log('Proceeding...');
    return;
    // res.status(200).send({ rtExpiresAt, atExpiresAt });
  } catch (error) {
    console.error('Error fetching new refresh token', error);
    return new Error('Failed to fetch new refresh token');
  }
}

async function refreshAccessToken(userAuth, req, res) {
  try {
    // Generate a new access token
    const newAccessToken = generateToken(userAuth.userId, '15m', 'accessToken');

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      maxAge: getExpiryTime('365d'),
      sameSite: isDev ? 'lax' : 'none',
      secure: !isDev,
      partitioned: !isDev
    });

    console.log('Proceeding...');
    return;
    // res.status(200).send({ atExpiresAt });
  } catch (error) {
    console.error('Error refreshing access token', error);
    return new Error('Failed to refresh access token');
  }
}

export { protectMiddleware };
