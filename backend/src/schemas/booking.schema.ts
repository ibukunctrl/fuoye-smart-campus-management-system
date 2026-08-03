import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    facilityId: z.string().uuid('Facility ID must be a valid UUID'),
    roomId: z.string().uuid('Room ID must be a valid UUID'),
    startTime: z.string().datetime({ message: 'Start time must be a valid ISO datetime string' }),
    endTime: z.string().datetime({ message: 'End time must be a valid ISO datetime string' }),
    purpose: z.string().max(255).optional(),
  }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>['body'];
