import { DailySummaryCard } from "@/components/DailySummaryCard";
import SpendingChart from "@/components/SpendingChart";
import { useDailySummary } from "@/hooks/useDailySummary";
import { usePayments } from "@/hooks/usePayments";
import { PaymentCategory } from "@/models/payment";
import { exportDailySummaryAsPdf } from "@/services/PdfExportService";
import { CATEGORY_ICONS } from "@/utils/constants";
import { formatCentstoDisplayCurrency } from "@/utils/formatCurrency";
import React, { useMemo } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

  const cardBreakdown = useMemo(() => {
    const grouped:Record<string, {total: number, count: number}> = {};
    payment.forEach((p) => {
      if(!grouped[p.cardLastFourDigits]) {
        grouped[p.cardLastFourDigits] = {total:0, count:0};
    }
    grouped[p.cardLastFourDigits].total += p.amountInCents;
    grouped[p.cardLastFourDigits].count += 1;
    });
    return Object.entries(grouped);
  }, [payment]);

  const handleExportPdf = async () => {
    try{
      await exportDailySummaryAsPdf(summary, payment, summary.date);
    }
    catch (error){
      Alert.alert("Export Failed", "Could not generate PDF please try again");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Daily Breakdown</Text>

      <DailySummaryCard summary={summary} />

      <SpendingChart categoryBreakdown={summary.categoryBreakdown} />
      <Text style={styles.sectionTitle}>By Category</Text>

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
      {cardBreakdown.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>By Card</Text>
                    {cardBreakdown.map(([lastFour, data]) => (
                        <View key={lastFour} style={styles.cardRow}>
                            <Text style={styles.cardIcon}>💳</Text>
                            <Text style={styles.cardNumber}>•••• {lastFour}</Text>
                            <View style={styles.cardStats}>
                                <Text style={styles.cardAmount}>
                                    {formatCentstoDisplayCurrency(data.total)}
                                </Text>
                                <Text style={styles.cardCount}>{data.count} txn{data.count > 1 ? "s" : ""}</Text>
                            </View>
                        </View>
                    ))}
                </>
            )}

            <TouchableOpacity style={styles.exportButton} onPress={handleExportPdf}>
                <Text style={styles.exportButtonText}>📄 Export as PDF</Text>
            </TouchableOpacity>
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
  sectionTitle: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 12,
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
  cardRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1E1E2E",
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
    },
  cardIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    cardNumber: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "500",
    },
    cardStats: {
        alignItems: "flex-end",
    },
    cardAmount: {
        color: "#4ADE80",
        fontSize: 15,
        fontWeight: "600",
    },
    cardCount: {
        color: "#888",
        fontSize: 12,
        marginTop: 2,
    },  
  emptyText: {
    color: "#888",
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
  },
  exportButton: {
        backgroundColor: "#2A2A3C",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        marginTop: 24,
        borderWidth: 1,
        borderColor: "#4ADE80",
    },
    exportButtonText: {
        color: "#4ADE80",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default SummaryScreen;