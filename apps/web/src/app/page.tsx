import { AnalyticsCharts } from '../components/Charts';
import { StatCard } from '../components/StatCard';
import { getDashboard } from '../lib/api';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default async function Home() {
  const dashboard = await getDashboard();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ccfbf1,transparent_32%),linear-gradient(135deg,#f8fafc,#eef2ff)] px-4 py-8 dark:from-slate-950 dark:to-slate-900 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col justify-between gap-6 rounded-[2rem] bg-slate-950 p-8 text-white shadow-fintech lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-mint">SpendWise</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
              Personal finance analytics for smarter spending decisions.
            </h1>
            <p className="mt-4 max-w-2xl text-slate-300">
              Track transactions, monitor budgets, manage recurring payments, and convert financial data into clear monthly insights.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm text-slate-300">Current balance</p>
            <p className="mt-2 text-4xl font-bold">{currency.format(dashboard.totals.balance)}</p>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <StatCard label="Total Income" value={currency.format(dashboard.totals.income)} tone="emerald" />
          <StatCard label="Total Expenses" value={currency.format(dashboard.totals.expenses)} tone="rose" />
          <StatCard label="Net Balance" value={currency.format(dashboard.totals.balance)} tone="indigo" />
        </section>

        <AnalyticsCharts dashboard={dashboard} />

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-fintech dark:bg-slate-900">
            <h2 className="text-lg font-semibold">Budget utilization</h2>
            <div className="mt-6 space-y-5">
              {dashboard.budgets.map((budget) => {
                const percent = Math.min(100, Math.round((budget.spent / budget.limit) * 100));
                return (
                  <div key={budget.category}>
                    <div className="flex justify-between text-sm">
                      <span>{budget.category}</span>
                      <span>{percent}% used</span>
                    </div>
                    <div className="mt-2 h-3 rounded-full bg-slate-100">
                      <div className="h-3 rounded-full bg-gradient-to-r from-mint to-indigo-500" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-fintech dark:bg-slate-900">
            <h2 className="text-lg font-semibold">Upcoming recurring payments</h2>
            <div className="mt-6 divide-y divide-slate-100">
              {dashboard.recurring.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-slate-500">Next run: {new Date(item.nextRunAt).toLocaleDateString()}</p>
                  </div>
                  <p className="font-bold">{currency.format(Number(item.amount))}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
