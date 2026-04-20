import { PaymentCategory } from "@/models/payment";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-chart-kit";

const CATEGORY_COLORS: Record<PaymentCategory, string> = {
    FOOD: "#FF6384",
    TRANSPORT: "#36A2EB",
    SHOPPING: "#FFCE56",
    ENTERTAINMENT: "#4BC0C0",
    BILLS: "#9966FF",
    HEALTH: "#FF9F40",
    OTHER: "#C9CBCF",
};

interface SpendingChartProps {
    categoryBreakdown: Record<PaymentCategory, number>;
}

const SpendingChart: React.FC<SpendingChartProps> = ({categoryBreakdown}) => {
    const screenWidth = Dimensions.get("window").width - 32;

    const nonZeroCategories = Object.entries(categoryBreakdown).filter(
        ([, amount]) => amount > 0) as [PaymentCategory, number][];
    if (nonZeroCategories.length === 0){
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No spending data to chart</Text>
            </View>
        );
    }

    const chartData = nonZeroCategories.map(([category, amount]) => ({
        name: category,
        amount: amount/100,
        color: CATEGORY_COLORS[category],
        legendFontColor: "#FFFFFF",
        legendFontSize: 11,
    }));

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Spending Breakdown</Text>
            <PieChart 
                data={chartData}
                width={screenWidth}
                height={200}
                chartConfig={{
                    color:(opacity = 1) => `rgba(255, 255, ${opacity})`,
                }} 
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="8"
                absolute
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1E1E2E",
        borderRadius: 16,
        padding: 16,
        marginVertical: 12,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 12,
    },
    emptyContainer: {
        backgroundColor: "#1E1E2E",
        borderRadius: 16,
        padding: 24,
        marginVertical: 12,
        alignItems: "center",
    },
    emptyText: {
        color: "#888",
        fontSize: 14,
    },
});

export default SpendingChart;
