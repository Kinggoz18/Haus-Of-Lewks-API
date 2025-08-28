import { serverEnvVaiables } from '../config/enviornment.js';
import { ReturnObject } from '../util/returnObject.js';

/**
 * Login admin handler
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const signupAdminMiddleware = async (req, res, next) => {
  try {
    const { signupcode, mode } = req.query;
    if ((!signupcode && !mode) || !serverEnvVaiables.signupSecret) {
      const response = ReturnObject(false, 'Unauthorized access');
      return res.status(404).send(response);
    }

    if (!signupcode && mode === 'login') next();

    const hashedCode = await hashCode(serverEnvVaiables.signupSecret);

    if (signupcode != hashedCode) {
      const response = ReturnObject(false, 'Unauthorized access');
      return res.status(404).send(response);
    }

    next();
  } catch (error) {
    const response = ReturnObject(
      false,
      'Something went wrong while logging in user'
    );
    return res.status(400).send(response);
  }
};

const hashCode = async (code) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashedCode = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return hashedCode;
};

export default signupAdminMiddleware;
