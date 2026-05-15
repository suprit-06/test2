import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createCategory,
  createRecurringItem,
  createTransaction,
  deleteTransaction,
  exportTransactionsCsv,
  getDashboard,
  listBudgets,
  listCategories,
  listRecurringItems,
  listTransactions,
  updateRecurringItem,
  updateTransaction,
  upsertBudget
} from '../services/finance.service.js';
import { asyncHandler } from '../utils/http.js';

export const financeRouter = Router();
financeRouter.use(requireAuth);

financeRouter.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    res.json(await getDashboard(req.user!.userId));
  })
);

financeRouter.get(
  '/transactions',
  asyncHandler(async (req, res) => {
    res.json(await listTransactions(req.user!.userId, req.query));
  })
);

financeRouter.post(
  '/transactions',
  asyncHandler(async (req, res) => {
    res.status(201).json(await createTransaction(req.user!.userId, req.body));
  })
);

financeRouter.patch(
  '/transactions/:id',
  asyncHandler(async (req, res) => {
    res.json(await updateTransaction(req.user!.userId, req.params.id, req.body));
  })
);

financeRouter.delete(
  '/transactions/:id',
  asyncHandler(async (req, res) => {
    res.json(await deleteTransaction(req.user!.userId, req.params.id));
  })
);

financeRouter.get(
  '/transactions/export.csv',
  asyncHandler(async (req, res) => {
    const csv = await exportTransactionsCsv(req.user!.userId, req.query);
    res.header('Content-Type', 'text/csv');
    res.attachment('spendwise-transactions.csv');
    res.send(csv);
  })
);

financeRouter.get(
  '/categories',
  asyncHandler(async (req, res) => {
    res.json(await listCategories(req.user!.userId));
  })
);

financeRouter.post(
  '/categories',
  asyncHandler(async (req, res) => {
    res.status(201).json(await createCategory(req.user!.userId, req.body));
  })
);

financeRouter.get(
  '/budgets',
  asyncHandler(async (req, res) => {
    res.json(await listBudgets(req.user!.userId, req.query));
  })
);

financeRouter.put(
  '/budgets',
  asyncHandler(async (req, res) => {
    res.json(await upsertBudget(req.user!.userId, req.body));
  })
);

financeRouter.get(
  '/recurring',
  asyncHandler(async (req, res) => {
    res.json(await listRecurringItems(req.user!.userId));
  })
);

financeRouter.post(
  '/recurring',
  asyncHandler(async (req, res) => {
    res.status(201).json(await createRecurringItem(req.user!.userId, req.body));
  })
);

financeRouter.patch(
  '/recurring/:id',
  asyncHandler(async (req, res) => {
    res.json(await updateRecurringItem(req.user!.userId, req.params.id, req.body));
  })
);
