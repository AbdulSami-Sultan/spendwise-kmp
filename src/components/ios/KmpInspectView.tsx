import React, { useState } from 'react';
import {
  Code2,
  FileCode,
  Layers,
  Cpu,
  CheckCircle2,
  Terminal,
  Play,
  Share2,
  Apple,
  Smartphone,
} from 'lucide-react';
import { KmpBudgetEngine } from '../../kmp/KmpEngine';
import { CurrencyConfig } from '../../types';

interface KmpInspectViewProps {
  currency: CurrencyConfig;
}

export const KmpInspectView: React.FC<KmpInspectViewProps> = ({ currency }) => {
  const [selectedFile, setSelectedFile] = useState<'engine' | 'model' | 'expect' | 'swift' | 'readme'>('readme');

  // Interactive KMP Engine Sandbox state
  const [sandboxBudget, setSandboxBudget] = useState(3000);
  const [sandboxSpent, setSandboxSpent] = useState(1450);
  const [sandboxDay, setSandboxDay] = useState(15);
  const [sandboxDaysInMonth, setSandboxDaysInMonth] = useState(30);

  // Computed via KmpBudgetEngine
  const testDailySafe = KmpBudgetEngine.calculateDailySafeToSpend(
    sandboxBudget,
    sandboxSpent,
    sandboxDay,
    sandboxDaysInMonth
  );
  const testProjected = KmpBudgetEngine.projectMonthEndSpend(
    sandboxSpent,
    sandboxDay,
    sandboxDaysInMonth
  );
  const testHealthScore = KmpBudgetEngine.calculateBudgetHealthScore(
    sandboxBudget,
    sandboxSpent,
    sandboxDay,
    sandboxDaysInMonth
  );

  const fileContents = {
    engine: `// kmp-shared/commonMain/kotlin/com/spendwise/domain/BudgetEngine.kt
package com.spendwise.domain

import com.spendwise.model.*
import kotlin.math.max

/**
 * SpendWise Shared Budget Engine (Kotlin Multiplatform commonMain)
 * 100% shared business logic between iOS and Android.
 */
class BudgetEngine {

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

    fun projectMonthEndSpend(
        currentSpent: Double,
        dayOfMonth: Int,
        daysInMonth: Int
    ): Double {
        if (dayOfMonth <= 0) return currentSpent
        val dailyVelocity = currentSpent / dayOfMonth
        return dailyVelocity * daysInMonth
    }

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
}`,
    model: `// kmp-shared/commonMain/kotlin/com/spendwise/model/Expense.kt
package com.spendwise.model

import kotlinx.serialization.Serializable

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
}`,
    expect: `// kmp-shared/commonMain/.../PlatformCurrency.kt
expect class PlatformCurrency() {
    fun formatCurrency(amount: Double, currencyCode: String): String
    fun getPlatformName(): String
}

// kmp-shared/iosMain/.../PlatformCurrency.ios.kt (Apple Foundation)
actual class PlatformCurrency actual constructor() {
    private val formatter = NSNumberFormatter().apply {
        numberStyle = NSNumberFormatterCurrencyStyle
    }
    actual fun formatCurrency(amount: Double, currencyCode: String): String {
        formatter.currencyCode = currencyCode
        return formatter.stringFromNumber(NSNumber(amount)) ?: "$\${amount}"
    }
    actual fun getPlatformName(): String = "iOS (Apple Foundation)"
}`,
    swift: `// kmp-shared/iosApp/SpendWiseApp.swift
import SwiftUI
import SpendWiseShared // Kotlin Multiplatform native framework

@main
struct SpendWiseApp: App {
    @StateObject private var viewModel = iOSSpendWiseViewModel()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(viewModel)
        }
    }
}

class iOSSpendWiseViewModel: ObservableObject {
    // Calling shared KMP BudgetEngine directly from Swift:
    private let engine = BudgetEngine()
    
    func getSafeToSpend(budget: Double, spent: Double, day: Int32, totalDays: Int32) -> Double {
        return engine.calculateDailySafeToSpend(
            totalBudget: budget,
            currentSpent: spent,
            dayOfMonth: day,
            daysInMonth: totalDays
        )
    }
}`,
    readme: `# SpendWise 💳

**SpendWise** is a lightweight, cross-platform personal finance and expense tracking application built using **Kotlin Multiplatform (KMP)** and **Compose Multiplatform**. Designed with an offline-first architecture to help users monitor daily expenses, set budget thresholds, and visualize spending habits across Android and iOS from a single shared codebase.

### ✨ Highlights
- **100% Shared UI & Logic:** Built with Compose Multiplatform, Coroutines, and Flow.
- **Offline-First:** Local persistence powered by SQLDelight / Room KMP.
- **Modern Architecture:** Clean Architecture with MVI / MVVM pattern and Koin for dependency injection.
- **Insights & Analytics:** Category breakdown, monthly summaries, and spending trend charts.

Tags: kotlin-multiplatform, kmp, compose-multiplatform, expense-tracker, personal-finance, android, ios, sqldelight, koin, clean-architecture`,
  };


  return (
    <div className="flex-1 overflow-y-auto px-4 pb-24 pt-2 space-y-4 no-scrollbar">
      {/* Header */}
      <div className="flex items-end justify-between pt-1">
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400 tracking-wide uppercase">
            Shared Architecture
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Kotlin Multiplatform
          </h1>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>85% Shared Logic</span>
        </div>
      </div>

      {/* Architecture diagram card */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-slate-200/60 dark:border-neutral-800 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          KMP Cross-Platform Architecture
        </h3>

        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 flex flex-col items-center gap-1">
            <Apple className="w-5 h-5 text-slate-800 dark:text-white" />
            <span className="font-bold text-slate-900 dark:text-white">iOS Native UI</span>
            <span className="text-[10px] text-slate-500">SwiftUI + Combine</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 flex flex-col items-center gap-1">
            <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-slate-900 dark:text-white">Android UI</span>
            <span className="text-[10px] text-slate-500">Jetpack Compose</span>
          </div>
        </div>

        {/* Central KMP Core */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-center space-y-1 shadow-sm">
          <div className="font-bold text-xs flex items-center justify-center gap-1.5">
            <Cpu className="w-4 h-4" />
            <span>commonMain / Kotlin Multiplatform Core</span>
          </div>
          <div className="text-[11px] text-emerald-100">
            BudgetEngine · ExpenseRepository · Safe-to-Spend Math · StateFlow
          </div>
        </div>
      </div>

      {/* Interactive KMP Engine Sandbox */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-slate-200/60 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-xs text-slate-700 dark:text-neutral-300">
              Live Kotlin Engine Test Sandbox
            </h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-mono font-semibold">
            com.spendwise.domain
          </span>
        </div>

        {/* Sliders */}
        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between font-medium text-slate-600 dark:text-neutral-300">
              <span>Total Monthly Budget:</span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">${sandboxBudget}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="6000"
              step="100"
              value={sandboxBudget}
              onChange={(e) => setSandboxBudget(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium text-slate-600 dark:text-neutral-300">
              <span>Current Month-to-Date Spend:</span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">${sandboxSpent}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              step="50"
              value={sandboxSpent}
              onChange={(e) => setSandboxSpent(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium text-slate-600 dark:text-neutral-300">
              <span>Day of Month:</span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">Day {sandboxDay} of {sandboxDaysInMonth}</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={sandboxDay}
              onChange={(e) => setSandboxDay(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Engine Output Box */}
        <div className="p-3.5 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs space-y-2 border border-slate-800">
          <div className="text-slate-400 text-[10px] pb-1 border-b border-slate-800 flex items-center justify-between">
            <span>ENGINE COMPUTATION RESULT</span>
            <span>BudgetEngine.kt</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">dailySafeToSpend():</span>
            <span className="font-bold text-white tabular-nums">${testDailySafe.toFixed(2)}/day</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">projectMonthEnd():</span>
            <span className="font-bold text-white tabular-nums">${testProjected.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">budgetHealthScore():</span>
            <span className="font-bold text-white tabular-nums">{testHealthScore}/100</span>
          </div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-slate-200/60 dark:border-neutral-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-xs text-slate-700 dark:text-neutral-300">
              KMP Source Code Explorer
            </h3>
          </div>
        </div>

        {/* File Tabs */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 dark:bg-neutral-800 rounded-xl text-xs">
          <button
            onClick={() => setSelectedFile('readme')}
            className={`py-1.5 px-1 rounded-lg font-medium transition-all truncate text-[11px] ${
              selectedFile === 'readme'
                ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 dark:text-neutral-400'
            }`}
          >
            README
          </button>
          <button
            onClick={() => setSelectedFile('engine')}
            className={`py-1.5 px-1 rounded-lg font-medium transition-all truncate text-[11px] ${
              selectedFile === 'engine'
                ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 dark:text-neutral-400'
            }`}
          >
            Engine.kt
          </button>
          <button
            onClick={() => setSelectedFile('model')}
            className={`py-1.5 px-1 rounded-lg font-medium transition-all truncate text-[11px] ${
              selectedFile === 'model'
                ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 dark:text-neutral-400'
            }`}
          >
            Expense.kt
          </button>
          <button
            onClick={() => setSelectedFile('expect')}
            className={`py-1.5 px-1 rounded-lg font-medium transition-all truncate text-[11px] ${
              selectedFile === 'expect'
                ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 dark:text-neutral-400'
            }`}
          >
            expect
          </button>
          <button
            onClick={() => setSelectedFile('swift')}
            className={`py-1.5 px-1 rounded-lg font-medium transition-all truncate text-[11px] ${
              selectedFile === 'swift'
                ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 dark:text-neutral-400'
            }`}
          >
            Swift
          </button>
        </div>

        {/* Code display */}
        <div className="bg-slate-950 text-slate-200 p-3.5 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto max-h-72 border border-slate-800">
          <pre>{fileContents[selectedFile]}</pre>
        </div>
      </div>
    </div>
  );
};
