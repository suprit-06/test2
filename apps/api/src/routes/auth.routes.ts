import { Router } from 'express';
import { login, register } from '../services/auth.service.js';
import { asyncHandler } from '../utils/http.js';

export const authRouter = Router();

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    res.status(201).json(await register(req.body));
  })
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    res.json(await login(req.body));
  })
);
