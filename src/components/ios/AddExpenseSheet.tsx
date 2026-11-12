import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Utensils, ShoppingCart, Car, ShoppingBag, Film, Zap, HeartPulse, Repeat, Calendar, Check } from 'lucide-react';
import { Category, CurrencyConfig, Expense, PaymentMethod } from '../../types';

interface AddExpenseSheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  currency: CurrencyConfig;
  onSaveExpense: (expense: Omit<Expense, 'id'>) => void;
  onOpenReceiptScanner: () => void;
  prefillData?: Partial<Expense> | null;
}

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

const QUICK_MERCHANTS = ['Trader Joe’s', 'Starbucks', 'Uber', 'Whole Foods', 'Target', 'Blue Bottle'];

export const AddExpenseSheet: React.FC<AddExpenseSheetProps> = ({
  isOpen,
  onClose,
  categories,
  currency,
  onSaveExpense,
  onOpenReceiptScanner,
  prefillData,
}) => {
  const [amountStr, setAmountStr] = useState(prefillData?.amount ? prefillData.amount.toString() : '');
  const [merchant, setMerchant] = useState(prefillData?.merchant || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState(prefillData?.categoryId || categories[0]?.id || 'food');
  const [note, setNote] = useState(prefillData?.note || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(prefillData?.paymentMethod || 'Apple Card');
  const [isRecurring, setIsRecurring] = useState(prefillData?.isRecurring || false);
  const [receiptImage, setReceiptImage] = useState<string | undefined>(prefillData?.receiptImage);

  React.useEffect(() => {
    if (prefillData) {
      if (prefillData.amount !== undefined) setAmountStr(prefillData.amount.toString());
      if (prefillData.merchant) setMerchant(prefillData.merchant);
      if (prefillData.categoryId) setSelectedCategoryId(prefillData.categoryId);
      if (prefillData.note) setNote(prefillData.note);
      if (prefillData.paymentMethod) setPaymentMethod(prefillData.paymentMethod);
      if (prefillData.isRecurring !== undefined) setIsRecurring(prefillData.isRecurring);
      if (prefillData.receiptImage) setReceiptImage(prefillData.receiptImage);
    }
  }, [prefillData]);

  const handleKeyPress = (num: string) => {
    if (num === '.') {
      if (!amountStr.includes('.')) {
        setAmountStr(amountStr ? amountStr + '.' : '0.');
      }
    } else if (num === 'backspace') {
      setAmountStr(amountStr.slice(0, -1));
    } else {
      if (amountStr.includes('.') && amountStr.split('.')[1].length >= 2) return;
      if (amountStr.length >= 7) return;
      setAmountStr(amountStr === '0' ? num : amountStr + num);
    }
  };

  const handleSave = () => {
    const val = parseFloat(amountStr);
    if (isNaN(val) || val <= 0) return;
    if (!merchant.trim()) return;

    onSaveExpense({
      amount: val,
      merchant: merchant.trim(),
      categoryId: selectedCategoryId,
      timestamp: Date.now(),
      note: note.trim() || undefined,
      paymentMethod,
      isRecurring,
      receiptImage,
      tags: [categories.find((c) => c.id === selectedCategoryId)?.name || 'General'],
    });

    // Reset and close
    setAmountStr('');
    setMerchant('');
    setNote('');
    setReceiptImage(undefined);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[#F2F2F7] dark:bg-[#1C1C1E] text-slate-900 dark:text-white rounded-t-[32px] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden z-10"
          >
            {/* Grab handle */}
            <div className="pt-3 pb-2 flex justify-center shrink-0">
              <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-neutral-700" />
            </div>

            {/* Header bar */}
            <div className="px-5 pb-3 flex items-center justify-between border-b border-slate-200 dark:border-neutral-800 shrink-0">
              <button
                onClick={onClose}
                className="text-slate-500 dark:text-neutral-400 text-sm font-medium hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <h2 className="font-semibold text-base">New Expense</h2>
              <button
                onClick={handleSave}
                disabled={!amountStr || parseFloat(amountStr) <= 0 || !merchant.trim()}
                className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 disabled:opacity-40"
              >
                Save
              </button>
            </div>

            {/* Scrollable content body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
              {/* Amount Display */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm text-center">
                <span className="text-xs text-slate-400 dark:text-neutral-500 font-medium">AMOUNT</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="text-3xl font-bold text-slate-400 dark:text-neutral-500">
                    {currency.symbol}
                  </span>
                  <span className="text-4xl font-extrabold tracking-tight tabular-nums min-h-[44px] flex items-center">
                    {amountStr || '0.00'}
                  </span>
                </div>
              </div>

              {/* Merchant & Quick Chips */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm space-y-3">
                <label className="text-xs text-slate-400 dark:text-neutral-500 font-medium">MERCHANT / PAYEE</label>
                <input
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="e.g. Trader Joe's, Uber, Apple..."
                  className="w-full text-base font-medium px-3 py-2 bg-slate-100 dark:bg-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                {/* Quick merchant tags */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                  {QUICK_MERCHANTS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMerchant(m)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700 whitespace-nowrap shrink-0 transition-colors"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Picker Grid */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-400 dark:text-neutral-500 font-medium">CATEGORY</label>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {categories.find((c) => c.id === selectedCategoryId)?.name}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2.5">
                  {categories.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat.icon] || Utensils;
                    const isSelected = selectedCategoryId === cat.id;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm'
                            : 'border-slate-100 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center mb-1 text-white shadow-xs"
                          style={{ backgroundColor: cat.color }}
                        >
                          <Icon className="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <span className="text-[11px] font-medium text-slate-700 dark:text-neutral-300 truncate w-full text-center">
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm space-y-2">
                <label className="text-xs text-slate-400 dark:text-neutral-500 font-medium">PAYMENT METHOD</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-neutral-800 rounded-xl">
                  {(['Apple Card', 'Apple Pay', 'Debit Card', 'Cash'] as PaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`text-xs py-2 px-1 rounded-lg font-medium transition-all truncate ${
                        paymentMethod === method
                          ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Receipt attachment & OCR scanner button */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-600 dark:text-neutral-300">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Bill & Receipt AI Reader</div>
                    <div className="text-xs text-slate-400 dark:text-neutral-500">
                      {receiptImage ? 'Bill attached' : 'Read bill from image with AI OCR'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {receiptImage && (
                    <img
                      src={receiptImage}
                      alt="Receipt preview"
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-neutral-700"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onOpenReceiptScanner();
                    }}
                    className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-emerald-600 dark:text-emerald-400 transition-colors"
                  >
                    {receiptImage ? 'Rescan' : 'Scan'}
                  </button>
                </div>
              </div>

              {/* Note input */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm space-y-2">
                <label className="text-xs text-slate-400 dark:text-neutral-500 font-medium">NOTE (OPTIONAL)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Lunch with team, monthly tax deductible..."
                  className="w-full text-sm px-3 py-2 bg-slate-100 dark:bg-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Recurring toggle */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Recurring Monthly Expense</div>
                  <div className="text-xs text-slate-400 dark:text-neutral-500">
                    Auto-project in KMP monthly forecast
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={`w-12 h-7 rounded-full p-0.5 transition-colors ${
                    isRecurring ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-neutral-700'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                      isRecurring ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Interactive Keypad */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeyPress(key)}
                    className="h-12 rounded-xl bg-white dark:bg-neutral-800 text-slate-900 dark:text-white font-semibold text-lg flex items-center justify-center shadow-xs active:bg-slate-100 dark:active:bg-neutral-700 select-none transition-colors"
                  >
                    {key === 'backspace' ? '⌫' : key}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
