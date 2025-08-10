import { serverEnvVaiables } from './enviornment.js';
import cors from 'cors';
import express from 'express';
import errorHandler from '../util/errorHandler.js';
import { APIRoutes } from '../routes/Routes.js';

const app = express();

/**
 * Start the express server
 * @param {MongoClient} databaseClient
 */
const initExpressApp = async (databaseClient) => {
  try {
    if (!serverEnvVaiables?.port)
      throw new Error('startExpressServer function: Port is undefined');

    if (!serverEnvVaiables?.basePath)
      throw new Error(
        'startExpressServer function: Base path URL is undefined'
      );

    if (!serverEnvVaiables?.cmsFrontendUrl)
      throw new Error(
        'startExpressServer function: CMS Frontend URL is undefined'
      );

    if (!serverEnvVaiables?.frontendUrl)
      throw new Error('startExpressServer function: Frontend URL is undefined');

    if (!databaseClient)
      throw new Error('startExpressServer function: Failed to load database');

    //Set up cors
    const corsOption = {
      origin: [serverEnvVaiables.cmsFrontendUrl, serverEnvVaiables.frontendUrl],
      methods: ['GET', 'POST', 'DELETE', 'PUT'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Origin',
        'X-Requested-With',
        'Accept'
      ]
    };

    app.use(cors(corsOption));

    //Middlewares
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    app.set('trust proxy', 1);
    //Initalize routes
    const routes = new APIRoutes();
    const appRouter = await routes.initAllRoutes();

    app.use(serverEnvVaiables.basePath, appRouter);
    //Middleware
    app.use(errorHandler);

    return app;
  } catch (error) {
    console.error({ error: error?.message });
    throw new Error(error.message);
  }
};

export default initExpressApp;
