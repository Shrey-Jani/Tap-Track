import Card from "@/design/Card";
import { CATEGORY_SOLID, spacing, typography } from "@/design/theme";
import { useTheme } from "@/design/useTheme";
import { PaymentCategory } from "@/models/payment";
import { useAppstore } from "@/store/appStore";
import { CATEGORY_ICONS } from "@/utils/constants";
import { formatCentstoDisplayCurrency } from "@/utils/formatCurrency";
import React, { useMemo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-chart-kit";

interface SpendingChartProps {
    categoryBreakdown: Record<PaymentCategory, number>;
}

const SpendingChart: React.FC<SpendingChartProps> = ({ categoryBreakdown }) => {
    const { palette, mode } = useTheme();
    const currencyCode = useAppstore((s) => s.currencyCode);
    const screenWidth = Dimensions.get("window").width - 64;

    const nonZeroCategories = (Object.entries(categoryBreakdown) as [PaymentCategory, number][])
        .filter(([, amount]) => amount > 0);

    const styles = useMemo(() => StyleSheet.create({
        title: {
            ...typography.h3,
            color: palette.text.primary,
            marginBottom: spacing.md,
        },
        chartWrap: { alignItems: "center" },
        legend: { marginTop: spacing.md, gap: 10 },
        legendItem: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        legendLeft: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
        },
        dot: { width: 8, height: 8, borderRadius: 4 },
        legendIcon: { fontSize: 14 },
        legendName: {
            ...typography.body,
            color: palette.text.primary,
        },
        legendRight: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
        },
        legendAmount: {
            ...typography.body,
            color: palette.text.secondary,
            fontVariant: ["tabular-nums"],
        },
        legendPercent: {
            ...typography.caption,
            color: palette.text.muted,
            minWidth: 30,
            textAlign: "right",
            fontVariant: ["tabular-nums"],
        },
        emptyText: {
            ...typography.caption,
            color: palette.text.muted,
            marginTop: spacing.md,
            textAlign: "center",
        },
    }), [palette]);

    if (nonZeroCategories.length === 0) {
        return (
            <Card padding={spacing.lg}>
                <Text style={styles.title}>Category Breakdown</Text>
                <Text style={styles.emptyText}>No spending data to chart</Text>
            </Card>
        );
    }

    const total = nonZeroCategories.reduce((sum, [, amount]) => sum + amount, 0);
    const chartLabelRgb = mode === "light" ? "10, 10, 18" : "255, 255, 255";

    const chartData = nonZeroCategories.map(([category, amount]) => ({
        name: category,
        amount: amount / 100,
        color: CATEGORY_SOLID[category],
        legendFontColor: palette.text.secondary,
        legendFontSize: 11,
    }));

    return (
        <Card padding={spacing.lg}>
            <Text style={styles.title}>Category Breakdown</Text>

            <View style={styles.chartWrap}>
                <PieChart
                    data={chartData}
                    width={screenWidth}
                    height={170}
                    chartConfig={{
                        color: (opacity = 1) => `rgba(${chartLabelRgb}, ${opacity})`,
                    }}
                    accessor="amount"
                    backgroundColor="transparent"
                    paddingLeft="0"
                    hasLegend={false}
                    absolute
                />
            </View>

            <View style={styles.legend}>
                {nonZeroCategories.map(([category, amount]) => {
                    const percent = Math.round((amount / total) * 100);
                    return (
                        <View key={category} style={styles.legendItem}>
                            <View style={styles.legendLeft}>
                                <View style={[styles.dot, { backgroundColor: CATEGORY_SOLID[category] }]} />
                                <Text style={styles.legendIcon}>{CATEGORY_ICONS[category]}</Text>
                                <Text style={styles.legendName}>{category}</Text>
                            </View>
                            <View style={styles.legendRight}>
                                <Text style={styles.legendAmount}>
                                    {formatCentstoDisplayCurrency(amount, currencyCode)}
                                </Text>
                                <Text style={styles.legendPercent}>{percent}%</Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </Card>
    );
};

export default SpendingChart;
