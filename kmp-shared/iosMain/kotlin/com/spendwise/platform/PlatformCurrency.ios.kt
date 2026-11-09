package com.spendwise.platform

import platform.Foundation.NSNumber
import platform.Foundation.NSNumberFormatter
import platform.Foundation.NSNumberFormatterCurrencyStyle
import platform.Foundation.NSLocale
import platform.Foundation.currentLocale

actual class PlatformCurrency actual constructor() {
    private val formatter = NSNumberFormatter().apply {
        numberStyle = NSNumberFormatterCurrencyStyle
        locale = NSLocale.currentLocale
    }

    actual fun formatCurrency(amount: Double, currencyCode: String): String {
        formatter.currencyCode = currencyCode
        return formatter.stringFromNumber(NSNumber(amount)) ?: "$$amount"
    }

    actual fun getPlatformName(): String = "iOS (Apple Foundation)"
}
