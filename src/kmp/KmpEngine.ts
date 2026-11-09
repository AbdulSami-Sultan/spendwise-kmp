import { BudgetStatus, Category, CurrencyConfig, Expense } from '../types';

/**
 * TypeScript mirror of Kotlin Multiplatform BudgetEngine (com.spendwise.domain.BudgetEngine).
 * This ensures exact mathematical and behavioral parity between the iOS/Android KMP engine
 * and the live preview.
 */
export class KmpBudgetEngine {
  /**
   * Calculates the safe-to-spend allowance per day based on remaining funds and days left.
   * Mirrors: BudgetEngine.kt -> calculateDailySafeToSpend
   */
  static calculateDailySafeToSpend(
    totalBudget: number,
    currentSpent: number,
    dayOfMonth: number,
    daysInMonth: number
  ): number {
    const remaining = Math.max(0, totalBudget - currentSpent);
    const daysRemaining = Math.max(1, daysInMonth - dayOfMonth + 1);
    return remaining / daysRemaining;
  }

  /**
   * Projects total month-end expenditure based on current daily velocity.
   * Mirrors: BudgetEngine.kt -> projectMonthEndSpend
   */
  static projectMonthEndSpend(
    currentSpent: number,
    dayOfMonth: number,
    daysInMonth: number
  ): number {
    if (dayOfMonth <= 0) return currentSpent;
    const dailyVelocity = currentSpent / dayOfMonth;
    return dailyVelocity * daysInMonth;
  }

  /**
   * Computes a 0-100 Budget Health Score.
   * 80-100: Excellent pacing (under budget velocity)
   * 60-79: Moderate / on-track
   * <60: High burn rate / over-budget warning
   */
  static calculateBudgetHealthScore(
    totalBudget: number,
    currentSpent: number,
    dayOfMonth: number,
    daysInMonth: number
  ): number {
    if (totalBudget <= 0) return 50;
    const monthProgress = dayOfMonth / daysInMonth;
    const budgetUsed = currentSpent / totalBudget;
    const variance = budgetUsed - monthProgress;

    if (variance > 0.3) {
      return Math.max(10, Math.round(40 - variance * 100));
    } else if (variance > 0.1) {
      return Math.max(45, Math.round(70 - variance * 100));
    } else if (variance < -0.1) {
      return Math.min(100, Math.round(85 + -variance * 50));
    }
    return 80;
  }

  /**
   * Computes detailed BudgetStatus for overall and per-category limits.
   */
  static computeBudgetStatuses(
    overallMonthlyLimit: number,
    categories: Category[],
    expenses: Expense[],
    dayOfMonth: number,
    daysInMonth: number
  ): BudgetStatus[] {
    const statuses: BudgetStatus[] = [];

    // 1. Overall Status
    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const overallRemaining = overallMonthlyLimit - totalSpent;
    const overallPercent = overallMonthlyLimit > 0 ? (totalSpent / overallMonthlyLimit) * 100 : 0;
    const overallDailySafe = this.calculateDailySafeToSpend(overallMonthlyLimit, totalSpent, dayOfMonth, daysInMonth);

    statuses.push({
      categoryId: null,
      categoryName: 'Total Monthly Budget',
      allocated: overallMonthlyLimit,
      spent: totalSpent,
      remaining: overallRemaining,
      percentUsed: overallPercent,
      dailySafeToSpend: overallDailySafe,
      isOverBudget: totalSpent > overallMonthlyLimit,
      isNearLimit: overallPercent >= 80 && totalSpent <= overallMonthlyLimit,
    });

    // 2. Per-Category Statuses
    for (const cat of categories) {
      const catExpenses = expenses.filter((e) => e.categoryId === cat.id);
      const catSpent = catExpenses.reduce((acc, curr) => acc + curr.amount, 0);
      const catLimit = cat.monthlyLimit;
      const catRemaining = catLimit - catSpent;
      const catPercent = catLimit > 0 ? (catSpent / catLimit) * 100 : 0;
      const catDailySafe = this.calculateDailySafeToSpend(catLimit, catSpent, dayOfMonth, daysInMonth);

      statuses.push({
        categoryId: cat.id,
        categoryName: cat.name,
        allocated: catLimit,
        spent: catSpent,
        remaining: catRemaining,
        percentUsed: catPercent,
        dailySafeToSpend: catDailySafe,
        isOverBudget: catSpent > catLimit,
        isNearLimit: catPercent >= 80 && catSpent <= catLimit,
      });
    }

    return statuses;
  }

  /**
   * Formats currency with respect to currency symbol and rate
   */
  static formatCurrency(amount: number, currency: CurrencyConfig): string {
    const converted = amount * currency.rateAgainstUSD;
    if (currency.code === 'JPY') {
      return `${currency.symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${currency.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}
