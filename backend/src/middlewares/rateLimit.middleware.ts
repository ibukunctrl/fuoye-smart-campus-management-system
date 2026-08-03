import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    return sendError(res, 429, ERROR_CODES.RATE_LIMIT_EXCEEDED, 'Too many requests from this IP, please try again after 15 minutes.');
  },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // Limit login/register attempts to 15 per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    return sendError(res, 429, ERROR_CODES.RATE_LIMIT_EXCEEDED, 'Too many authentication attempts, please try again after an hour.');
  },
});
