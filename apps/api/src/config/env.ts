import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  API_PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:3000')
    .transform((value) => value.split(',').map((origin) => origin.trim()).filter(Boolean))
});

// Most deployment platforms inject PORT; local development can still use API_PORT.
const rawEnv = { ...process.env, API_PORT: process.env.PORT ?? process.env.API_PORT };

// Centralized validation prevents the API from starting with unsafe or missing configuration.
export const env = envSchema.parse(rawEnv);
