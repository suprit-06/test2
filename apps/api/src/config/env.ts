import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  API_PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:3000')
});

// Centralized validation prevents the API from starting with unsafe or missing configuration.
export const env = envSchema.parse(process.env);
