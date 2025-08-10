import mongoose from 'mongoose';
import { serverEnvVaiables } from './enviornment.js';

/**
 * Initalize a mongodb connection
 * @returns A mongoDb connection client
 */
const connectToDb = async () => {
  try {
    if (!serverEnvVaiables?.mongoDbUrl) throw new Error('MongoDb URL is null');

    const mongodb = await mongoose.connect(serverEnvVaiables?.mongoDbUrl);
    if (!mongodb)
      throw new Error('connectToDb Func: Failed to create MongoDb Client');

    return mongodb.connection.getClient();
  } catch (error) {
    console.error({ error: error?.message });
    throw new Error(error?.message);
  }
};

export default connectToDb;
