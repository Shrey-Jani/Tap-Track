enum PaymentCategory {
    FOOD = "FOOD",
    TRANSPORT = "TRANSPORT",
    SHOPPING = "SHOPPING",
    ENTERTAINMENT = "ENTERTAINMENT",
    BILLS = "BILLS",
    HEALTH = "HEALTH",
    OTHER = "OTHER",
}

interface Payment  {
    id: string;
    amountInCents: number;
    merchantName: string;
    category: PaymentCategory;
    cardLastFourDigits: string;
    timestamp: number;
    note?: string;
    isRecurring: boolean;
}

interface DailySummary {
    date: string;
    totalSpentInCents: number;
    transactionCount: number;
    categoryBreakdown: Record<PaymentCategory, number>;
    largestPayment: Payment | null;
    averagePaymentInCents: number;
}

interface UserPreferences {
    currency: string;
    dailyBudgetInCents: number;
    darkModeEnabled: boolean;
}

export { DailySummary, Payment, PaymentCategory, UserPreferences };

