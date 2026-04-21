import { Payment } from "@/models/payment";

export interface RecurringPayment {
    merchantName: string;
    frequency: number;
    totalSpentInCents: number;
    lastPaymentTimestamp: number;
}

export function detectRecurringPayment(payments: Payment[]):
RecurringPayment[]{
    const merchantMap: Record<string, {
        count: number;
        totalCents: number;
        lastTimestamp: number;
    }> = {};

    payments.forEach((payment) => {
        const normalizedName = payment.merchantName.trim().toLocaleLowerCase();

        if(!merchantMap[normalizedName]){
            merchantMap[normalizedName] = {count:0, totalCents:0, lastTimestamp: 0};
        }

        merchantMap[normalizedName].count += 1;
        merchantMap[normalizedName].totalCents += payment.amountInCents;

        if(payment.timestamp > merchantMap[normalizedName].lastTimestamp) {
            merchantMap[normalizedName].lastTimestamp = payment.timestamp;
        }
    });

    const recurringPayments: RecurringPayment[] = Object.entries(merchantMap)
        .filter(([, data]) => data.count >= 3)
        .map(([merchantName, data]) => ({
            merchantName: merchantName.charAt(0).toUpperCase() + merchantName.slice(1),
            frequency: data.count,
            totalSpentInCents: data.totalCents,
            lastPaymentTimestamp: data.lastTimestamp,
        }))
        .sort((a,b) => b.frequency - a.frequency);
    
    return recurringPayments;
}
