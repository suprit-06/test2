type StatCardProps = {
  label: string;
  value: string;
  tone: 'emerald' | 'rose' | 'indigo';
};

const toneMap = {
  emerald: 'from-emerald-500 to-teal-500',
  rose: 'from-rose-500 to-orange-500',
  indigo: 'from-indigo-500 to-sky-500'
};

export function StatCard({ label, value, tone }: StatCardProps) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-fintech dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <div className={`mt-4 h-2 rounded-full bg-gradient-to-r ${toneMap[tone]}`} />
      <p className="mt-5 text-3xl font-bold text-slate-950 dark:text-white">{value}</p>
    </section>
  );
}
