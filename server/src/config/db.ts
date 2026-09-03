import mongoose from 'mongoose';
import { env } from './env.js';

let connectionPromise: ReturnType<typeof mongoose.connect> | undefined;

export const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) return mongoose;

  connectionPromise ??= mongoose.connect(env.mongoUri).then((connection) => {
    console.log('MongoDB connected');
    return connection;
  }).catch((error) => {
    connectionPromise = undefined;
    throw error;
  });

  return connectionPromise;
};
