import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  Camera,
  Filter,
  Trash2,
  Receipt,
  Utensils,
  ShoppingCart,
  Car,
  ShoppingBag,
  Film,
  Zap,
  HeartPulse,
  Repeat,
  Sparkles,
  ChevronRight,
  TrendingDown,
  Calendar,
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

interface SpendingViewProps {
  expenses: Expense[];
  categories: Category[];
  currency: CurrencyConfig;
  overallBudget: number;
  onOpenAddExpense: () => void;
  onOpenReceiptScanner: () => void;
  onDeleteExpense: (id: string) => void;
  onSelectExpenseForReceipt?: (receiptUrl: string) => void;
}

export const SpendingView: React.FC<SpendingViewProps> = ({
  expenses,
  categories,
  currency,
  overallBudget,
  onOpenAddExpense,
  onOpenReceiptScanner,
  onDeleteExpense,
  onSelectExpenseForReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [swipedExpenseId, setSwipedExpenseId] = useState<string | null>(null);

  const now = new Date();
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const dailySafe = KmpBudgetEngine.calculateDailySafeToSpend(
    overallBudget,
    totalSpent,
    currentDay,
    daysInMonth
  );
  const healthScore = KmpBudgetEngine.calculateBudgetHealthScore(
    overallBudget,
    totalSpent,
    currentDay,
    daysInMonth
  );

  // Filter expenses
  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.note && e.note.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategoryFilter === 'all' || e.categoryId === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  // Group expenses by Date label (Today, Yesterday, Earlier)
  const groupedExpenses = filteredExpenses.reduce<Record<string, Expense[]>>((acc, exp) => {
    const expDate = new Date(exp.timestamp);
    const isToday = expDate.toDateString() === now.toDateString();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = expDate.toDateString() === yesterday.toDateString();

    let label = 'Earlier This Month';
    if (isToday) label = 'Today';
    else if (isYesterday) label = 'Yesterday';
    else {
      label = expDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    }

    if (!acc[label]) acc[label] = [];
    acc[label].push(exp);
    return acc;
  }, {});

  const categoryMap = categories.reduce<Record<string, Category>>((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-24 pt-2 space-y-4 no-scrollbar">
      {/* iOS Large Header */}
      <div className="flex items-end justify-between pt-1">
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400 tracking-wide uppercase">
            {now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Daily Spending
          </h1>
        </div>

        {/* Quick AI Bill Scan Action */}
        <button
          onClick={onOpenReceiptScanner}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 dark:bg-emerald-950/40 border border-emerald-500/30 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 transition-colors shadow-xs"
        >
          <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Read Bill</span>
        </button>
      </div>

      {/* KMP Daily Safe-To-Spend Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white p-5 shadow-lg">
        {/* Subtle decorative glow */}
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              KMP Safe-to-Spend
            </span>
            <span className="text-emerald-400 font-semibold">
              {daysRemaining} days left in cycle
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-extrabold tracking-tight tabular-nums text-emerald-400">
                {KmpBudgetEngine.formatCurrency(dailySafe, currency)}
                <span className="text-sm font-normal text-slate-300"> / day</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Remaining pool: {KmpBudgetEngine.formatCurrency(Math.max(0, overallBudget - totalSpent), currency)}
              </div>
            </div>

            {/* Health pill */}
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-300">Pace Health</div>
              <div className="text-base font-bold text-white tabular-nums">
                {healthScore}/100
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1 pt-1">
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  totalSpent > overallBudget
                    ? 'bg-rose-500'
                    : totalSpent / overallBudget > 0.8
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, (totalSpent / overallBudget) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 tabular-nums">
              <span>Spent {KmpBudgetEngine.formatCurrency(totalSpent, currency)}</span>
              <span>Budget {KmpBudgetEngine.formatCurrency(overallBudget, currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Bill Reader Quick Action Card */}
      <div
        onClick={onOpenReceiptScanner}
        className="bg-white dark:bg-neutral-900 rounded-2xl p-3.5 border border-emerald-500/30 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-500/60 transition-all group select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Camera className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Read Bill from Image</span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.2 rounded">
                AI Vision
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-neutral-400">
              Upload bill photo to auto-extract merchant, total & items
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>

      {/* Search & Category Filter Pills */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions, notes..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-xl text-xs placeholder:text-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategoryFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 border border-slate-200/80 dark:border-neutral-800 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategoryFilter === cat.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 border border-slate-200/80 dark:border-neutral-800 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Transactions List */}
      {Object.keys(groupedExpenses).length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 text-center space-y-2 border border-slate-200/60 dark:border-neutral-800">
          <Receipt className="w-8 h-8 mx-auto text-slate-300 dark:text-neutral-600" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-neutral-300">
            No expenses found
          </h3>
          <p className="text-xs text-slate-400">
            {searchQuery
              ? 'Try adjusting your search query or filter'
              : 'Tap the + button to record your first expense today'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedExpenses).map(([groupTitle, items]) => (
            <div key={groupTitle} className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                  {groupTitle}
                </span>
                <span className="text-xs font-medium text-slate-400 tabular-nums">
                  {KmpBudgetEngine.formatCurrency(
                    items.reduce((s, i) => s + i.amount, 0),
                    currency
                  )}
                </span>
              </div>

              {/* iOS Inset Grouped Card */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-neutral-800 shadow-xs divide-y divide-slate-100 dark:divide-neutral-800/80">
                {items.map((expense) => {
                  const cat = categoryMap[expense.categoryId] || {
                    name: 'General',
                    icon: 'Utensils',
                    color: '#8E8E93',
                  };
                  const Icon = CATEGORY_ICONS[cat.icon] || Utensils;
                  const isSwiped = swipedExpenseId === expense.id;

                  return (
                    <div
                      key={expense.id}
                      className="relative overflow-hidden group select-none transition-colors"
                    >
                      <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/70 dark:hover:bg-neutral-800/40">
                        {/* Left icon & Details */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs"
                            style={{ backgroundColor: cat.color }}
                          >
                            <Icon className="w-5 h-5 stroke-[2.2]" />
                          </div>

                          <div className="truncate">
                            <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                              {expense.merchant}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-1.5 truncate">
                              <span>{cat.name}</span>
                              <span aria-hidden="true">·</span>
                              <span>{expense.paymentMethod}</span>
                              {expense.receiptImage && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <button
                                    onClick={() => onSelectExpenseForReceipt?.(expense.receiptImage!)}
                                    className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                                  >
                                    <Receipt className="w-3 h-3 inline" /> receipt
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Amount & actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <div className="font-bold text-sm text-slate-900 dark:text-white tabular-nums">
                              -{KmpBudgetEngine.formatCurrency(expense.amount, currency)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(expense.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>

                          <button
                            onClick={() => onDeleteExpense(expense.id)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
