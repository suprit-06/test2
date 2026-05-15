import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { ApiError } from '../utils/errors.js';

// Normalizes validation, known domain, Prisma, and runtime errors into predictable API responses.
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: 'Validation failed', issues: error.flatten() });
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({ message: error.message, details: error.details });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'A record with this value already exists' });
    if (error.code === 'P2025') return res.status(404).json({ message: 'Record not found' });
  }

  console.error(error);
  return res.status(500).json({ message: 'Unexpected server error' });
}
