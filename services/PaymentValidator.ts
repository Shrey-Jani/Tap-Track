import { PaymentCategory } from "@/models/payment";

export function validatePaymentInput(
    amountInCents: number,
    merchantName: string,
    category: PaymentCategory,
    cardLastFourDigits: string
): { isValid: boolean; errorMessage: string } {
    if (amountInCents <= 0) {
        return { isValid: false, errorMessage: "Amount must be greater than zero" };
    }
    if (amountInCents > 99999999) {
        return { isValid: false, errorMessage: "Amount exceeds maximum limit" };
    }
    if (!merchantName.trim()) {
        return { isValid: false, errorMessage: "Merchant Name is required" };
    }
    if (!/^\d{4}$/.test(cardLastFourDigits)) {
        return { isValid: false, errorMessage: "Card must be exactly 4 digits" };
    }
    return { isValid: true, errorMessage: "" };
}