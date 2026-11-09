import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Sliders, RotateCcw } from 'lucide-react';
import { Category, CurrencyConfig } from '../../types';

interface BudgetAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  overallBudget: number;
  categories: Category[];
  currency: CurrencyConfig;
  onSaveBudgets: (overall: number, updatedCategories: Category[]) => void;
}

export const BudgetAdjustModal: React.FC<BudgetAdjustModalProps> = ({
  isOpen,
  onClose,
  overallBudget,
  categories,
  currency,
  onSaveBudgets,
}) => {
  const [totalBudget, setTotalBudget] = useState(overallBudget);
  const [catLimits, setCatLimits] = useState<Record<string, number>>(
    categories.reduce((acc, c) => ({ ...acc, [c.id]: c.monthlyLimit }), {})
  );

  const handleCategoryChange = (id: string, val: number) => {
    setCatLimits((prev) => ({
      ...prev,
      [id]: Math.max(0, val),
    }));
  };

  const handleSave = () => {
    const updated = categories.map((c) => ({
      ...c,
      monthlyLimit: catLimits[c.id] ?? c.monthlyLimit,
    }));
    onSaveBudgets(totalBudget, updated);
    onClose();
  };

  const handleResetDefaults = () => {
    setTotalBudget(2800);
    const defaults: Record<string, number> = {
      food: 650,
      groceries: 500,
      transport: 250,
      shopping: 400,
      entertainment: 200,
      utilities: 320,
      health: 180,
      subscriptions: 90,
    };
    setCatLimits(defaults);
  };

  const sumOfCategories = Object.values(catLimits).reduce((a, b) => a + b, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-[#F2F2F7] dark:bg-[#1C1C1E] text-slate-900 dark:text-white rounded-[28px] overflow-hidden shadow-2xl flex flex-col max-h-[88vh]"
          >
            {/* Header */}
            <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-semibold text-sm">Budget Allocations</h3>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-slate-200 dark:bg-neutral-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable contents */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
              {/* Overall Monthly Limit Slider & Input */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                    OVERALL MONTHLY TARGET
                  </span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {currency.symbol}{totalBudget.toLocaleString()}
                  </span>
                </div>

                <input
                  type="range"
                  min="500"
                  max="8000"
                  step="50"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />

                <div className="flex justify-between text-[11px] text-slate-400 dark:text-neutral-500">
                  <span>{currency.symbol}500/mo</span>
                  <span>Category Sum: {currency.symbol}{sumOfCategories.toLocaleString()}</span>
                  <span>{currency.symbol}8,000/mo</span>
                </div>
              </div>

              {/* Category Breakdown Limits */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                    CATEGORY TARGETS
                  </span>
                  <button
                    onClick={handleResetDefaults}
                    className="text-xs text-slate-500 hover:text-emerald-600 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>

                <div className="space-y-3">
                  {categories.map((cat) => (
                    <div key={cat.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700 dark:text-neutral-200">
                          {cat.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">{currency.symbol}</span>
                          <input
                            type="number"
                            value={catLimits[cat.id] ?? 0}
                            onChange={(e) => handleCategoryChange(cat.id, Number(e.target.value))}
                            className="w-18 px-2 py-0.5 text-right font-medium text-xs bg-slate-100 dark:bg-neutral-800 rounded border border-slate-200 dark:border-neutral-700 tabular-nums focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1500"
                        step="25"
                        value={catLimits[cat.id] ?? 0}
                        onChange={(e) => handleCategoryChange(cat.id, Number(e.target.value))}
                        className="w-full h-1.5 accent-emerald-500 bg-slate-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                Apply Targets
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
