import { serverEnvVaiables } from '../config/enviornment.js';
import { ReturnObject } from '../util/returnObject.js';

/**
 * Login admin handler
 * TODO: Encrypt security key
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const signupAdminMiddleware = (req, res, next) => {
  try {
    const { secretKey } = req.query;

    if (!secretKey) next();

    if (secretKey != serverEnvVaiables.signupSecret) {
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

export default signupAdminMiddleware;
