import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart2,
  Calendar,
  CreditCard,
  PieChart as PieIcon,
  Award,
} from 'lucide-react';
import { Category, CurrencyConfig, Expense } from '../../types';
import { KmpBudgetEngine } from '../../kmp/KmpEngine';

interface AnalyticsViewProps {
  expenses: Expense[];
  categories: Category[];
  currency: CurrencyConfig;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  expenses,
  categories,
  currency,
}) => {
  const [timeframe, setTimeframe] = useState<'month' | '7days'>('month');

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Category totals
  const categoryTotals = categories.map((cat) => {
    const spent = expenses
      .filter((e) => e.categoryId === cat.id)
      .reduce((sum, e) => sum + e.amount, 0);
    const percent = totalSpent > 0 ? (spent / totalSpent) * 100 : 0;
    return {
      ...cat,
      spent,
      percent,
    };
  }).filter((c) => c.spent > 0).sort((a, b) => b.spent - a.spent);

  // Top Merchants
  const merchantTotals = expenses.reduce<Record<string, number>>((acc, exp) => {
    acc[exp.merchant] = (acc[exp.merchant] || 0) + exp.amount;
    return acc;
  }, {});
  const topMerchants = Object.entries(merchantTotals)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Daily spend distribution for current month (days 1 to 31)
  const daysInMonth = 30;
  const dayBuckets = Array.from({ length: 14 }, (_, i) => {
    const day = i + 1;
    const daySpend = expenses.filter((e) => {
      const d = new Date(e.timestamp).getDate();
      return d === day;
    }).reduce((sum, e) => sum + e.amount, 0);

    return { day, spend: daySpend };
  });
  const maxDaySpend = Math.max(...dayBuckets.map((d) => d.spend), 100);

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-24 pt-2 space-y-4 no-scrollbar">
      {/* Header */}
      <div className="flex items-end justify-between pt-1">
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400 tracking-wide uppercase">
            Financial Insights
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Analytics
          </h1>
        </div>

        {/* Segmented Timeframe Control */}
        <div className="flex items-center p-0.5 bg-slate-200 dark:bg-neutral-800 rounded-lg text-xs">
          <button
            onClick={() => setTimeframe('month')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              timeframe === 'month'
                ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-neutral-400'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeframe('7days')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              timeframe === '7days'
                ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-neutral-400'
            }`}
          >
            Last 7D
          </button>
        </div>
      </div>

      {/* Daily Spend Trend Chart */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-slate-200/60 dark:border-neutral-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-xs text-slate-700 dark:text-neutral-300">
              Daily Spending Velocity
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 tabular-nums">
            Avg: {KmpBudgetEngine.formatCurrency(totalSpent / Math.max(1, dayBuckets.length), currency)}/day
          </span>
        </div>

        {/* Bar chart bars */}
        <div className="h-28 flex items-end justify-between gap-1 pt-4 pb-1">
          {dayBuckets.map((b) => {
            const heightPercent = Math.max(8, (b.spend / maxDaySpend) * 100);
            return (
              <div key={b.day} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-7 px-1.5 py-0.5 rounded bg-slate-900 text-[10px] text-white pointer-events-none transition-opacity whitespace-nowrap z-20">
                  {KmpBudgetEngine.formatCurrency(b.spend, currency)}
                </div>

                <div
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    b.spend > 100
                      ? 'bg-emerald-500'
                      : b.spend > 0
                      ? 'bg-emerald-300 dark:bg-emerald-700'
                      : 'bg-slate-100 dark:bg-neutral-800'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[9px] text-slate-400 tabular-nums">
                  {b.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown Rings & Distribution */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-slate-200/60 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-xs text-slate-700 dark:text-neutral-300">
              Spending by Category
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
            {KmpBudgetEngine.formatCurrency(totalSpent, currency)}
          </span>
        </div>

        {/* Stacked Distribution Bar */}
        <div className="h-3.5 w-full bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden flex">
          {categoryTotals.map((cat) => (
            <div
              key={cat.id}
              style={{
                width: `${cat.percent}%`,
                backgroundColor: cat.color,
              }}
              title={`${cat.name}: ${cat.percent.toFixed(1)}%`}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all"
            />
          ))}
        </div>

        {/* Category List Rows */}
        <div className="space-y-2 pt-1 divide-y divide-slate-100 dark:divide-neutral-800">
          {categoryTotals.map((cat) => (
            <div key={cat.id} className="pt-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-medium text-slate-800 dark:text-neutral-200">
                  {cat.name}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-slate-400 tabular-nums text-[11px]">
                  {cat.percent.toFixed(1)}%
                </span>
                <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                  {KmpBudgetEngine.formatCurrency(cat.spent, currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Merchants Leaderboard */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-slate-200/60 dark:border-neutral-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-semibold text-xs text-slate-700 dark:text-neutral-300">
            Top Merchants
          </h3>
        </div>

        <div className="space-y-2">
          {topMerchants.map((m, idx) => (
            <div
              key={m.name}
              className="flex items-center justify-between text-xs py-1 border-b border-slate-50 dark:border-neutral-850 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="w-4 text-[11px] font-bold text-slate-400 tabular-nums">
                  {idx + 1}
                </span>
                <span className="font-medium text-slate-800 dark:text-neutral-200">
                  {m.name}
                </span>
              </div>
              <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                {KmpBudgetEngine.formatCurrency(m.amount, currency)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
