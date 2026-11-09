import React from 'react';
import {
  CreditCard,
  Target,
  PieChart,
  Plus,
  ArrowDownLeft,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Category, CurrencyConfig, Expense } from '../../types';
import { KmpBudgetEngine } from '../../kmp/KmpEngine';

interface AndroidPreviewProps {
  expenses: Expense[];
  categories: Category[];
  currency: CurrencyConfig;
  overallBudget: number;
}

export const AndroidPreview: React.FC<AndroidPreviewProps> = ({
  expenses,
  categories,
  currency,
  overallBudget,
}) => {
  const now = new Date();
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const dailySafe = KmpBudgetEngine.calculateDailySafeToSpend(
    overallBudget,
    totalSpent,
    currentDay,
    daysInMonth
  );

  return (
    <div className="relative mx-auto select-none">
      {/* Android Device Bezel (Pixel 9 style) */}
      <div className="relative w-[385px] h-[795px] rounded-[48px] p-[10px] bg-neutral-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] ring-1 ring-neutral-700 flex flex-col">
        {/* Camera pinhole */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full z-50 border border-neutral-700/60" />

        {/* Inner Screen */}
        <div className="w-full h-full rounded-[38px] overflow-hidden bg-[#FBFDF8] dark:bg-[#1A1C19] text-neutral-900 dark:text-neutral-100 flex flex-col">
          {/* Android Status Bar */}
          <div className="px-6 pt-3 pb-1 flex items-center justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300">
            <span>{now.getHours()}:{now.getMinutes().toString().padStart(2, '0')}</span>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span>5G</span>
              <span>85%</span>
            </div>
          </div>

          {/* Material 3 Top App Bar */}
          <div className="px-5 py-3 flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
                Jetpack Compose · KMP Core
              </div>
              <h2 className="text-xl font-bold tracking-tight">SpendWise Android</h2>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
              M3
            </div>
          </div>

          {/* Material 3 Content Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar text-xs">
            {/* Material Surface Card */}
            <div className="bg-[#E8F5E9] dark:bg-[#1E2E22] rounded-3xl p-4 text-emerald-950 dark:text-emerald-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[11px] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  KMP Shared Engine
                </span>
                <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 px-2 py-0.5 rounded-full font-bold">
                  com.spendwise.domain
                </span>
              </div>
              <div className="text-2xl font-black tabular-nums">
                {KmpBudgetEngine.formatCurrency(dailySafe, currency)}
                <span className="text-xs font-normal"> / day</span>
              </div>
              <p className="text-[11px] opacity-80">
                Shared logic computed identically via Kotlin Multiplatform commonMain.
              </p>
            </div>

            {/* M3 Expenses List */}
            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider px-1">
                Recent Transactions ({expenses.length})
              </span>

              <div className="space-y-1.5">
                {expenses.slice(0, 7).map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700 flex items-center justify-between shadow-xs"
                  >
                    <div>
                      <div className="font-bold text-neutral-900 dark:text-white">
                        {exp.merchant}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        {exp.paymentMethod}
                      </div>
                    </div>
                    <div className="font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                      -{KmpBudgetEngine.formatCurrency(exp.amount, currency)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Android 3-button or pill navigation bar */}
          <div className="py-2 flex justify-center">
            <div className="w-24 h-1 bg-neutral-400 dark:bg-neutral-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
