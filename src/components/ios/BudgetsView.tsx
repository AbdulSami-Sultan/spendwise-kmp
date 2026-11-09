import React from 'react';
import {
  Target,
  Sliders,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Utensils,
  ShoppingCart,
  Car,
  ShoppingBag,
  Film,
  Zap,
  HeartPulse,
  Repeat,
} from 'lucide-react';
import { Category, CurrencyConfig, Expense } from '../../types';
import { KmpBudgetEngine } from '../../kmp/KmpEngine';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Utensils,
  ShoppingCart,
  Car,
  ShoppingBag,
  Film,
  Zap,
  HeartPulse,
  Repeat,
};

interface BudgetsViewProps {
  categories: Category[];
  expenses: Expense[];
  overallBudget: number;
  currency: CurrencyConfig;
  onOpenAdjustBudgets: () => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  categories,
  expenses,
  overallBudget,
  currency,
  onOpenAdjustBudgets,
}) => {
  const now = new Date();
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const budgetStatuses = KmpBudgetEngine.computeBudgetStatuses(
    overallBudget,
    categories,
    expenses,
    currentDay,
    daysInMonth
  );

  const overallStatus = budgetStatuses[0];
  const categoryStatuses = budgetStatuses.slice(1);

  const totalSpent = overallStatus?.spent || 0;
  const projectedMonthEnd = KmpBudgetEngine.projectMonthEndSpend(totalSpent, currentDay, daysInMonth);

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-24 pt-2 space-y-4 no-scrollbar">
      {/* Header */}
      <div className="flex items-end justify-between pt-1">
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400 tracking-wide uppercase">
            Monthly Limits & Targets
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Budgets
          </h1>
        </div>

        <button
          onClick={onOpenAdjustBudgets}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-200/80 dark:bg-neutral-800 text-xs font-semibold text-slate-800 dark:text-neutral-200 hover:bg-slate-300 dark:hover:bg-neutral-700 transition-colors"
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Adjust</span>
        </button>
      </div>

      {/* Main Total Budget Ring & Projection Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-slate-200/60 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
            Total Monthly Target
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
            Day {currentDay} of {daysInMonth}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {KmpBudgetEngine.formatCurrency(totalSpent, currency)}
            </div>
            <div className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              of {KmpBudgetEngine.formatCurrency(overallBudget, currency)} allocated
            </div>
          </div>

          {/* Radial progress ring SVG */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-neutral-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={
                  totalSpent > overallBudget
                    ? 'text-rose-500'
                    : totalSpent / overallBudget > 0.8
                    ? 'text-amber-500'
                    : 'text-emerald-500'
                }
                strokeDasharray={`${Math.min(100, (totalSpent / overallBudget) * 100)}, 100`}
                strokeLinecap="round"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute font-bold text-xs tabular-nums text-slate-800 dark:text-neutral-200">
              {Math.round((totalSpent / overallBudget) * 100)}%
            </div>
          </div>
        </div>

        {/* Projection Strip */}
        <div className="pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-neutral-300">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>KMP Pace Projection:</span>
          </div>
          <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
            {KmpBudgetEngine.formatCurrency(projectedMonthEnd, currency)}
            {projectedMonthEnd > overallBudget ? (
              <span className="text-rose-500 font-medium ml-1">
                (+{KmpBudgetEngine.formatCurrency(projectedMonthEnd - overallBudget, currency)})
              </span>
            ) : (
              <span className="text-emerald-500 font-medium ml-1">
                (Under by {KmpBudgetEngine.formatCurrency(overallBudget - projectedMonthEnd, currency)})
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
            CATEGORY ALLOCATIONS
          </span>
          <span className="text-xs text-slate-400">
            {categoryStatuses.filter((s) => s.isOverBudget).length > 0 && (
              <span className="text-rose-500 font-semibold">
                {categoryStatuses.filter((s) => s.isOverBudget).length} Over Budget
              </span>
            )}
          </span>
        </div>

        <div className="space-y-2.5">
          {categoryStatuses.map((status) => {
            const cat = categories.find((c) => c.id === status.categoryId);
            if (!cat) return null;
            const Icon = CATEGORY_ICONS[cat.icon] || Utensils;
            const percent = Math.min(100, status.percentUsed);

            return (
              <div
                key={cat.id}
                className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-slate-200/60 dark:border-neutral-800 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-white">
                        {cat.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-neutral-400 flex items-center gap-1">
                        <span>Safe:</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {KmpBudgetEngine.formatCurrency(status.dailySafeToSpend, currency)}/day
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-sm text-slate-900 dark:text-white tabular-nums">
                      {KmpBudgetEngine.formatCurrency(status.spent, currency)}
                    </div>
                    <div className="text-[11px] text-slate-400 tabular-nums">
                      of {KmpBudgetEngine.formatCurrency(status.allocated, currency)}
                    </div>
                  </div>
                </div>

                {/* Meter Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        status.isOverBudget
                          ? 'bg-rose-500'
                          : status.isNearLimit
                          ? 'bg-amber-400'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      className={`font-medium ${
                        status.isOverBudget
                          ? 'text-rose-500 font-semibold'
                          : status.isNearLimit
                          ? 'text-amber-500'
                          : 'text-slate-500 dark:text-neutral-400'
                      }`}
                    >
                      {status.isOverBudget
                        ? `Exceeded by ${KmpBudgetEngine.formatCurrency(status.spent - status.allocated, currency)}`
                        : `${KmpBudgetEngine.formatCurrency(status.remaining, currency)} remaining`}
                    </span>
                    <span className="text-slate-400 tabular-nums">
                      {Math.round(status.percentUsed)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
