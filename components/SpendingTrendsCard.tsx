import Card from "@/design/Card";
import { spacing, typography } from "@/design/theme";
import { useTheme } from "@/design/useTheme";
import { SpendingTrends } from "@/services/SpendingTrendsCalculator";
import { useAppstore } from "@/store/appStore";
import { formatCentstoDisplayCurrency } from "@/utils/formatCurrency";
import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

interface SpendingTrendsCardProps {
    trends: SpendingTrends;
}

const SpendingTrendsCard: React.FC<SpendingTrendsCardProps> = ({ trends }) => {
    const { palette, gradients, mode } = useTheme();
    const currencyCode = useAppstore((s) => s.currencyCode);
    const chartWidth = Dimensions.get("window").width - 64;
    const { dailyData, thisWeekTotalCents, lastWeekTotalCents, percentChangeFromLastWeek } = trends;

    const hasSpending = dailyData.some((d) => d.totalCents > 0);
    const isUp = percentChangeFromLastWeek > 0;
    const isDown = percentChangeFromLastWeek < 0;
    const trendColor = isUp ? palette.semantic.danger : isDown ? palette.semantic.success : palette.text.muted;
    const trendIcon = isUp ? "trending-up" : isDown ? "trending-down" : "minus";

    const chartTextColor = mode === "light"
        ? "rgba(10, 10, 18, 0.55)"
        : "rgba(255, 255, 255, 0.55)";
    const brandRgb = mode === "light" ? "22, 163, 74" : "74, 222, 128";

    const styles = useMemo(() => StyleSheet.create({
        headerRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: spacing.md,
        },
        title: {
            ...typography.h3,
            color: palette.text.primary,
        },
        pill: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
            borderWidth: 1,
        },
        pillText: {
            ...typography.caption,
            fontWeight: "700",
        },
        compareRow: {
            flexDirection: "row",
            gap: spacing.lg,
            marginBottom: spacing.md,
        },
        compareCol: { flex: 1 },
        compareLabel: {
            ...typography.caption,
            color: palette.text.muted,
            marginBottom: 4,
        },
        compareValueBright: {
            ...typography.h2,
            color: palette.brand.primary,
            fontVariant: ["tabular-nums"],
        },
        compareValueDim: {
            ...typography.h2,
            color: palette.text.secondary,
            fontVariant: ["tabular-nums"],
        },
        chart: {
            marginLeft: -spacing.lg,
            borderRadius: 8,
        },
        emptyText: {
            ...typography.caption,
            color: palette.text.muted,
            textAlign: "center",
            marginVertical: spacing.lg,
        },
    }), [palette]);

    return (
        <Card padding={spacing.lg}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Weekly Trends</Text>
                <View style={[styles.pill, { borderColor: trendColor + "55", backgroundColor: trendColor + "11" }]}>
                    <Feather name={trendIcon as "trending-up" | "trending-down" | "minus"} size={12} color={trendColor} />
                    {lastWeekTotalCents > 0 && (
                        <Text style={[styles.pillText, { color: trendColor }]}>
                            {Math.abs(percentChangeFromLastWeek).toFixed(0)}%
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.compareRow}>
                <View style={styles.compareCol}>
                    <Text style={styles.compareLabel}>This week</Text>
                    <Text style={styles.compareValueBright}>
                        {formatCentstoDisplayCurrency(thisWeekTotalCents, currencyCode)}
                    </Text>
                </View>
                <View style={styles.compareCol}>
                    <Text style={styles.compareLabel}>Last week</Text>
                    <Text style={styles.compareValueDim}>
                        {formatCentstoDisplayCurrency(lastWeekTotalCents, currencyCode)}
                    </Text>
                </View>
            </View>

            {hasSpending ? (
                <BarChart
                    data={{
                        labels: dailyData.map((d) => d.dateLabel),
                        datasets: [{ data: dailyData.map((d) => d.totalCents / 100) }],
                    }}
                    width={chartWidth}
                    height={170}
                    yAxisLabel=""
                    yAxisSuffix=""
                    fromZero
                    withInnerLines={false}
                    withHorizontalLabels={false}
                    chartConfig={{
                        backgroundColor: palette.bg.surface,
                        backgroundGradientFrom: palette.bg.surface,
                        backgroundGradientTo: palette.bg.surface,
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(${brandRgb}, ${opacity})`,
                        labelColor: () => chartTextColor,
                        barPercentage: 0.55,
                        fillShadowGradientFrom: gradients.brand[0],
                        fillShadowGradientTo: gradients.brand[1],
                        fillShadowGradientFromOpacity: 1,
                        fillShadowGradientToOpacity: 0.4,
                    }}
                    style={styles.chart}
                />
            ) : (
                <Text style={styles.emptyText}>No spending in the past 7 days</Text>
            )}
        </Card>
    );
};

export default SpendingTrendsCard;
