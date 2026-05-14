import { RecurringPayment } from "@/services/RecurringPaymentDetector";
import { formatCentstoDisplayCurrency } from "@/utils/formatCurrency";
import { format } from "date-fns";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface RecurringMerchantsCardProps {
    recurringPayments: RecurringPayment[];
}

const RecurringMerchantsCard: React.FC<RecurringMerchantsCardProps> = ({ recurringPayments }) => {
    if (recurringPayments.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🔁 Recurring Merchants</Text>
            <Text style={styles.subtitle}>Merchants you've paid 3 or more times</Text>

            {recurringPayments.map((rp) => (
                <View key={rp.merchantName} style={styles.row}>
                    <View style={styles.left}>
                        <Text style={styles.merchant}>{rp.merchantName}</Text>
                        <Text style={styles.lastPaid}>
                            Last: {format(new Date(rp.lastPaymentTimestamp), "MMM dd, yyyy")}
                        </Text>
                    </View>
                    <View style={styles.right}>
                        <Text style={styles.amount}>
                            {formatCentstoDisplayCurrency(rp.totalSpentInCents)}
                        </Text>
                        <Text style={styles.frequency}>
                            {rp.frequency} payments
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1E1E2E",
        borderRadius: 16,
        padding: 16,
        marginTop: 20,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
    },
    subtitle: {
        color: "#888",
        fontSize: 12,
        marginBottom: 12,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#2A2A3C",
    },
    left: {
        flex: 1,
    },
    merchant: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
    lastPaid: {
        color: "#888",
        fontSize: 12,
        marginTop: 2,
    },
    right: {
        alignItems: "flex-end",
    },
    amount: {
        color: "#4ADE80",
        fontSize: 15,
        fontWeight: "600",
    },
    frequency: {
        color: "#888",
        fontSize: 12,
        marginTop: 2,
    },
});

export default RecurringMerchantsCard;
