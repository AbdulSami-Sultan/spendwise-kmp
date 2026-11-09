import React from 'react';
import {
  Globe,
  Moon,
  Sun,
  Download,
  RotateCcw,
  Trash2,
  Cloud,
  ShieldCheck,
  ChevronRight,
  Info,
  Apple,
} from 'lucide-react';
import { CurrencyCode, CurrencyConfig, Expense } from '../../types';
import { CURRENCIES } from '../../data/initialData';

interface SettingsViewProps {
  currentCurrency: CurrencyConfig;
  onSelectCurrency: (code: CurrencyCode) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onResetSampleData: () => void;
  onClearAllExpenses: () => void;
  expenses: Expense[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentCurrency,
  onSelectCurrency,
  isDarkMode,
  onToggleDarkMode,
  onResetSampleData,
  onClearAllExpenses,
  expenses,
}) => {
  const exportCSV = () => {
    if (expenses.length === 0) return;
    const headers = ['ID', 'Date', 'Merchant', 'Category', 'Amount', 'PaymentMethod', 'Note', 'IsRecurring'];
    const rows = expenses.map((e) => [
      e.id,
      new Date(e.timestamp).toISOString(),
      `"${e.merchant.replace(/"/g, '""')}"`,
      e.categoryId,
      e.amount.toFixed(2),
      e.paymentMethod,
      `"${(e.note || '').replace(/"/g, '""')}"`,
      e.isRecurring ? 'TRUE' : 'FALSE',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SpendWise_Expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-24 pt-2 space-y-4 no-scrollbar">
      {/* Header */}
      <div className="flex items-end justify-between pt-1">
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400 tracking-wide uppercase">
            Preferences & Data
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Settings
          </h1>
        </div>
      </div>

      {/* App Branding & Architecture Badge */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-slate-200/60 dark:border-neutral-800 shadow-xs flex items-center gap-4">
        <img
          src="/src/assets/images/spendwise_app_icon_1794255924411.jpg"
          alt="SpendWise App Icon"
          referrerPolicy="no-referrer"
          className="w-14 h-14 rounded-2xl shadow-md border border-slate-200/80 dark:border-neutral-700"
        />
        <div>
          <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
            SpendWise iOS
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            Apple HIG UI · Powered by Kotlin Multiplatform
          </p>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            iOS 18 + KMP 2.0 Engine Active
          </div>
        </div>
      </div>

      {/* Group: Regional & Display */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400 px-1">
          REGIONAL & APPEARANCE
        </span>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/60 dark:border-neutral-800 shadow-xs divide-y divide-slate-100 dark:divide-neutral-800 overflow-hidden">
          {/* Currency */}
          <div className="p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <span className="font-semibold text-slate-800 dark:text-neutral-200">
                Primary Currency
              </span>
            </div>

            <select
              value={currentCurrency.code}
              onChange={(e) => onSelectCurrency(e.target.value as CurrencyCode)}
              className="bg-slate-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-800 dark:text-neutral-200 focus:outline-none"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol}) - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Theme */}
          <div className="p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <span className="font-semibold text-slate-800 dark:text-neutral-200">
                iOS Dark Appearance
              </span>
            </div>

            <button
              onClick={onToggleDarkMode}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                isDarkMode ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-neutral-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  isDarkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Group: Data & Storage */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400 px-1">
          DATA MANAGEMENT
        </span>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/60 dark:border-neutral-800 shadow-xs divide-y divide-slate-100 dark:divide-neutral-800 overflow-hidden">
          {/* Export CSV */}
          <button
            onClick={exportCSV}
            className="w-full p-3.5 flex items-center justify-between text-xs text-left hover:bg-slate-50 dark:hover:bg-neutral-800/40 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-800 dark:text-neutral-200">
                  Export Transactions (CSV)
                </div>
                <div className="text-[11px] text-slate-400">
                  Download {expenses.length} records for Excel or Numbers
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Reset sample data */}
          <button
            onClick={onResetSampleData}
            className="w-full p-3.5 flex items-center justify-between text-xs text-left hover:bg-slate-50 dark:hover:bg-neutral-800/40 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-800 dark:text-neutral-200">
                  Reload Sample Expenses
                </div>
                <div className="text-[11px] text-slate-400">
                  Re-populates 14 realistic sample transactions
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Clear all */}
          <button
            onClick={onClearAllExpenses}
            className="w-full p-3.5 flex items-center justify-between text-xs text-left hover:bg-rose-50/60 dark:hover:bg-rose-950/20 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-rose-600 dark:text-rose-400">
                  Clear All Expenses
                </div>
                <div className="text-[11px] text-slate-400">
                  Remove all transaction records from local storage
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </div>

      {/* Cloud & Privacy info */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-neutral-800/60 text-xs text-slate-500 dark:text-neutral-400 space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-neutral-300">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Local Device Storage & KMP Integrity</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          SpendWise stores your financial transactions locally. The Kotlin Multiplatform engine operates in-memory and handles reactive calculation with zero external telemetry.
        </p>
      </div>
    </div>
  );
};
