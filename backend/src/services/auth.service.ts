import bcrypt from 'bcrypt';
import { prisma } from '../config/database.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { RegisterInput, LoginInput } from '../schemas/auth.schema.js';
import { emailService } from './email.service.js';
import { Role } from '@prisma/client';

export class AuthService {
  public static async agentRegister(dto: { email: string; password: string; fullName: string }) {
    const existingUser = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) {
      throw new AppError('Email already registered', 409, ERROR_CODES.CONFLICT);
    }
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = await prisma.user.create({
      data: {
        matricNumber: `AGT-${Date.now()}`, // Temporary fallback since matricNumber is required
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        role: Role.AGENT,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      matricNumber: user.email, // using email as identifier
      role: user.role,
    });

    return { user, token };
  }

  public static async register(dto: RegisterInput) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ matricNumber: dto.matricNumber }, { email: dto.email }],
      },
    });

    if (existingUser) {
      throw new AppError('Matric number or email already registered', 409, ERROR_CODES.CONFLICT);
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = await prisma.user.create({
      data: {
        matricNumber: dto.matricNumber,
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        department: dto.department,
        level: dto.level,
        role: Role.STUDENT,
      },
      select: {
        id: true,
        matricNumber: true,
        email: true,
        fullName: true,
        role: true,
        department: true,
        level: true,
        createdAt: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      matricNumber: user.matricNumber,
      role: user.role,
    });

    return { user, token };
  }

  public static async login(dto: LoginInput, ipAddress: string) {
    const user = await prisma.user.findUnique({
      where: { matricNumber: dto.matricNumber },
    });

    if (!user) {
      throw new AppError('Invalid matric number or password', 401, ERROR_CODES.UNAUTHORIZED);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid matric number or password', 401, ERROR_CODES.UNAUTHORIZED);
    }

    const token = generateToken({
      userId: user.id,
      matricNumber: user.matricNumber,
      role: user.role,
    });

    // Send asynchronous login alert email
    emailService.sendLoginNotification(user.email, user.fullName, ipAddress).catch(() => {});

    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  public static async updateProfile(userId: string, dto: { fullName?: string; department?: string; level?: string; phoneNumber?: string; avatarUrl?: string }) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.fullName    && { fullName: dto.fullName }),
        ...(dto.department  && { department: dto.department }),
        ...(dto.level       && { level: dto.level }),
        ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
        ...(dto.avatarUrl   !== undefined && { avatarUrl: dto.avatarUrl }),
      },
      select: {
        id: true,
        matricNumber: true,
        email: true,
        fullName: true,
        role: true,
        department: true,
        level: true,
        phoneNumber: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    return updated;
  }

  public static async changePassword(userId: string, dto: { currentPassword: string; newPassword: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 401, ERROR_CODES.UNAUTHORIZED);
    }

    if (!dto.newPassword || dto.newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const newHash = await bcrypt.hash(dto.newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });
  }

  public static async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        matricNumber: true,
        email: true,
        fullName: true,
        role: true,
        department: true,
        level: true,
        createdAt: true,
        bookings: {
          select: {
            id: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
