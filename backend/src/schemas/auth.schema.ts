import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    matricNumber: z.string().min(5, 'Matric number must be at least 5 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(2, 'Full name is required'),
    department: z.string().optional(),
    level: z.string().optional(),
    phoneNumber: z.string().optional(),
  }).strip(), // Silently ignore any extra fields (e.g. confirmPassword, gender)
});

export const loginSchema = z.object({
  body: z.object({
    matricNumber: z.string().min(1, 'Matric number is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
