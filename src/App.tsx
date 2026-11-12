import React, { useState, useEffect } from 'react';
import {
  Category,
  CurrencyCode,
  CurrencyConfig,
  DeviceMode,
  DynamicIslandNotification,
  Expense,
  ViewTab,
} from './types';
import {
  CURRENCIES,
  INITIAL_CATEGORIES,
  INITIAL_TOTAL_BUDGET,
  generateSampleExpenses,
} from './data/initialData';
import { KmpBudgetEngine } from './kmp/KmpEngine';
import { WorkspaceHeader } from './components/device/WorkspaceHeader';
import { IPhoneMockup } from './components/device/IPhoneMockup';
import { AndroidPreview } from './components/device/AndroidPreview';
import { SpendingView } from './components/ios/SpendingView';
import { BudgetsView } from './components/ios/BudgetsView';
import { AnalyticsView } from './components/ios/AnalyticsView';
import { KmpInspectView } from './components/ios/KmpInspectView';
import { SettingsView } from './components/ios/SettingsView';
import { AddExpenseSheet } from './components/ios/AddExpenseSheet';
import { ReceiptScannerModal } from './components/ios/ReceiptScannerModal';
import { BudgetAdjustModal } from './components/ios/BudgetAdjustModal';
import { X, Sparkles, Check, Layers } from 'lucide-react';

export default function App() {
  // State with LocalStorage persistence
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem('spendwise_expenses');
      return saved ? JSON.parse(saved) : generateSampleExpenses();
    } catch {
      return generateSampleExpenses();
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('spendwise_categories');
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [overallBudget, setOverallBudget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('spendwise_total_budget');
      return saved ? Number(saved) : INITIAL_TOTAL_BUDGET;
    } catch {
      return INITIAL_TOTAL_BUDGET;
    }
  });

  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem('spendwise_currency');
      return (saved as CurrencyCode) || 'USD';
    } catch {
      return 'USD';
    }
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('spendwise_dark_mode');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [currentTab, setCurrentTab] = useState<ViewTab>('spending');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('iphone');

  // Modals & Notifications
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);
  const [isBudgetAdjustOpen, setIsBudgetAdjustOpen] = useState(false);
  const [prefillExpense, setPrefillExpense] = useState<Partial<Expense> | null>(null);
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);
  const [dynamicIslandNotification, setDynamicIslandNotification] = useState<DynamicIslandNotification | null>(null);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('spendwise_dark_mode', isDarkMode ? 'true' : 'false');
  }, [isDarkMode]);

  // Persist state
  useEffect(() => {
    localStorage.setItem('spendwise_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('spendwise_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('spendwise_total_budget', overallBudget.toString());
  }, [overallBudget]);

  useEffect(() => {
    localStorage.setItem('spendwise_currency', currencyCode);
  }, [currencyCode]);

  const currency: CurrencyConfig = CURRENCIES[currencyCode] || CURRENCIES.USD;

  // Safe-to-Spend string for Dynamic Island
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
  const dailySafeStr = KmpBudgetEngine.formatCurrency(dailySafe, currency);

  // Action handlers
  const handleSaveExpense = (newExpData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...newExpData,
      id: `exp-${Date.now()}`,
    };

    setExpenses((prev) => [newExpense, ...prev]);

    // Show Apple Dynamic Island feedback
    setDynamicIslandNotification({
      id: `noti-${Date.now()}`,
      title: newExpense.merchant,
      subtitle: `Recorded to ${categories.find((c) => c.id === newExpense.categoryId)?.name || 'Spending'}`,
      iconType: 'success',
      amount: `-${KmpBudgetEngine.formatCurrency(newExpense.amount, currency)}`,
    });
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleReceiptScanned = (parsed: Partial<Expense>) => {
    setPrefillExpense(parsed);
    setIsAddExpenseOpen(true);
    setDynamicIslandNotification({
      id: `noti-ocr-${Date.now()}`,
      title: 'Receipt Scanned',
      subtitle: `${parsed.merchant}: $${parsed.amount}`,
      iconType: 'camera',
    });
  };

  const handleSaveBudgets = (overall: number, updatedCategories: Category[]) => {
    setOverallBudget(overall);
    setCategories(updatedCategories);
    setDynamicIslandNotification({
      id: `noti-budget-${Date.now()}`,
      title: 'Budgets Updated',
      subtitle: `New target: ${KmpBudgetEngine.formatCurrency(overall, currency)}`,
      iconType: 'budget',
    });
  };

  const handleResetSampleData = () => {
    setExpenses(generateSampleExpenses());
    setCategories(INITIAL_CATEGORIES);
    setOverallBudget(INITIAL_TOTAL_BUDGET);
    setDynamicIslandNotification({
      id: `noti-reset-${Date.now()}`,
      title: 'Sample Data Loaded',
      subtitle: 'Restored 14 realistic expenses',
      iconType: 'success',
    });
  };

  const handleClearAllExpenses = () => {
    setExpenses([]);
    setDynamicIslandNotification({
      id: `noti-clear-${Date.now()}`,
      title: 'Expenses Cleared',
      subtitle: 'All transaction history removed',
      iconType: 'alert',
    });
  };

  // Render current tab view
  const renderCurrentView = () => {
    switch (currentTab) {
      case 'spending':
        return (
          <SpendingView
            expenses={expenses}
            categories={categories}
            currency={currency}
            overallBudget={overallBudget}
            onOpenAddExpense={() => {
              setPrefillExpense(null);
              setIsAddExpenseOpen(true);
            }}
            onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
            onDeleteExpense={handleDeleteExpense}
            onSelectExpenseForReceipt={(url) => setViewingReceiptUrl(url)}
          />
        );
      case 'budgets':
        return (
          <BudgetsView
            categories={categories}
            expenses={expenses}
            overallBudget={overallBudget}
            currency={currency}
            onOpenAdjustBudgets={() => setIsBudgetAdjustOpen(true)}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView
            expenses={expenses}
            categories={categories}
            currency={currency}
          />
        );
      case 'kmp':
        return <KmpInspectView currency={currency} />;
      case 'settings':
        return (
          <SettingsView
            currentCurrency={currency}
            onSelectCurrency={(code) => setCurrencyCode(code)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onResetSampleData={handleResetSampleData}
            onClearAllExpenses={handleClearAllExpenses}
            expenses={expenses}
            categories={categories}
            onExportSuccess={(count, total) => {
              setDynamicIslandNotification({
                id: `noti-export-${Date.now()}`,
                title: 'CSV File Exported',
                subtitle: `${count} records ready for accounting`,
                iconType: 'success',
                amount: `${KmpBudgetEngine.formatCurrency(total, currency)}`,
              });
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-neutral-950 flex flex-col font-sans text-slate-900 dark:text-neutral-100 selection:bg-emerald-500 selection:text-white">
      {/* Top Bar adhering to Top Bar Contract */}
      <WorkspaceHeader
        deviceMode={deviceMode}
        onSelectDeviceMode={setDeviceMode}
        onOpenAddExpense={() => {
          setPrefillExpense(null);
          setIsAddExpenseOpen(true);
        }}
      />

      {/* Main Workspace Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 overflow-hidden">
        {deviceMode === 'iphone' && (
          <IPhoneMockup
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            onOpenAddExpense={() => {
              setPrefillExpense(null);
              setIsAddExpenseOpen(true);
            }}
            dynamicIslandNotification={dynamicIslandNotification}
            dailySafeStr={dailySafeStr}
            onClearNotification={() => setDynamicIslandNotification(null)}
          >
            {renderCurrentView()}
          </IPhoneMockup>
        )}

        {deviceMode === 'fullscreen' && (
          <div className="w-full max-w-xl h-[840px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-neutral-800 flex flex-col">
            <IPhoneMockup
              currentTab={currentTab}
              onSelectTab={setCurrentTab}
              onOpenAddExpense={() => {
                setPrefillExpense(null);
                setIsAddExpenseOpen(true);
              }}
              dynamicIslandNotification={dynamicIslandNotification}
              dailySafeStr={dailySafeStr}
              onClearNotification={() => setDynamicIslandNotification(null)}
              isBare
            >
              {renderCurrentView()}
            </IPhoneMockup>
          </div>
        )}

        {deviceMode === 'kmp-split' && (
          <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-8 py-2">
            {/* Left: iPhone 16 Pro */}
            <div className="shrink-0">
              <IPhoneMockup
                currentTab={currentTab}
                onSelectTab={setCurrentTab}
                onOpenAddExpense={() => {
                  setPrefillExpense(null);
                  setIsAddExpenseOpen(true);
                }}
                dynamicIslandNotification={dynamicIslandNotification}
                dailySafeStr={dailySafeStr}
                onClearNotification={() => setDynamicIslandNotification(null)}
              >
                {renderCurrentView()}
              </IPhoneMockup>
            </div>

            {/* Right: KMP Architecture & Kotlin Code Studio */}
            <div className="flex-1 w-full max-w-xl h-[795px] bg-white dark:bg-neutral-900 rounded-[36px] border border-slate-200 dark:border-neutral-800 p-5 overflow-hidden flex flex-col shadow-xl">
              <KmpInspectView currency={currency} />
            </div>
          </div>
        )}

        {deviceMode === 'dual' && (
          <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-8 py-2">
            {/* Left: iOS iPhone 16 Pro */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Apple iOS (SwiftUI + KMP Native)
              </span>
              <IPhoneMockup
                currentTab={currentTab}
                onSelectTab={setCurrentTab}
                onOpenAddExpense={() => {
                  setPrefillExpense(null);
                  setIsAddExpenseOpen(true);
                }}
                dynamicIslandNotification={dynamicIslandNotification}
                dailySafeStr={dailySafeStr}
                onClearNotification={() => setDynamicIslandNotification(null)}
              >
                {renderCurrentView()}
              </IPhoneMockup>
            </div>

            {/* Right: Android Pixel Material 3 */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Google Android (Jetpack Compose + KMP JVM)
              </span>
              <AndroidPreview
                expenses={expenses}
                categories={categories}
                currency={currency}
                overallBudget={overallBudget}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Modal Sheet */}
      <AddExpenseSheet
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        categories={categories}
        currency={currency}
        onSaveExpense={handleSaveExpense}
        onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
        prefillData={prefillExpense}
      />

      {/* Smart AI Receipt & Bill Scanner Modal */}
      <ReceiptScannerModal
        isOpen={isReceiptScannerOpen}
        onClose={() => setIsReceiptScannerOpen(false)}
        onReceiptScanned={handleReceiptScanned}
        onDirectAddExpense={handleSaveExpense}
        categories={categories}
        currency={currency}
      />

      {/* Budget Adjust Modal */}
      <BudgetAdjustModal
        isOpen={isBudgetAdjustOpen}
        onClose={() => setIsBudgetAdjustOpen(false)}
        overallBudget={overallBudget}
        categories={categories}
        currency={currency}
        onSaveBudgets={handleSaveBudgets}
      />

      {/* Fullscreen Receipt Viewer Modal */}
      {viewingReceiptUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setViewingReceiptUrl(null)}
        >
          <div className="relative max-w-sm w-full bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl p-4">
            <div className="flex items-center justify-between pb-3 text-white border-b border-neutral-800">
              <span className="text-xs font-semibold">Attached Receipt</span>
              <button
                onClick={() => setViewingReceiptUrl(null)}
                className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="pt-3">
              <img
                src={viewingReceiptUrl}
                alt="Receipt Full Preview"
                referrerPolicy="no-referrer"
                className="w-full rounded-2xl object-contain max-h-[70vh]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
