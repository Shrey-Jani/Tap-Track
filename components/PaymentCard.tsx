import { Payment } from "@/models/payment";
import { formatCentstoDisplayCurrency } from "@/utils/formatCurrency";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CATEGORY_ICONS } from "../utils/constants";

interface PaymentCardProps{
    payment: Payment,
    onDelete : (id: string) => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({payment, onDelete}) => {
    const handleDelete = () => {
        onDelete(payment.id);
    } 

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Text style={styles.paymentCategory}>
                    {CATEGORY_ICONS[payment.category]}
                </Text>
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.merchantName}>{payment.merchantName}</Text>
                <Text style={styles.categoryText}>{payment.category}</Text>
            </View>

            <View style={styles.rightContainer}>
                <Text style={styles.amountText}>
                    {formatCentstoDisplayCurrency(payment.amountInCents)}
                </Text>
                <TouchableOpacity onPress={handleDelete} >
                    <Text style={styles.deleteIcon}>✕</Text>
        </TouchableOpacity>
            </View>
        </View>
    
        
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    paymentCategory: {
        fontSize: 24,
    },
    contentContainer: {
        flex: 1,
    },
    merchantName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    categoryText: {
        fontSize: 14,
        color: "#666",
    },
    rightContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    amountText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginRight: 12,
    },
    deleteIcon: {
        fontSize: 20,
        color: "#ff4444",
    },
});