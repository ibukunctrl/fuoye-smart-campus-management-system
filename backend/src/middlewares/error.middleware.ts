import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
import { sendError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export function globalErrorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }

  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const issues = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
    const mainMessage = err.issues[0]?.message || 'Invalid request parameters or body';
    return sendError(res, 400, ERROR_CODES.VALIDATION_ERROR, mainMessage, issues);
  }

  // 2. Custom AppErrors (Operational)
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error({ err }, 'Non-operational AppError occurred');
    }
    return sendError(res, err.statusCode, err.errorCode, err.message);
  }

  // 3. Prisma Database Errors
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const prismaErr = err as { code: string; meta?: unknown };
    if (prismaErr.code === 'P2002') {
      return sendError(res, 409, ERROR_CODES.CONFLICT, 'A record with this unique value already exists');
    }
    if (prismaErr.code === 'P2025') {
      return sendError(res, 404, ERROR_CODES.NOT_FOUND, 'The requested record was not found in the database');
    }
  }

  // 4. Unhandled Internal Server Errors
  logger.error({ err, url: req.originalUrl, method: req.method }, 'Unhandled Internal Server Error');

  const message = env.NODE_ENV === 'production' ? 'An internal server error occurred' : String(err);
  return sendError(res, 500, ERROR_CODES.INTERNAL_SERVER_ERROR, message);
}
