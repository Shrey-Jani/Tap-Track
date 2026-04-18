import { DailySummaryCard } from "@/components/DailySummaryCard";
import { useDailySummary } from "@/hooks/useDailySummary";
import { usePayments } from "@/hooks/usePayments";
import { PaymentCategory } from "@/models/payment";
import { CATEGORY_ICONS } from "@/utils/constants";
import { formatCentstoDisplayCurrency } from "@/utils/formatCurrency";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const SummaryScreen: React.FC = () => {
  const { payment } = usePayments();
  const summary = useDailySummary(payment);

  const categoryEntries = Object.entries(summary.categoryBreakdown) as [
    PaymentCategory,
    number
  ][];

  const nonZeroCategories = categoryEntries.filter(
    ([, amount]) => amount > 0
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Daily Breakdown</Text>

      <DailySummaryCard summary={summary} />

      <View style={styles.categoryList}>
        {nonZeroCategories.map(([category, amount]) => (
          <View key={category} style={styles.categoryRow}>
            <Text style={styles.categoryIcon}>
              {CATEGORY_ICONS[category]}
            </Text>
            <Text style={styles.categoryName}>{category}</Text>
            <Text style={styles.categoryAmount}>
              {formatCentstoDisplayCurrency(amount)}
            </Text>
          </View>
        ))}

        {nonZeroCategories.length === 0 && (
          <Text style={styles.emptyText}>No payments recorded today.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121218",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  categoryList: {
    marginTop: 20,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E2E",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  categoryAmount: {
    color: "#4ADE80",
    fontSize: 15,
    fontWeight: "600",
  },
  emptyText: {
    color: "#888",
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
  },
});

export default SummaryScreen;