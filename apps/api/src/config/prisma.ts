import { PrismaClient } from '@prisma/client';

// A single Prisma client is shared across services so database connections remain bounded.
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error']
});
