import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  Moon,
  Sun,
  Download,
  RotateCcw,
  Trash2,
  ShieldCheck,
  ChevronRight,
  FileSpreadsheet,
  Check,
  X,
  Filter,
  FileText,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Category, CurrencyCode, CurrencyConfig, Expense } from '../../types';
import { CURRENCIES } from '../../data/initialData';
import { KmpBudgetEngine } from '../../kmp/KmpEngine';

interface SettingsViewProps {
  currentCurrency: CurrencyConfig;
  onSelectCurrency: (code: CurrencyCode) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onResetSampleData: () => void;
  onClearAllExpenses: () => void;
  expenses: Expense[];
  categories: Category[];
  onExportSuccess?: (count: number, total: number) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentCurrency,
  onSelectCurrency,
  isDarkMode,
  onToggleDarkMode,
  onResetSampleData,
  onClearAllExpenses,
  expenses,
  categories,
  onExportSuccess,
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'standard' | 'quickbooks'>('standard');
  const [dateFilter, setDateFilter] = useState<'all' | 'month' | '30days'>('all');
  const [isExporting, setIsExporting] = useState(false);

  const categoryMap = categories.reduce<Record<string, string>>((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {});

  // Filter expenses according to selection
  const now = new Date();
  const filteredExpenses = expenses.filter((e) => {
    if (dateFilter === 'all') return true;
    const expDate = new Date(e.timestamp);
    if (dateFilter === 'month') {
      return (
        expDate.getMonth() === now.getMonth() &&
        expDate.getFullYear() === now.getFullYear()
      );
    }
    if (dateFilter === '30days') {
      const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
      return e.timestamp >= thirtyDaysAgo;
    }
    return true;
  });

  const totalExportSum = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const triggerDownload = (format = exportFormat) => {
    if (filteredExpenses.length === 0) return;
    setIsExporting(true);

    let headers: string[] = [];
    let rows: string[][] = [];

    if (format === 'quickbooks') {
      headers = [
        'Transaction Date',
        'Reference ID',
        'Payee / Merchant',
        'Expense Account',
        'Payment Method',
        'Amount (' + currentCurrency.code + ')',
        'Memo / Notes',
        'Receipt Attached',
      ];
      rows = filteredExpenses.map((e) => [
        new Date(e.timestamp).toISOString().slice(0, 10),
        e.id,
        `"${e.merchant.replace(/"/g, '""')}"`,
        `"${(categoryMap[e.categoryId] || 'General Expense').replace(/"/g, '""')}"`,
        `"${e.paymentMethod}"`,
        (e.amount * currentCurrency.rateAgainstUSD).toFixed(2),
        `"${(e.note || '').replace(/"/g, '""')}"`,
        e.receiptImage ? 'YES' : 'NO',
      ]);
    } else {
      headers = [
        'ID',
        'Date',
        'Time',
        'Merchant',
        'Category',
        'Amount',
        'Currency',
        'Payment Method',
        'Is Recurring',
        'Notes',
        'Has Receipt',
      ];
      rows = filteredExpenses.map((e) => {
        const d = new Date(e.timestamp);
        return [
          e.id,
          d.toISOString().slice(0, 10),
          d.toTimeString().slice(0, 8),
          `"${e.merchant.replace(/"/g, '""')}"`,
          `"${(categoryMap[e.categoryId] || 'Uncategorized').replace(/"/g, '""')}"`,
          (e.amount * currentCurrency.rateAgainstUSD).toFixed(2),
          currentCurrency.code,
          `"${e.paymentMethod}"`,
          e.isRecurring ? 'TRUE' : 'FALSE',
          `"${(e.note || '').replace(/"/g, '""')}"`,
          e.receiptImage ? 'YES' : 'NO',
        ];
      });
    }

    // Prepend UTF-8 BOM (\uFEFF) for Microsoft Excel and Apple Numbers UTF-8 compatibility
    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const formattedDate = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `SpendWise_Accounting_Export_${format}_${formattedDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setIsExporting(false);
      setIsExportModalOpen(false);
      onExportSuccess?.(filteredExpenses.length, totalExportSum);
    }, 400);
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

      {/* Featured Card: Export Data to CSV (External Accounting) */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400 px-1">
          ACCOUNTING & EXPORTS
        </span>

        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/20 dark:via-neutral-900 dark:to-teal-950/20 rounded-3xl p-5 border border-emerald-200/70 dark:border-emerald-800/40 shadow-xs space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <FileSpreadsheet className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  Export Data to CSV
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                  Standard format for accountants, Excel, Numbers & QuickBooks
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-2 text-xs py-1">
            <div className="p-2.5 rounded-xl bg-white/80 dark:bg-neutral-800/80 border border-slate-200/60 dark:border-neutral-700/60">
              <div className="text-[10px] text-slate-400 font-medium">Available Records</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                {expenses.length} Transactions
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/80 dark:bg-neutral-800/80 border border-slate-200/60 dark:border-neutral-700/60">
              <div className="text-[10px] text-slate-400 font-medium">Total Ledger Value</div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {KmpBudgetEngine.formatCurrency(
                  expenses.reduce((s, e) => s + e.amount, 0),
                  currentCurrency
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => triggerDownload('standard')}
              disabled={expenses.length === 0 || isExporting}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Exporting...' : 'Quick Download CSV'}</span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              disabled={expenses.length === 0}
              className="py-2.5 px-3 rounded-xl bg-white dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-700 border border-slate-200 dark:border-neutral-700 text-xs font-semibold text-slate-800 dark:text-neutral-200 flex items-center gap-1.5 transition-colors"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Customize</span>
            </button>
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

      {/* Group: Data Management */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400 px-1">
          DATA MANAGEMENT
        </span>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/60 dark:border-neutral-800 shadow-xs divide-y divide-slate-100 dark:divide-neutral-800 overflow-hidden">
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

      {/* Interactive Customize & Export Modal Sheet */}
      <AnimatePresence>
        {isExportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#F2F2F7] dark:bg-[#1C1C1E] text-slate-900 dark:text-white rounded-[28px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-semibold text-sm">Accounting CSV Export</h3>
                </div>
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-200 dark:bg-neutral-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar text-xs">
                {/* Format selection */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-xs space-y-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                    ACCOUNTING SOFTWARE FORMAT
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setExportFormat('standard')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        exportFormat === 'standard'
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <div className="font-bold text-slate-900 dark:text-white">
                        Standard CSV
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                        Excel, Google Sheets, Numbers
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExportFormat('quickbooks')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        exportFormat === 'quickbooks'
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <div className="font-bold text-slate-900 dark:text-white">
                        QuickBooks / Xero
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                        Double-entry ledger columns
                      </div>
                    </button>
                  </div>
                </div>

                {/* Date range filter */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-xs space-y-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                    DATE RANGE
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-neutral-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setDateFilter('all')}
                      className={`py-1.5 rounded-lg font-medium transition-all ${
                        dateFilter === 'all'
                          ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                          : 'text-slate-500 dark:text-neutral-400'
                      }`}
                    >
                      All Time
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateFilter('month')}
                      className={`py-1.5 rounded-lg font-medium transition-all ${
                        dateFilter === 'month'
                          ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                          : 'text-slate-500 dark:text-neutral-400'
                      }`}
                    >
                      This Month
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateFilter('30days')}
                      className={`py-1.5 rounded-lg font-medium transition-all ${
                        dateFilter === '30days'
                          ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                          : 'text-slate-500 dark:text-neutral-400'
                      }`}
                    >
                      Last 30 Days
                    </button>
                  </div>
                </div>

                {/* Live Data Preview */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                      FILE PREVIEW ({filteredExpenses.length} ROWS)
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {KmpBudgetEngine.formatCurrency(totalExportSum, currentCurrency)}
                    </span>
                  </div>

                  <div className="border border-slate-100 dark:border-neutral-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-neutral-800 text-[11px]">
                    {filteredExpenses.slice(0, 3).map((e) => (
                      <div
                        key={e.id}
                        className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-neutral-850"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {e.merchant}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(e.timestamp).toLocaleDateString()} · {categoryMap[e.categoryId] || 'General'}
                          </div>
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                          -{KmpBudgetEngine.formatCurrency(e.amount, currentCurrency)}
                        </span>
                      </div>
                    ))}
                    {filteredExpenses.length > 3 && (
                      <div className="p-2 text-center text-[10px] text-slate-400 bg-slate-50 dark:bg-neutral-850">
                        + {filteredExpenses.length - 3} more rows in downloaded file
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => triggerDownload(exportFormat)}
                  disabled={filteredExpenses.length === 0 || isExporting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Generating CSV...' : 'Download CSV File'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
