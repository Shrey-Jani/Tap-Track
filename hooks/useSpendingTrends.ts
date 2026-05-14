import { getAllPayments } from "@/services/PaymentRepository";
import { computeSpendingTrends, SpendingTrends } from "@/services/SpendingTrendsCalculator";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

const EMPTY_TRENDS: SpendingTrends = {
    dailyData: [],
    thisWeekTotalCents: 0,
    lastWeekTotalCents: 0,
    percentChangeFromLastWeek: 0,
};

export const useSpendingTrends = (): SpendingTrends => {
    const [trends, setTrends] = useState<SpendingTrends>(EMPTY_TRENDS);

    useFocusEffect(
        useCallback(() => {
            const loadTrends = async () => {
                const allPayments = await getAllPayments();
                setTrends(computeSpendingTrends(allPayments));
            };
            loadTrends();
        }, [])
    );

    return trends;
};
