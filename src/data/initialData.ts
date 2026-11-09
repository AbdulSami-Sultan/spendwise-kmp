import { Category, CurrencyConfig, Expense } from '../types';

export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateAgainstUSD: 1.0 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateAgainstUSD: 0.92 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateAgainstUSD: 0.79 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateAgainstUSD: 154.5 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateAgainstUSD: 1.38 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateAgainstUSD: 1.52 },
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: 'Utensils', color: '#FF9500', monthlyLimit: 650 },
  { id: 'groceries', name: 'Groceries', icon: 'ShoppingCart', color: '#34C759', monthlyLimit: 500 },
  { id: 'transport', name: 'Transport', icon: 'Car', color: '#007AFF', monthlyLimit: 250 },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#AF52DE', monthlyLimit: 400 },
  { id: 'entertainment', name: 'Entertainment', icon: 'Film', color: '#FF2D55', monthlyLimit: 200 },
  { id: 'utilities', name: 'Bills & Utilities', icon: 'Zap', color: '#5856D6', monthlyLimit: 320 },
  { id: 'health', name: 'Health & Fitness', icon: 'HeartPulse', color: '#30B0C7', monthlyLimit: 180 },
  { id: 'subscriptions', name: 'Subscriptions', icon: 'Repeat', color: '#FF3B30', monthlyLimit: 90 },
];

export const INITIAL_TOTAL_BUDGET = 2800; // Overall monthly limit

// Generate initial sample expenses relative to current date
export const generateSampleExpenses = (): Expense[] => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const getDate = (dayOffset: number, hour = 12, min = 30) => {
    const d = new Date(year, month, Math.max(1, now.getDate() - dayOffset), hour, min);
    return d.getTime();
  };

  return [
    {
      id: 'exp-1',
      amount: 11.07,
      merchant: 'The Flourish Cafe',
      categoryId: 'food',
      timestamp: getDate(0, 10, 14),
      note: 'Oat latte & almond croissant',
      paymentMethod: 'Apple Pay',
      receiptImage: '/src/assets/images/sample_receipt_photo_1794255925704.jpg',
      tags: ['Coffee', 'Morning'],
    },
    {
      id: 'exp-2',
      amount: 68.45,
      merchant: 'Trader Joe’s',
      categoryId: 'groceries',
      timestamp: getDate(0, 17, 20),
      note: 'Weekly produce, Greek yogurt, olive oil',
      paymentMethod: 'Apple Card',
      tags: ['Organic', 'Weekly'],
    },
    {
      id: 'exp-3',
      amount: 18.50,
      merchant: 'Uber',
      categoryId: 'transport',
      timestamp: getDate(1, 22, 15),
      note: 'Ride home from downtown',
      paymentMethod: 'Apple Pay',
      tags: ['Commute'],
    },
    {
      id: 'exp-4',
      amount: 14.99,
      merchant: 'Netflix',
      categoryId: 'subscriptions',
      timestamp: getDate(2, 9, 0),
      note: 'Monthly 4K plan',
      paymentMethod: 'Apple Card',
      isRecurring: true,
      tags: ['Streaming'],
    },
    {
      id: 'exp-5',
      amount: 42.00,
      merchant: 'Blue Bottle Coffee',
      categoryId: 'food',
      timestamp: getDate(2, 14, 30),
      note: 'Team meeting coffees & pastries',
      paymentMethod: 'Apple Card',
      tags: ['Work'],
    },
    {
      id: 'exp-6',
      amount: 129.00,
      merchant: 'Uniqlo Fifth Ave',
      categoryId: 'shopping',
      timestamp: getDate(3, 16, 45),
      note: 'Merino wool knitwear & heattech',
      paymentMethod: 'Apple Card',
      tags: ['Clothing'],
    },
    {
      id: 'exp-7',
      amount: 85.00,
      merchant: 'Equinox Fitness Club',
      categoryId: 'health',
      timestamp: getDate(4, 7, 30),
      note: 'Pilates training session',
      paymentMethod: 'Debit Card',
      tags: ['Wellness'],
    },
    {
      id: 'exp-8',
      amount: 54.30,
      merchant: 'Whole Foods Market',
      categoryId: 'groceries',
      timestamp: getDate(5, 18, 10),
      note: 'Fresh wild salmon & asparagus',
      paymentMethod: 'Apple Pay',
      tags: ['Dinner'],
    },
    {
      id: 'exp-9',
      amount: 72.00,
      merchant: 'Osteria Morini',
      categoryId: 'food',
      timestamp: getDate(6, 20, 0),
      note: 'Handmade pasta & wine with friends',
      paymentMethod: 'Apple Card',
      tags: ['Dinner'],
    },
    {
      id: 'exp-10',
      amount: 32.50,
      merchant: 'Chevron Fuel',
      categoryId: 'transport',
      timestamp: getDate(7, 11, 20),
      note: 'Gas tank refill',
      paymentMethod: 'Debit Card',
      tags: ['Vehicle'],
    },
    {
      id: 'exp-11',
      amount: 110.00,
      merchant: 'Con Edison Electric',
      categoryId: 'utilities',
      timestamp: getDate(8, 8, 45),
      note: 'Monthly power and heating utility',
      paymentMethod: 'Bank Transfer',
      isRecurring: true,
      tags: ['Bills'],
    },
    {
      id: 'exp-12',
      amount: 28.00,
      merchant: 'AMC Theatres',
      categoryId: 'entertainment',
      timestamp: getDate(9, 19, 30),
      note: 'IMAX movie tickets',
      paymentMethod: 'Apple Pay',
      tags: ['Cinema'],
    },
    {
      id: 'exp-13',
      amount: 9.99,
      merchant: 'Spotify Premium',
      categoryId: 'subscriptions',
      timestamp: getDate(10, 6, 0),
      note: 'Monthly audio streaming',
      paymentMethod: 'Apple Card',
      isRecurring: true,
      tags: ['Music'],
    },
    {
      id: 'exp-14',
      amount: 38.25,
      merchant: 'Sweetgreen',
      categoryId: 'food',
      timestamp: getDate(11, 13, 10),
      note: 'Harvest bowl & rosemary focaccia',
      paymentMethod: 'Apple Pay',
      tags: ['Lunch'],
    },
  ];
};
