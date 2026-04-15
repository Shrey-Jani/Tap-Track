import { useMemo } from "react";

import { DailySummary, Payment, PaymentCategory } from "@/models/payment";
import { getTodayDateString } from "@/utils/dateHelpers";

export const useDailySummary = (payments: Payment[]): DailySummary => {
    return useMemo(() => {
        const transactionCount = payments.length;

        const totalSpentInCents = payments.reduce(
            (sum, payment) => sum + payment.amountInCents, 0
        );

        const categoryBreakdown: Record<PaymentCategory, number> = {} as any;

        Object.values(PaymentCategory).forEach((category) => {
            const categorySum = payments
                .filter((payment) => payment.category === category)
                .reduce((acc, payment) => acc + payment.amountInCents, 0);

            categoryBreakdown[category] = categorySum;
        });

        const largestPayment = payments.length > 0 
        ? payments.reduce((previous, current) => previous.amountInCents > current.amountInCents ? previous : current) : null;
        
        const averagePaymentInCents = transactionCount > 0 ? totalSpentInCents / transactionCount : 0;

        const date = getTodayDateString();

        return {
            totalSpentInCents,
            transactionCount,
            categoryBreakdown,
            largestPayment,
            averagePaymentInCents,
            date
        };
    }, [payments]);
};