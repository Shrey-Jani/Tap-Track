import { DailySummary } from "@/models/payment";
import { formatCentstoDisplayCurrency } from "@/utils/formatCurrency";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface DailySummaryCardProps{
    summary: DailySummary
}

export const DailySummaryCard: React.FC<DailySummaryCardProps> = ({summary}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Today's Summary</Text>

            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.label}>Total Spent</Text>
                    <Text style={[styles.value, styles.totalValue]}>
                        {formatCentstoDisplayCurrency(summary.totalSpentInCents)}</Text>
                </View>

                <View style={styles.statBox}>
                    <Text style={styles.label}>Total Payments</Text>
                    <Text style={styles.value}>{summary.transactionCount}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.label}>Average Spent</Text>
                    <Text style={styles.value}>{formatCentstoDisplayCurrency(summary.averagePaymentInCents)}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container:{
        backgroundColor:"#2A2A3C",
        padding: 20,
        borderRadius: 16,
        marginVertical: 10,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    
    title: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 20,
    },

    statsRow: {
        flexDirection:'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },

    statBox: {
        flex: 1,
    },

    label: {
        color: "#888888",
        fontSize: 12,
        marginBottom: 4,
    },

    value: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },

    totalValue: {
        color:"#4ADE0",
        fontSize: 20,
    },
});