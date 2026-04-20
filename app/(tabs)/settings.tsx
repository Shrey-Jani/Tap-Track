import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppstore } from "@/store/appStore";
import { formatCentstoDisplayCurrency } from "@/utils/formatCurrency";

const SettingsScreen: React.FC = () => {
    const { dailyBudgetInCents, loadBudget, saveBudget } = useAppstore();
    const [budgetText, setBudgetText] = useState<string>("");

    useEffect(() => {
        loadBudget();
    }, []);

    useEffect(() => {
        setBudgetText((dailyBudgetInCents / 100).toFixed(2));
    }, [dailyBudgetInCents]);

    const handleSaveBudget = () => {
        const parsed = parseFloat(budgetText);
        if (isNaN(parsed) || parsed <= 0) {
            Alert.alert("Invalid Budget", "Please enter a valid amount greater than $0.");
            return;
        }
        const budgetInCents = Math.round(parsed * 100);
        saveBudget(budgetInCents);
        Alert.alert("Budget Saved ✅", `Your daily budget is now ${formatCentstoDisplayCurrency(budgetInCents)}.`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Daily Budget</Text>
                <Text style={styles.sectionHint}>
                    You'll get an alert when your daily spending exceeds this amount.
                </Text>
                <View style={styles.budgetRow}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                        style={styles.budgetInput}
                        value={budgetText}
                        onChangeText={setBudgetText}
                        keyboardType="decimal-pad"
                        placeholder="100.00"
                        placeholderTextColor="#555"
                    />
                </View>
                <Text style={styles.currentBudget}>
                    Current: {formatCentstoDisplayCurrency(dailyBudgetInCents)}
                </Text>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveBudget}>
                    <Text style={styles.saveButtonText}>Save Budget</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>App Info</Text>
                <Text style={styles.settingItem}>Currency: CAD</Text>
                <Text style={styles.settingItem}>Version: 1.0.0</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121218",
        padding: 16,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 24,
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        color: "#4ADE80",
        fontSize: 14,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 6,
    },
    sectionHint: {
        color: "#888",
        fontSize: 13,
        marginBottom: 12,
    },
    budgetRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1E1E2E",
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    currencySymbol: {
        color: "#4ADE80",
        fontSize: 28,
        fontWeight: "bold",
        marginRight: 8,
    },
    budgetInput: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 28,
        paddingVertical: 16,
    },
    currentBudget: {
        color: "#888",
        fontSize: 13,
        marginTop: 8,
    },
    saveButton: {
        backgroundColor: "#4ADE80",
        borderRadius: 12,
        padding: 14,
        alignItems: "center",
        marginTop: 12,
    },
    saveButtonText: {
        color: "#000000",
        fontSize: 16,
        fontWeight: "bold",
    },
    settingItem: {
        color: "#FFFFFF",
        fontSize: 16,
        marginBottom: 10,
        backgroundColor: "#1E1E2E",
        padding: 14,
        borderRadius: 12,
    },
});

export default SettingsScreen;