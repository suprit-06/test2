import { Prisma, RecurringFrequency, TransactionType } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { forbidden, notFound } from '../utils/errors.js';

const idSchema = z.string().min(1);
const monthSchema = z.coerce.date().transform((date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)));

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#4f46e5'),
  icon: z.string().trim().min(1).max(40).default('wallet')
});

export const transactionSchema = z.object({
  amount: z.coerce.number().positive().max(999_999_999),
  type: z.nativeEnum(TransactionType),
  note: z.string().trim().max(240).optional(),
  occurredAt: z.coerce.date(),
  categoryId: idSchema
});

export const transactionQuerySchema = z.object({
  search: z.string().trim().optional(),
  type: z.nativeEnum(TransactionType).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  categoryId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(250).default(100)
});

export const budgetSchema = z.object({
  month: monthSchema,
  limitAmount: z.coerce.number().positive().max(999_999_999),
  categoryId: idSchema
});

export const recurringSchema = z.object({
  name: z.string().trim().min(2).max(80),
  amount: z.coerce.number().positive().max(999_999_999),
  frequency: z.nativeEnum(RecurringFrequency),
  nextRunAt: z.coerce.date(),
  active: z.coerce.boolean().default(true)
});

async function assertCategoryOwnership(userId: string, categoryId: string) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) throw forbidden('Category does not belong to the authenticated user');
  return category;
}

function buildTransactionWhere(userId: string, filters: z.infer<typeof transactionQuerySchema>): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = { userId };
  if (filters.type) where.type = filters.type;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.search) where.note = { contains: filters.search, mode: 'insensitive' };
  if (filters.from || filters.to) where.occurredAt = { gte: filters.from, lte: filters.to };
  return where;
}

export async function listCategories(userId: string) {
  return prisma.category.findMany({ where: { userId }, orderBy: { name: 'asc' } });
}

export async function createCategory(userId: string, input: unknown) {
  const data = categorySchema.parse(input);
  return prisma.category.create({ data: { ...data, userId } });
}

export async function listTransactions(userId: string, query: unknown) {
  const filters = transactionQuerySchema.parse(query);

  // Indexed user/date/type/category filters keep history pages fast as transaction volume grows.
  return prisma.transaction.findMany({
    where: buildTransactionWhere(userId, filters),
    include: { category: true },
    orderBy: { occurredAt: 'desc' },
    take: filters.limit
  });
}

export async function createTransaction(userId: string, input: unknown) {
  const data = transactionSchema.parse(input);
  await assertCategoryOwnership(userId, data.categoryId);

  return prisma.transaction.create({
    data: { ...data, amount: new Prisma.Decimal(data.amount), userId },
    include: { category: true }
  });
}

export async function updateTransaction(userId: string, transactionId: string, input: unknown) {
  const existing = await prisma.transaction.findFirst({ where: { id: transactionId, userId } });
  if (!existing) throw notFound('Transaction');

  const data = transactionSchema.partial().parse(input);
  if (data.categoryId) await assertCategoryOwnership(userId, data.categoryId);

  return prisma.transaction.update({
    where: { id: transactionId },
    data: { ...data, amount: data.amount ? new Prisma.Decimal(data.amount) : undefined },
    include: { category: true }
  });
}

export async function deleteTransaction(userId: string, transactionId: string) {
  const existing = await prisma.transaction.findFirst({ where: { id: transactionId, userId } });
  if (!existing) throw notFound('Transaction');
  await prisma.transaction.delete({ where: { id: transactionId } });
  return { deleted: true };
}

export async function upsertBudget(userId: string, input: unknown) {
  const data = budgetSchema.parse(input);
  await assertCategoryOwnership(userId, data.categoryId);

  return prisma.budget.upsert({
    where: { userId_categoryId_month: { userId, categoryId: data.categoryId, month: data.month } },
    update: { limitAmount: new Prisma.Decimal(data.limitAmount) },
    create: { userId, categoryId: data.categoryId, month: data.month, limitAmount: new Prisma.Decimal(data.limitAmount) },
    include: { category: true }
  });
}

export async function listBudgets(userId: string, query: unknown) {
  const month = z.object({ month: monthSchema.optional() }).parse(query).month;
  return prisma.budget.findMany({ where: { userId, month }, include: { category: true }, orderBy: { month: 'desc' } });
}

export async function createRecurringItem(userId: string, input: unknown) {
  const data = recurringSchema.parse(input);
  return prisma.recurringItem.create({ data: { ...data, amount: new Prisma.Decimal(data.amount), userId } });
}

export async function listRecurringItems(userId: string) {
  return prisma.recurringItem.findMany({ where: { userId }, orderBy: [{ active: 'desc' }, { nextRunAt: 'asc' }] });
}

export async function updateRecurringItem(userId: string, recurringId: string, input: unknown) {
  const existing = await prisma.recurringItem.findFirst({ where: { id: recurringId, userId } });
  if (!existing) throw notFound('Recurring item');

  const data = recurringSchema.partial().parse(input);
  return prisma.recurringItem.update({
    where: { id: recurringId },
    data: { ...data, amount: data.amount ? new Prisma.Decimal(data.amount) : undefined }
  });
}

export async function exportTransactionsCsv(userId: string, query: unknown) {
  const transactions = await listTransactions(userId, { ...transactionQuerySchema.parse(query), limit: 250 });
  const rows = transactions.map((transaction) => [
    transaction.id,
    transaction.occurredAt.toISOString(),
    transaction.type,
    transaction.category.name,
    transaction.amount.toString(),
    transaction.note ?? ''
  ]);
  return [['id', 'occurredAt', 'type', 'category', 'amount', 'note'], ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n');
}

export async function getDashboard(userId: string) {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const [income, expenses, byCategory, monthlyTrend, budgets, recurring] = await Promise.all([
    prisma.transaction.aggregate({ where: { userId, type: 'INCOME' }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { userId, type: 'EXPENSE' }, _sum: { amount: true } }),
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, type: 'EXPENSE', occurredAt: { gte: monthStart, lt: monthEnd } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } }
    }),
    prisma.$queryRaw<Array<{ month: Date; income: number; expense: number }>>`
      SELECT date_trunc('month', "occurredAt") AS month,
        SUM(CASE WHEN type = 'INCOME'::"TransactionType" THEN amount ELSE 0 END)::float AS income,
        SUM(CASE WHEN type = 'EXPENSE'::"TransactionType" THEN amount ELSE 0 END)::float AS expense
      FROM "Transaction"
      WHERE "userId" = ${userId}
      GROUP BY 1
      ORDER BY 1 DESC
      LIMIT 12
    `,
    prisma.budget.findMany({ where: { userId, month: monthStart }, include: { category: true } }),
    prisma.recurringItem.findMany({ where: { userId, active: true }, orderBy: { nextRunAt: 'asc' }, take: 5 })
  ]);

  const categoryIds = byCategory.map((item) => item.categoryId);
  const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
  const categoryMap = new Map(categories.map((category) => [category.id, category]));

  // The dashboard returns pre-aggregated, chart-ready data so the frontend avoids heavy client work.
  return {
    totals: {
      income: Number(income._sum.amount ?? 0),
      expenses: Number(expenses._sum.amount ?? 0),
      balance: Number(income._sum.amount ?? 0) - Number(expenses._sum.amount ?? 0)
    },
    byCategory: byCategory.map((item) => ({
      category: categoryMap.get(item.categoryId)?.name ?? 'Uncategorized',
      color: categoryMap.get(item.categoryId)?.color ?? '#64748b',
      amount: Number(item._sum.amount ?? 0)
    })),
    monthlyTrend: monthlyTrend.reverse().map((item) => ({
      month: item.month.toISOString().slice(0, 7),
      income: Number(item.income ?? 0),
      expense: Number(item.expense ?? 0)
    })),
    budgets: budgets.map((budget) => ({
      category: budget.category.name,
      limit: Number(budget.limitAmount),
      spent: Number(byCategory.find((item) => item.categoryId === budget.categoryId)?._sum.amount ?? 0)
    })),
    recurring: recurring.map((item) => ({ ...item, amount: item.amount.toString() }))
  };
}
