import { Payment } from "@/models/payment";
import { endOfDay, format, startOfDay, subDays } from "date-fns";

export interface DailySpending {
    dateLabel: string;
    totalCents: number;
}

export interface SpendingTrends {
    dailyData: DailySpending[];
    thisWeekTotalCents: number;
    lastWeekTotalCents: number;
    percentChangeFromLastWeek: number;
}

function sumPaymentsInRange(payments: Payment[], startTimestamp: number, endTimestamp: number): number {
    return payments
        .filter((p) => p.timestamp >= startTimestamp && p.timestamp <= endTimestamp)
        .reduce((sum, p) => sum + p.amountInCents, 0);
}

export function computeSpendingTrends(payments: Payment[]): SpendingTrends {
    const now = new Date();
    const dailyData: DailySpending[] = [];

    for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
        const day = subDays(now, daysAgo);
        const dayStart = startOfDay(day).getTime();
        const dayEnd = endOfDay(day).getTime();

        dailyData.push({
            dateLabel: format(day, "EEE"),
            totalCents: sumPaymentsInRange(payments, dayStart, dayEnd),
        });
    }

    const thisWeekStart = startOfDay(subDays(now, 6)).getTime();
    const thisWeekEnd = endOfDay(now).getTime();
    const lastWeekStart = startOfDay(subDays(now, 13)).getTime();
    const lastWeekEnd = endOfDay(subDays(now, 7)).getTime();

    const thisWeekTotalCents = sumPaymentsInRange(payments, thisWeekStart, thisWeekEnd);
    const lastWeekTotalCents = sumPaymentsInRange(payments, lastWeekStart, lastWeekEnd);

    const percentChangeFromLastWeek = lastWeekTotalCents > 0
        ? ((thisWeekTotalCents - lastWeekTotalCents) / lastWeekTotalCents) * 100
        : 0;

    return {
        dailyData,
        thisWeekTotalCents,
        lastWeekTotalCents,
        percentChangeFromLastWeek,
    };
}
