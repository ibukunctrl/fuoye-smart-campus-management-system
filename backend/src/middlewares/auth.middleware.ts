import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { RoleType } from '../constants/roles.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication token missing or invalid format', 401, ERROR_CODES.UNAUTHORIZED));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    req.user = payload;
    return next();
  } catch {
    return next(new AppError('Expired or invalid authentication token', 401, ERROR_CODES.UNAUTHORIZED));
  }
}

export function authorize(...allowedRoles: RoleType[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403, ERROR_CODES.FORBIDDEN));
    }
    return next();
  };
}

export const adminMiddleware = authorize('ADMIN', 'STAFF');
export const agentMiddleware = authorize('AGENT');
export const adminOrAgentMiddleware = authorize('ADMIN', 'STAFF', 'AGENT');
