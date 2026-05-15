export type Dashboard = {
  totals: { income: number; expenses: number; balance: number };
  byCategory: Array<{ category: string; color: string; amount: number }>;
  monthlyTrend: Array<{ month: string; income: number; expense: number }>;
  budgets: Array<{ category: string; limit: number; spent: number }>;
  recurring: Array<{ id: string; name: string; amount: string; nextRunAt: string }>;
};

const fallbackDashboard: Dashboard = {
  totals: { income: 5200, expenses: 2130, balance: 3070 },
  byCategory: [
    { category: 'Housing', color: '#2563eb', amount: 1450 },
    { category: 'Food', color: '#f97316', amount: 420 },
    { category: 'Transport', color: '#7c3aed', amount: 165 },
    { category: 'Entertainment', color: '#db2777', amount: 95 }
  ],
  monthlyTrend: [
    { month: '2026-01', income: 5000, expense: 2600 },
    { month: '2026-02', income: 5200, expense: 2350 },
    { month: '2026-03', income: 5100, expense: 2480 },
    { month: '2026-04', income: 5300, expense: 2290 },
    { month: '2026-05', income: 5200, expense: 2130 }
  ],
  budgets: [
    { category: 'Housing', limit: 1600, spent: 1450 },
    { category: 'Food', limit: 650, spent: 420 },
    { category: 'Transport', limit: 250, spent: 165 }
  ],
  recurring: [
    { id: '1', name: 'Rent', amount: '1450', nextRunAt: new Date().toISOString() },
    { id: '2', name: 'Streaming', amount: '35', nextRunAt: new Date().toISOString() }
  ]
};

async function getDemoToken(baseUrl: string) {
  const email = process.env.SPENDWISE_DEMO_EMAIL;
  const password = process.env.SPENDWISE_DEMO_PASSWORD;
  if (!email || !password) return undefined;

  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store'
  });

  if (!response.ok) return undefined;
  const data = (await response.json()) as { token?: string };
  return data.token;
}

// The dashboard prefers live API data, but gracefully renders a safe demo dataset during first-time setup.
export async function getDashboard(): Promise<Dashboard> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return fallbackDashboard;

  try {
    const token = process.env.SPENDWISE_API_TOKEN ?? (await getDemoToken(baseUrl));
    const response = await fetch(`${baseUrl}/dashboard`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store'
    });

    if (!response.ok) return fallbackDashboard;
    return response.json();
  } catch {
    return fallbackDashboard;
  }
}
