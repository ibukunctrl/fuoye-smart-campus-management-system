import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import { globalErrorHandler } from './middlewares/error.middleware.js';
import { AppError } from './utils/AppError.js';
import { ERROR_CODES } from './constants/errorCodes.js';

export function createApp(): Express {
  const app = express();

  // Security HTTP Headers
  app.use(helmet());

  // CORS Configuration
  app.use(
    cors({
      origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.FRONTEND_URL || '',
      ].filter(Boolean),
      credentials: true,
    })
  );

  // Request Logging
  app.use(morgan('dev'));

  // Body Parsing Limits (Prevent DoS)
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // API v1 Routes
  app.use('/api/v1', routes);

  // Catch 404 Unmatched Routes
  app.use('*', (req, _res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404, ERROR_CODES.NOT_FOUND));
  });

  // Global Error Handler
  app.use(globalErrorHandler);

  return app;
}
