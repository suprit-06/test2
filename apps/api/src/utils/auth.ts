import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type JwtPayload = { userId: string; email: string };

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

// Tokens carry only stable identifiers; sensitive profile data stays in PostgreSQL.
export const signToken = (payload: JwtPayload) => jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
export const verifyToken = (token: string) => jwt.verify(token, env.JWT_SECRET) as JwtPayload;
