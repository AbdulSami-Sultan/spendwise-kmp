package com.spendwise.model

import kotlinx.serialization.Serializable

@Serializable
data class Budget(
    val id: String,
    val categoryId: String? = null, // null = overall monthly budget
    val monthlyLimit: Double,
    val month: Int, // 1-12
    val year: Int,
    val alertThresholdPercent: Double = 80.0
)

@Serializable
data class BudgetStatus(
    val categoryId: String?,
    val categoryName: String,
    val allocated: Double,
    val spent: Double,
    val remaining: Double,
    val percentUsed: Double,
    val dailySafeToSpend: Double,
    val isOverBudget: Boolean,
    val isNearLimit: Boolean
)
