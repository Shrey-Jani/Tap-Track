import DailySummaryCard from "@/components/DailySummaryCard";
import RecurringMerchantsCard from "@/components/RecurringMerchantsCard";
import SpendingChart from "@/components/SpendingChart";
import SpendingTrendsCard from "@/components/SpendingTrendsCard";
import Card from "@/design/Card";
import PrimaryButton from "@/design/PrimaryButton";
import { spacing, typography } from "@/design/theme";
import { useTheme } from "@/design/useTheme";
import { useDailySummary } from "@/hooks/useDailySummary";
import { usePayments } from "@/hooks/usePayments";
import { useRecurringPayments } from "@/hooks/useRecurringPayments";
import { useSpendingTrends } from "@/hooks/useSpendingTrends";
import { exportDailySummaryAsPdf } from "@/services/PdfExportService";
import { useAppstore } from "@/store/appStore";
import { formatCentstoDisplayCurrency } from "@/utils/formatCurrency";
import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

const SummaryScreen: React.FC = () => {
    const { palette } = useTheme();
    const { payment } = usePayments();
    const summary = useDailySummary(payment);
    const recurringPayments = useRecurringPayments();
    const spendingTrends = useSpendingTrends();
    const currencyCode = useAppstore((s) => s.currencyCode);

    const cardBreakdown = useMemo(() => {
        const grouped: Record<string, { total: number; count: number }> = {};
        payment.forEach((p) => {
            if (!grouped[p.cardLastFourDigits]) {
                grouped[p.cardLastFourDigits] = { total: 0, count: 0 };
            }
            grouped[p.cardLastFourDigits].total += p.amountInCents;
            grouped[p.cardLastFourDigits].count += 1;
        });
        return Object.entries(grouped);
    }, [payment]);

    const handleExportPdf = async () => {
        try {
            await exportDailySummaryAsPdf(summary, payment, summary.date);
        } catch {
            Alert.alert("Export Failed", "Could not generate PDF please try again");
        }
    };

    const styles = useMemo(() => StyleSheet.create({
        container: { flex: 1, backgroundColor: palette.bg.base },
        content: {
            paddingTop: 60,
            paddingHorizontal: spacing.lg,
            paddingBottom: 120,
        },
        title: {
            ...typography.h1,
            color: palette.text.primary,
            marginBottom: spacing.lg,
        },
        gap: { height: spacing.md },
        headerRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: spacing.md,
        },
        sectionTitle: {
            ...typography.h3,
            color: palette.text.primary,
        },
        cardRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: spacing.md,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: palette.border.subtle,
            marginTop: spacing.sm,
        },
        cardRowFirst: {
            borderTopWidth: 0,
            marginTop: 0,
            paddingTop: 0,
        },
        cardChip: {
            ...typography.bodyStrong,
            color: palette.text.primary,
            fontVariant: ["tabular-nums"],
        },
        cardRight: { alignItems: "flex-end" },
        cardAmount: {
            ...typography.bodyStrong,
            color: palette.brand.primary,
            fontVariant: ["tabular-nums"],
        },
        cardCount: {
            ...typography.caption,
            color: palette.text.muted,
            marginTop: 2,
        },
    }), [palette]);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Insights</Text>

            <DailySummaryCard summary={summary} />

            <View style={styles.gap} />
            <SpendingTrendsCard trends={spendingTrends} />

            <View style={styles.gap} />
            <SpendingChart categoryBreakdown={summary.categoryBreakdown} />

            {cardBreakdown.length > 0 && (
                <>
                    <View style={styles.gap} />
                    <Card padding={spacing.lg}>
                        <View style={styles.headerRow}>
                            <Feather name="credit-card" size={16} color={palette.brand.primary} />
                            <Text style={styles.sectionTitle}>By Card</Text>
                        </View>
                        {cardBreakdown.map(([lastFour, data], idx) => (
                            <View
                                key={lastFour}
                                style={[styles.cardRow, idx === 0 && styles.cardRowFirst]}
                            >
                                <Text style={styles.cardChip}>•••• {lastFour}</Text>
                                <View style={styles.cardRight}>
                                    <Text style={styles.cardAmount}>
                                        {formatCentstoDisplayCurrency(data.total, currencyCode)}
                                    </Text>
                                    <Text style={styles.cardCount}>
                                        {data.count} txn{data.count > 1 ? "s" : ""}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </Card>
                </>
            )}

            <View style={styles.gap} />
            <RecurringMerchantsCard recurringPayments={recurringPayments} />

            <View style={[styles.gap, { marginTop: spacing.xl }]} />
            <PrimaryButton
                label="Export as PDF"
                onPress={handleExportPdf}
                variant="ghost"
                icon={<Feather name="download" size={18} color={palette.brand.primary} />}
            />
        </ScrollView>
    );
};

export default SummaryScreen;
