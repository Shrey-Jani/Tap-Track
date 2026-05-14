import { formatCentstoDisplayCurrency } from "@/utils/formatCurrency";
import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

export interface SpendingWidgetProps {
    totalSpentInCents: number;
    transactionCount: number;
    dailyBudgetInCents: number;
}

const SpendingWidget: React.FC<SpendingWidgetProps> = ({
    totalSpentInCents,
    transactionCount,
    dailyBudgetInCents,
}) => {
    const hasBudget = dailyBudgetInCents > 0;
    const isOverBudget = hasBudget && totalSpentInCents > dailyBudgetInCents;
    const accentColor = isOverBudget ? "#F87171" : "#4ADE80";

    const budgetProgressPercent = hasBudget
        ? Math.min(100, Math.round((totalSpentInCents / dailyBudgetInCents) * 100))
        : 0;

    return (
        <FlexWidget
            style={{
                height: "match_parent",
                width: "match_parent",
                backgroundColor: "#1E1E2E",
                borderRadius: 16,
                padding: 14,
                flexDirection: "column",
                justifyContent: "space-between",
            }}
            clickAction="OPEN_APP"
        >
            <FlexWidget
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <TextWidget
                    text="Today's Spend"
                    style={{
                        fontSize: 12,
                        color: "#888888",
                        fontWeight: "600",
                    }}
                />
                <TextWidget
                    text="TapTrack"
                    style={{
                        fontSize: 11,
                        color: accentColor,
                        fontWeight: "700",
                    }}
                />
            </FlexWidget>

            <TextWidget
                text={formatCentstoDisplayCurrency(totalSpentInCents)}
                style={{
                    fontSize: 28,
                    color: accentColor,
                    fontWeight: "bold",
                }}
            />

            <FlexWidget
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <TextWidget
                    text={`${transactionCount} txn${transactionCount === 1 ? "" : "s"}`}
                    style={{
                        fontSize: 12,
                        color: "#AAAAAA",
                    }}
                />
                {hasBudget && (
                    <TextWidget
                        text={`${budgetProgressPercent}% of budget`}
                        style={{
                            fontSize: 12,
                            color: isOverBudget ? "#F87171" : "#AAAAAA",
                            fontWeight: "600",
                        }}
                    />
                )}
            </FlexWidget>
        </FlexWidget>
    );
};

export default SpendingWidget;
