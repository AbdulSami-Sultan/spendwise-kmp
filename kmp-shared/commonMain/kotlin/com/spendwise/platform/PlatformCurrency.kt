package com.spendwise.platform

/**
 * Expected platform interface for localized currency and date formatting.
 * Implemented natively by iOS (Foundation NSNumberFormatter) and Android (java.text.NumberFormat).
 */
expect class PlatformCurrency() {
    fun formatCurrency(amount: Double, currencyCode: String): String
    fun getPlatformName(): String
}
