'use client';

import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Dashboard } from '../lib/api';

export function AnalyticsCharts({ dashboard }: { dashboard: Dashboard }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-3xl bg-white p-6 shadow-fintech dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Income vs Expense</h2>
        {/* ResponsiveContainer keeps charts usable on mobile, tablet, and desktop layouts. */}
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboard.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expense" fill="#f43f5e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-fintech dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Category Distribution</h2>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={dashboard.byCategory} dataKey="amount" nameKey="category" innerRadius={65} outerRadius={105} paddingAngle={4}>
                {dashboard.byCategory.map((item) => (
                  <Cell key={item.category} fill={item.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
