import dotenv from 'dotenv';
dotenv.config();

const serverEnvVaiables = {
  mongoDbUrl: process.env.MONGODB_URL ?? null,
  basePath: process.env.BASE_PATH ?? null,
  databaseName: process.env.DATABASE_NAME ?? null,
  testDatabaseName: process.env.TEST_DATABASE_NAME ?? null,
  frontendUrl: process.env.FRONTEND_URL ?? null,
  cmsFrontendUrl: process.env.CRM_FRONTEND_URL ?? null,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: process.env.PORT ?? 3000,
  signupSecret: process.env.SIGNUP_SECRET ?? null,
  jwtSecret: process.env.JWT_SECRET ?? null
};

const googleEnvVariables = {
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL ?? ''
};

const digitaloceanEnvVariables = {
  spacesKey: process.env.DO_SPACES_KEY,
  spacesSecret: process.env.DO_SPACES_SECRET,
  spacesBucket: process.env.DO_BUCKET_NAME
};

export { serverEnvVaiables, googleEnvVariables, digitaloceanEnvVariables };
