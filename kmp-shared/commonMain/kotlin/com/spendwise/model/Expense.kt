package com.spendwise.model

import kotlinx.serialization.Serializable

/**
 * SpendWise Shared Expense Model (Kotlin Multiplatform commonMain)
 * Used seamlessly across iOS (Swift) and Android (Jetpack Compose).
 */
@Serializable
data class Expense(
    val id: String,
    val amount: Double,
    val merchant: String,
    val categoryId: String,
    val timestamp: Long,
    val note: String = "",
    val paymentMethod: PaymentMethod = PaymentMethod.APPLE_CARD,
    val isRecurring: Boolean = false,
    val receiptImageUrl: String? = null,
    val currency: String = "USD"
)

enum class PaymentMethod(val displayName: String) {
    APPLE_CARD("Apple Card"),
    APPLE_PAY("Apple Pay"),
    DEBIT_CARD("Debit Card"),
    CASH("Cash"),
    BANK_TRANSFER("Bank Transfer")
}

@Serializable
data class Category(
    val id: String,
    val name: String,
    val iconName: String,
    val hexColor: String,
    val defaultMonthlyBudget: Double
)
