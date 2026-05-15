import { PrismaClient, RecurringFrequency, TransactionType } from '@prisma/client';
import { hashPassword } from '../src/utils/auth.js';

const prisma = new PrismaClient();

function monthsAgo(months: number) {
  const date = new Date();
  date.setUTCMonth(date.getUTCMonth() - months);
  return date;
}

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@spendwise.local' },
    update: {},
    create: { name: 'Demo User', email: 'demo@spendwise.local', passwordHash: await hashPassword('SpendWise123') }
  });

  const categories = await Promise.all(
    [
      ['Salary', '#16a34a'],
      ['Housing', '#2563eb'],
      ['Food', '#f97316'],
      ['Transport', '#7c3aed'],
      ['Entertainment', '#db2777']
    ].map(([name, color]) =>
      prisma.category.upsert({
        where: { userId_name: { userId: user.id, name } },
        update: { color },
        create: { userId: user.id, name, color }
      })
    )
  );

  await prisma.$transaction([
    prisma.transaction.deleteMany({ where: { userId: user.id } }),
    prisma.budget.deleteMany({ where: { userId: user.id } }),
    prisma.recurringItem.deleteMany({ where: { userId: user.id } })
  ]);

  await prisma.transaction.createMany({
    data: [
      { userId: user.id, categoryId: categories[0].id, type: TransactionType.INCOME, amount: 5200, occurredAt: monthsAgo(0), note: 'Monthly salary' },
      { userId: user.id, categoryId: categories[1].id, type: TransactionType.EXPENSE, amount: 1450, occurredAt: monthsAgo(0), note: 'Rent' },
      { userId: user.id, categoryId: categories[2].id, type: TransactionType.EXPENSE, amount: 420, occurredAt: monthsAgo(0), note: 'Groceries and dining' },
      { userId: user.id, categoryId: categories[3].id, type: TransactionType.EXPENSE, amount: 165, occurredAt: monthsAgo(0), note: 'Transit pass' },
      { userId: user.id, categoryId: categories[4].id, type: TransactionType.EXPENSE, amount: 95, occurredAt: monthsAgo(0), note: 'Streaming and events' },
      { userId: user.id, categoryId: categories[0].id, type: TransactionType.INCOME, amount: 5150, occurredAt: monthsAgo(1), note: 'Monthly salary' },
      { userId: user.id, categoryId: categories[2].id, type: TransactionType.EXPENSE, amount: 510, occurredAt: monthsAgo(1), note: 'Groceries' },
      { userId: user.id, categoryId: categories[3].id, type: TransactionType.EXPENSE, amount: 175, occurredAt: monthsAgo(1), note: 'Fuel and rideshare' }
    ]
  });

  const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));
  await prisma.budget.createMany({
    data: [
      { userId: user.id, categoryId: categories[1].id, month: monthStart, limitAmount: 1600 },
      { userId: user.id, categoryId: categories[2].id, month: monthStart, limitAmount: 650 },
      { userId: user.id, categoryId: categories[3].id, month: monthStart, limitAmount: 250 }
    ]
  });

  await prisma.recurringItem.createMany({
    data: [
      { userId: user.id, name: 'Rent', amount: 1450, frequency: RecurringFrequency.MONTHLY, nextRunAt: monthStart },
      { userId: user.id, name: 'Streaming bundle', amount: 35, frequency: RecurringFrequency.MONTHLY, nextRunAt: monthStart }
    ]
  });

  console.log('Seeded demo@spendwise.local / SpendWise123');
}

main().finally(() => prisma.$disconnect());
