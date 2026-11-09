import React from 'react';
import { CreditCard, Target, PieChart, Code2, Settings, Plus } from 'lucide-react';
import { ViewTab } from '../../types';

interface TabBarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenAddExpense: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddExpense,
}) => {
  const tabs: { id: ViewTab; label: string; icon: React.ElementType }[] = [
    { id: 'spending', label: 'Spending', icon: CreditCard },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'kmp', label: 'KMP Core', icon: Code2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="relative shrink-0 border-t border-slate-200/80 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl px-2 pt-1.5 pb-5 z-30">
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="flex flex-col items-center justify-center min-h-[44px] py-1 transition-transform active:scale-90 group select-none"
              aria-label={tab.label}
            >
              <div
                className={`relative flex items-center justify-center transition-colors ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 bg-emerald-500 rounded-full" />
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 truncate whitespace-nowrap ${
                  isActive
                    ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Floating Quick Action Button on bottom right (ergonomic thumb reach) */}
      <div className="absolute -top-6 right-5">
        <button
          onClick={onOpenAddExpense}
          className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Add new expense"
          title="Add Expense"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
