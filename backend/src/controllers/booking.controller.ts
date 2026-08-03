import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export class BookingController {
  public static async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const booking = await BookingService.createBooking({
        userId: req.user.userId,
        facilityId: req.body.facilityId,
        roomId: req.body.roomId,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        purpose: req.body.purpose,
        requiresInspection: req.body.requiresInspection,
        inspectionDate: req.body.inspectionDate,
      });

      return sendSuccess(res, 201, booking, 'Booking created and confirmed successfully');
    } catch (err) {
      return next(err);
    }
  }

  public static async cancelBooking(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const { id } = req.params;
      const cancelled = await BookingService.cancelBooking(id as string, req.user.userId);
      return sendSuccess(res, 200, cancelled, 'Booking cancelled successfully');
    } catch (err) {
      return next(err);
    }
  }

  public static async getMyBookings(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const bookings = await BookingService.getUserBookings(req.user.userId);
      return sendSuccess(res, 200, bookings, 'User bookings retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  public static async getAgentBookings(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || req.user.role !== 'AGENT') {
        throw new AppError('Unauthorized access', 403, ERROR_CODES.UNAUTHORIZED);
      }

      const bookings = await BookingService.getAgentBookings(req.user.userId);
      return sendSuccess(res, 200, bookings, 'Agent bookings retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  public static async getAllBookings(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        throw new AppError('Unauthorized access', 403, ERROR_CODES.UNAUTHORIZED);
      }

      const bookings = await BookingService.getAllBookings();
      return sendSuccess(res, 200, bookings, 'All bookings retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  public static async updateBookingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        throw new AppError('Unauthorized access', 403, ERROR_CODES.UNAUTHORIZED);
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        throw new AppError('Status is required', 400, ERROR_CODES.VALIDATION_ERROR);
      }

      const booking = await BookingService.updateBookingStatus(id as string, status);
      return sendSuccess(res, 200, booking, 'Booking status updated successfully');
    } catch (err) {
      return next(err);
    }
  }
}
