import { SpendingTrends } from "@/services/SpendingTrendsCalculator";
import { formatCentstoDisplayCurrency } from "@/utils/formatCurrency";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

interface SpendingTrendsCardProps {
    trends: SpendingTrends;
}

const SpendingTrendsCard: React.FC<SpendingTrendsCardProps> = ({ trends }) => {
    const chartWidth = Dimensions.get("window").width - 64;
    const { dailyData, thisWeekTotalCents, lastWeekTotalCents, percentChangeFromLastWeek } = trends;

    const hasSpendingThisWeek = dailyData.some((day) => day.totalCents > 0);
    const isUp = percentChangeFromLastWeek > 0;
    const isDown = percentChangeFromLastWeek < 0;
    const directionArrow = isUp ? "↑" : isDown ? "↓" : "•";
    const changeColor = isUp ? "#F87171" : isDown ? "#4ADE80" : "#888";

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📈 Weekly Trends</Text>

            <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>This Week</Text>
                    <Text style={styles.summaryValue}>
                        {formatCentstoDisplayCurrency(thisWeekTotalCents)}
                    </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Last Week</Text>
                    <Text style={[styles.summaryValue, styles.muted]}>
                        {formatCentstoDisplayCurrency(lastWeekTotalCents)}
                    </Text>
                </View>
            </View>

            {lastWeekTotalCents > 0 && (
                <Text style={[styles.changeText, { color: changeColor }]}>
                    {directionArrow} {Math.abs(percentChangeFromLastWeek).toFixed(0)}% vs last week
                </Text>
            )}

            {hasSpendingThisWeek ? (
                <BarChart
                    data={{
                        labels: dailyData.map((d) => d.dateLabel),
                        datasets: [{ data: dailyData.map((d) => d.totalCents / 100) }],
                    }}
                    width={chartWidth}
                    height={180}
                    yAxisLabel="$"
                    yAxisSuffix=""
                    fromZero
                    showValuesOnTopOfBars={false}
                    chartConfig={{
                        backgroundColor: "#1E1E2E",
                        backgroundGradientFrom: "#1E1E2E",
                        backgroundGradientTo: "#1E1E2E",
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(74, 222, 128, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        barPercentage: 0.6,
                    }}
                    style={styles.chart}
                />
            ) : (
                <Text style={styles.emptyText}>No spending in the past 7 days</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1E1E2E",
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    summaryItem: {
        flex: 1,
    },
    summaryDivider: {
        width: 1,
        height: 32,
        backgroundColor: "#2A2A3C",
        marginHorizontal: 12,
    },
    summaryLabel: {
        color: "#888",
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    summaryValue: {
        color: "#4ADE80",
        fontSize: 20,
        fontWeight: "700",
    },
    muted: {
        color: "#AAAAAA",
    },
    changeText: {
        marginTop: 10,
        fontSize: 13,
        fontWeight: "600",
    },
    chart: {
        marginTop: 12,
        borderRadius: 8,
    },
    emptyText: {
        color: "#888",
        fontSize: 13,
        marginTop: 16,
        textAlign: "center",
    },
});

export default SpendingTrendsCard;
