import express, { type Express } from 'express';
import cors from 'cors';
import { apiRouter } from './routes/bundle.routes';
import { errorHandler, notFound } from './middleware/error';

export function createApp(): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', apiRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
