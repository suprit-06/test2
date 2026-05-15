import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.js';
import { authRouter } from './routes/auth.routes.js';
import { financeRouter } from './routes/finance.routes.js';

export const app = express();

// Security, CORS, request logging, and JSON parsing are applied before all route modules.
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'spendwise-api' }));
app.use('/api/auth', authRouter);
app.use('/api', financeRouter);
app.use(errorHandler);
