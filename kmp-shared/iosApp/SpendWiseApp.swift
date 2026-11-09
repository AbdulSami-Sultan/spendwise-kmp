import SwiftUI
import SpendWiseShared

/**
 * SpendWise iOS Native SwiftUI Entry Point
 * Consumes the shared Kotlin Multiplatform `SpendWiseShared.framework`
 */
@main
struct SpendWiseApp: App {
    // Shared KMP Repository & Domain Engine exposed via Kotlin/Native Objective-C interop
    @StateObject private var viewModel = iOSSpendWiseViewModel()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(viewModel)
                .preferredColorScheme(.none) // Supports iOS Light & Dark Mode
        }
    }
}

class iOSSpendWiseViewModel: ObservableObject {
    private let engine = BudgetEngine()
    @Published var expenses: [Expense] = []
    @Published var budgetStatuses: [BudgetStatus] = []
    @Published var dailySafeToSpend: Double = 0.0

    init() {
        observeSharedState()
    }

    private func observeSharedState() {
        // Kotlin Coroutine Flow / StateFlow observed from Swift
        // In real KMP projects with KMP-NativeCoroutines or SKIE, flows are observed as Swift AsyncSequence
    }

    func addExpense(amount: Double, merchant: String, categoryId: String) {
        // Calls Kotlin shared repository method directly
    }
}
