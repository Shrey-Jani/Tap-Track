const STORAGE_KEY_PAYMENTS = "taptrack_payments";

const STORAGE_KEY_PREFERENCES = "taptrack_preferences";

const DEFAULT_CURRENCY = "CAD";

export const DEFAULT_DAILY_BUDGET_IN_CENTS = 0;

import { PaymentCategory } from "@/models/payment";
export const CATEGORY_ICONS: Record<PaymentCategory, string> = {
    FOOD: "🍔",
    TRANSPORT : "🚗", 
    SHOPPING : "🛍️", 
    ENTERTAINMENT : "🎬",
    BILLS : "📄", 
    HEALTH : "💊", 
    OTHER : "📦"
}
