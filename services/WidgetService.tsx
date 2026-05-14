import { getPaymentsByDataRange } from "@/services/PaymentRepository";
import { DEFAULT_DAILY_BUDGET_IN_CENTS } from "@/utils/constants";
import { getEndOfDayTimestamp, getStartOfDayTimestamp } from "@/utils/dateHelpers";
import SpendingWidget from "@/widgets/SpendingWidget";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { Platform } from "react-native";
import { requestWidgetUpdate } from "react-native-android-widget";

const BUDGET_STORAGE_KEY = "taptrack_daily_budget";
const SPENDING_WIDGET_NAME = "SpendingWidget";

export async function refreshSpendingWidget(): Promise<void> {
    if (Platform.OS !== "android") {
        return;
    }

    const now = new Date();
    const startTimestamp = getStartOfDayTimestamp(now);
    const endTimestamp = getEndOfDayTimestamp(now);

    const todayPayments = await getPaymentsByDataRange(startTimestamp, endTimestamp);

    const totalSpentInCents = todayPayments.reduce((sum, p) => sum + p.amountInCents, 0);
    const transactionCount = todayPayments.length;

    const storedBudget = await AsyncStorage.getItem(BUDGET_STORAGE_KEY);
    const dailyBudgetInCents = storedBudget
        ? parseInt(storedBudget, 10)
        : DEFAULT_DAILY_BUDGET_IN_CENTS;

    await requestWidgetUpdate({
        widgetName: SPENDING_WIDGET_NAME,
        renderWidget: () => (
            <SpendingWidget
                totalSpentInCents={totalSpentInCents}
                transactionCount={transactionCount}
                dailyBudgetInCents={dailyBudgetInCents}
            />
        ),
        widgetNotFound: () => undefined,
    });
}
