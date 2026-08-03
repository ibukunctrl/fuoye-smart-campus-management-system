import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      return sendSuccess(res, 201, result, 'User registered successfully');
    } catch (err) {
      return next(err);
    }
  }

  public static async agentRegister(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.agentRegister(req.body);
      return sendSuccess(res, 201, result, 'Agent registered successfully');
    } catch (err) {
      return next(err);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
      const result = await AuthService.login(req.body, ipAddress);
      return sendSuccess(res, 200, result, 'Login successful');
    } catch (err) {
      return next(err);
    }
  }

  public static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, 200, req.user, 'Profile retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  public static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await AuthService.updateProfile(req.user!.userId, req.body);
      return sendSuccess(res, 200, updated, 'Profile updated successfully');
    } catch (err) {
      return next(err);
    }
  }

  public static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.changePassword(req.user!.userId, req.body);
      return sendSuccess(res, 200, null, 'Password changed successfully');
    } catch (err) {
      return next(err);
    }
  }

  public static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await AuthService.getAllUsers();
      return sendSuccess(res, 200, users, 'Users retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }
}
