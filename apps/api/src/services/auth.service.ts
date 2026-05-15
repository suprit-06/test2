import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/errors.js';
import { hashPassword, signToken, verifyPassword } from '../utils/auth.js';

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128)
});

export const loginSchema = registerSchema.pick({ email: true, password: true });

export async function register(input: z.infer<typeof registerSchema>) {
  const data = registerSchema.parse(input);
  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, passwordHash: await hashPassword(data.password) },
    select: { id: true, name: true, email: true }
  });

  return { user, token: signToken({ userId: user.id, email: user.email }) };
}

export async function login(input: z.infer<typeof loginSchema>) {
  const data = loginSchema.parse(input);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
    throw new ApiError(401, 'Invalid credentials');
  }

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token: signToken({ userId: user.id, email: user.email })
  };
}
