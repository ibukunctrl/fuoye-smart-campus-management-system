import { prisma } from '../config/database.js';
import { LockService } from './lock.service.js';
import { emailService } from './email.service.js';
import { AppError } from '../utils/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { logger } from '../config/logger.js';
import { BookingStatus } from '@prisma/client';

export interface CreateBookingDto {
  userId: string;
  facilityId: string;
  roomId?: string; // Optional — validated below before transaction
  startTime: string | Date;
  endTime: string | Date;
  purpose?: string;
  requiresInspection?: boolean;
  inspectionDate?: string | Date;
}

export class BookingService {
  /**
   * Concurrency-Safe Room Booking / Inspection Request Creation
   * 1. Acquires Redis Redlock for the target room.
   * 2. Executes Prisma Serializable transaction to verify availability and mark room as occupied.
   * 3. Dispatches inspection / reservation notification.
   */
  public static async createBooking(dto: CreateBookingDto) {
    const lockKey = `room:${dto.roomId}`;
    let lockToken: string | null = null;

    // Guard: roomId is required for space allocation
    if (!dto.roomId) {
      throw new AppError('A room must be selected before booking', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    try {
      // Step 1: Acquire Redis lock with 5 second TTL
      lockToken = await LockService.acquireLock(lockKey, 5000);

      // Step 2: Execute Atomic Prisma Transaction
      const booking = await prisma.$transaction(
        async (tx) => {
          // Verify user exists
          const user = await tx.user.findUnique({
            where: { id: dto.userId },
          });
          if (!user) {
            throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
          }

          // Fetch facility and room inside transaction
          const room = await tx.room.findUnique({
            where: { id: dto.roomId },
            include: { facility: true },
          });

          if (!room || room.facilityId !== dto.facilityId) {
            throw new AppError('Specified room or facility does not exist', 404, ERROR_CODES.NOT_FOUND);
          }

          // Concurrency check: Ensure room is not already occupied
          if (room.isOccupied) {
            throw new AppError(
              `Room ${room.roomNumber} is already occupied or reserved!`,
              409,
              ERROR_CODES.ROOM_FULL
            );
          }

          // Mark room as occupied and decrement available inventory
          const updatedRoom = await tx.room.update({
            where: { id: room.id },
            data: {
              availableBeds: {
                decrement: 1,
              },
              isOccupied: true,
            },
          });

          const isInspection = dto.requiresInspection ?? true;
          const inspDate = dto.inspectionDate ? new Date(dto.inspectionDate) : new Date(dto.startTime);

          // Create the booking record (CONFIRMED — directly registered with agent notification)
          const newBooking = await tx.booking.create({
            data: {
              userId: dto.userId,
              facilityId: dto.facilityId,
              roomId: dto.roomId,
              status: BookingStatus.CONFIRMED,
              requiresInspection: isInspection,
              inspectionDate: isInspection ? inspDate : null,
              startTime: new Date(dto.startTime),
              endTime: new Date(dto.endTime),
              purpose: dto.purpose || (isInspection ? 'Room Physical Inspection Request' : 'Direct Room Rental'),
            },
            include: {
              room: true,
              facility: true,
              user: {
                select: { id: true, fullName: true, email: true, matricNumber: true, phoneNumber: true },
              },
            },
          });

          // Create notification record for user
          const notifMsg = isInspection
            ? `Your inspection for ${room.facility.name} (Room ${room.roomNumber}) is scheduled for ${inspDate.toLocaleDateString()}. The agent has been notified.`
            : `Your room reservation for ${room.facility.name} (Room ${room.roomNumber}) is confirmed.`;

          await tx.notification.create({
            data: {
              userId: dto.userId,
              title: isInspection ? 'Inspection Scheduled!' : 'Room Reserved!',
              message: notifMsg,
              type: 'BOOKING_ALERT',
            },
          });

          logger.info(
            { bookingId: newBooking.id, roomId: room.id, isOccupied: updatedRoom.isOccupied },
            '🎉 Room booking transaction committed successfully'
          );

          return newBooking;
        },
        {
          maxWait: 5000,
          timeout: 10000,
          isolationLevel: 'Serializable',
        }
      );

      // Trigger email notification asynchronously
      emailService
        .sendBookingConfirmation(
          booking.user.email,
          booking.user.fullName,
          booking.facility.name,
          booking.room?.roomNumber || 'N/A',
          booking.status
        )
        .catch((err) => logger.error({ err }, 'Failed to send background email'));

      return booking;
    } finally {
      if (lockToken) {
        await LockService.releaseLock(lockKey, lockToken);
      }
    }
  }

  public static async getUserBookings(userId: string) {
    return prisma.booking.findMany({
      where: { userId },
      include: {
        facility: true,
        room: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public static async getAgentBookings(agentId: string) {
    return prisma.booking.findMany({
      where: {
        facility: {
          agentId: agentId,
        },
      },
      include: {
        facility: true,
        room: true,
        user: {
          select: { id: true, fullName: true, email: true, matricNumber: true, phoneNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public static async getAllBookings() {
    return prisma.booking.findMany({
      include: {
        facility: true,
        room: true,
        user: {
          select: { id: true, fullName: true, email: true, matricNumber: true, phoneNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public static async cancelBooking(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { room: true },
    });

    if (!booking) {
      throw new AppError('Booking record not found', 404, ERROR_CODES.NOT_FOUND);
    }

    if (booking.userId !== userId) {
      throw new AppError('Unauthorized to cancel this booking', 403, ERROR_CODES.UNAUTHORIZED);
    }

    if (booking.status === BookingStatus.CANCELLED) {
      return booking;
    }

    // Transaction: Cancel booking and release room back to available inventory
    return prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
        include: { facility: true, room: true },
      });

      if (booking.roomId) {
        await tx.room.update({
          where: { id: booking.roomId },
          data: {
            isOccupied: false,
            availableBeds: { increment: 1 },
          },
        });
      }

      await tx.notification.create({
        data: {
          userId,
          title: 'Booking Cancelled',
          message: `Your reservation for ${updatedBooking.facility.name} was cancelled and the room has been released.`,
          type: 'BOOKING_CANCELLED',
        },
      });

      return updatedBooking;
    });
  }

  public static async updateBookingStatus(id: string, status: BookingStatus) {
    return prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        facility: true,
        room: true,
        user: {
          select: { id: true, fullName: true, email: true, matricNumber: true },
        },
      },
    });
  }
}
