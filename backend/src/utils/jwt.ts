import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { RoleType } from '../constants/roles.js';

export interface JwtPayload {
  userId: string;
  matricNumber: string;
  role: RoleType;
}

export function generateToken(payload: JwtPayload): string {
  // Use any cast for expiresIn since string is valid in jsonwebtoken
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
