export type PaymentMethod = 'Apple Card' | 'Apple Pay' | 'Debit Card' | 'Cash' | 'Bank Transfer';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string; // iOS system color hex
  monthlyLimit: number;
}

export interface Expense {
  id: string;
  amount: number;
  merchant: string;
  categoryId: string;
  timestamp: number; // epoch ms
  note?: string;
  paymentMethod: PaymentMethod;
  isRecurring?: boolean;
  receiptImage?: string;
  tags?: string[];
}

export interface BudgetStatus {
  categoryId: string | null;
  categoryName: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  dailySafeToSpend: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateAgainstUSD: number;
}

export type ViewTab = 'spending' | 'budgets' | 'analytics' | 'kmp' | 'settings';

export type DeviceMode = 'iphone' | 'fullscreen' | 'dual' | 'kmp-split';

export interface DynamicIslandNotification {
  id: string;
  title: string;
  subtitle: string;
  iconType: 'success' | 'alert' | 'camera' | 'budget';
  amount?: string;
}
