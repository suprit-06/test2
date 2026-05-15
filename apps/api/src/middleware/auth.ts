import type { NextFunction, Request, Response } from 'express';
import { verifyToken, type JwtPayload } from '../utils/auth.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Protects finance APIs by requiring a valid Bearer token before controllers run.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const [scheme, token] = req.header('authorization')?.split(' ') ?? [];
  if (scheme?.toLowerCase() !== 'bearer' || !token) return res.status(401).json({ message: 'Authentication required' });

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
