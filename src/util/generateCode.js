import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { serverEnvVaiables } from '../config/enviornment.js';

function generateCode(length) {
  let code = '';
  let schema = '0123456789';

  for (let i = 0; i < length; i++) {
    code += schema.charAt(Math.floor(Math.random() * schema.length));
  }

  return code;
}

//Double signed-csrf token asper: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#pseudo-code-for-implementing-hmac-csrf-tokens
const getCSRFToken = async (authId) => {
  const secret = serverEnvVaiables.jwtSecret;
  const randomValue = getRandomValue(128);

  // Create the CSRF Token
  const message =
    authId.length + '!' + authId + '!' + randomValue.length + '!' + randomValue;
  const hmac = crypto
    .createHmac('SHA256', secret)
    .update(message)
    .digest('hex');
  const csrfToken = hmac + '.' + randomValue;

  return csrfToken;
};

const getRandomValue = (length) => {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// Method to validate the CSRF Token
const validateCSRFToken = (csrfToken, authId) => {
  const [hmac, randomValue] = csrfToken.split('.');
  const secret = serverEnvVaiables.jwtSecret;

  if (!hmac || !randomValue) {
    return false;
  }

  const message =
    authId.length + '!' + authId + '!' + randomValue.length + '!' + randomValue;
  const recomputedHmac = crypto
    .createHmac('SHA256', secret)
    .update(message)
    .digest('hex');

  if (recomputedHmac === hmac) {
    return true;
  }

  return false;
};

const generateToken = (userId, expires, grantType) => {
  return jwt.sign(
    { userId, grantType, jti: crypto.randomUUID() },
    serverEnvVaiables.jwtSecret,
    { expiresIn: expires }
  );
};

export { generateCode, getCSRFToken, validateCSRFToken, generateToken };
