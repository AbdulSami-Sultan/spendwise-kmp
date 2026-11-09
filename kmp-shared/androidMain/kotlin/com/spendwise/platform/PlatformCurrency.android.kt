package com.spendwise.platform

import java.text.NumberFormat
import java.util.Currency
import java.util.Locale

actual class PlatformCurrency actual constructor() {
    actual fun formatCurrency(amount: Double, currencyCode: String): String {
        val format = NumberFormat.getCurrencyInstance(Locale.getDefault())
        try {
            format.currency = Currency.getInstance(currencyCode)
        } catch (_: Exception) {
            // fallback
        }
        return format.format(amount)
    }

    actual fun getPlatformName(): String = "Android (Java/Kotlin JVM)"
}
