package com.spendwise.domain

import com.spendwise.model.Budget
import com.spendwise.model.BudgetStatus
import com.spendwise.model.Category
import com.spendwise.model.Expense
import kotlin.math.max

/**
 * SpendWise Shared Budget Engine (Kotlin Multiplatform commonMain)
 * Encapsulates all calculation logic for both iOS and Android.
 */
class BudgetEngine {

    /**
     * Calculates the daily safe-to-spend amount based on remaining budget and days left in month.
     */
    fun calculateDailySafeToSpend(
        totalBudget: Double,
        currentSpent: Double,
        dayOfMonth: Int,
        daysInMonth: Int
    ): Double {
        val remaining = max(0.0, totalBudget - currentSpent)
        val daysRemaining = max(1, daysInMonth - dayOfMonth + 1)
        return remaining / daysRemaining
    }

    /**
     * Projects total month-end spend based on current daily spending velocity.
     */
    fun projectMonthEndSpend(
        currentSpent: Double,
        dayOfMonth: Int,
        daysInMonth: Int
    ): Double {
        if (dayOfMonth <= 0) return currentSpent
        val dailyVelocity = currentSpent / dayOfMonth
        return dailyVelocity * daysInMonth
    }

    /**
     * Evaluates budget health score (0-100) based on spend pace vs timeline.
     */
    fun calculateBudgetHealthScore(
        totalBudget: Double,
        currentSpent: Double,
        dayOfMonth: Int,
        daysInMonth: Int
    ): Int {
        if (totalBudget <= 0.0) return 50
        val monthProgress = dayOfMonth.toDouble() / daysInMonth.toDouble()
        val budgetUsed = currentSpent / totalBudget

        val variance = budgetUsed - monthProgress
        return when {
            variance > 0.3 -> max(10, (40 - (variance * 100).toInt()))
            variance > 0.1 -> max(45, (70 - (variance * 100).toInt()))
            variance < -0.1 -> (85 + ((-variance) * 50).toInt()).coerceAtMost(100)
            else -> 80
        }
    }

    /**
     * Generates a comprehensive status summary for all configured budgets and categories.
     */
    fun computeBudgetStatuses(
        budgets: List<Budget>,
        expenses: List<Expense>,
        categories: List<Category>,
        dayOfMonth: Int,
        daysInMonth: Int
    ): List<BudgetStatus> {
        val categoryMap = categories.associateBy { it.id }

        return budgets.map { budget ->
            val relevantExpenses = if (budget.categoryId == null) {
                expenses
            } else {
                expenses.filter { it.categoryId == budget.categoryId }
            }

            val spent = relevantExpenses.sumOf { it.amount }
            val remaining = budget.monthlyLimit - spent
            val percentUsed = if (budget.monthlyLimit > 0) (spent / budget.monthlyLimit) * 100.0 else 0.0
            val categoryName = budget.categoryId?.let { categoryMap[it]?.name } ?: "Overall Monthly Budget"
            val dailySafe = calculateDailySafeToSpend(budget.monthlyLimit, spent, dayOfMonth, daysInMonth)

            BudgetStatus(
                categoryId = budget.categoryId,
                categoryName = categoryName,
                allocated = budget.monthlyLimit,
                spent = spent,
                remaining = remaining,
                percentUsed = percentUsed,
                dailySafeToSpend = dailySafe,
                isOverBudget = spent > budget.monthlyLimit,
                isNearLimit = percentUsed >= budget.alertThresholdPercent && spent <= budget.monthlyLimit
            )
        }
    }
}
