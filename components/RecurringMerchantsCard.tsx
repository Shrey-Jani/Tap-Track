import Card from "@/design/Card";
import { spacing, typography } from "@/design/theme";
import { useTheme } from "@/design/useTheme";
import { RecurringPayment } from "@/services/RecurringPaymentDetector";
import { useAppstore } from "@/store/appStore";
import { formatCentstoDisplayCurrency } from "@/utils/formatCurrency";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface RecurringMerchantsCardProps {
    recurringPayments: RecurringPayment[];
}

const RecurringMerchantsCard: React.FC<RecurringMerchantsCardProps> = ({ recurringPayments }) => {
    const { palette } = useTheme();
    const currencyCode = useAppstore((s) => s.currencyCode);

    const styles = useMemo(() => StyleSheet.create({
        headerRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
        },
        title: {
            ...typography.h3,
            color: palette.text.primary,
        },
        subtitle: {
            ...typography.caption,
            color: palette.text.muted,
            marginTop: 2,
            marginBottom: spacing.md,
        },
        row: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: spacing.md,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: palette.border.subtle,
            marginTop: spacing.sm,
        },
        rowFirst: {
            borderTopWidth: 0,
            marginTop: 0,
            paddingTop: 0,
        },
        left: { flex: 1 },
        merchant: {
            ...typography.bodyStrong,
            color: palette.text.primary,
        },
        lastPaid: {
            ...typography.caption,
            color: palette.text.muted,
            marginTop: 2,
        },
        right: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
        },
        amount: {
            ...typography.bodyStrong,
            color: palette.brand.primary,
            fontVariant: ["tabular-nums"],
        },
        freqPill: {
            backgroundColor: palette.bg.elevated,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 999,
        },
        freqText: {
            ...typography.caption,
            color: palette.text.secondary,
            fontWeight: "700",
        },
    }), [palette]);

    if (recurringPayments.length === 0) return null;

    return (
        <Card padding={spacing.lg}>
            <View style={styles.headerRow}>
                <Feather name="repeat" size={16} color={palette.brand.primary} />
                <Text style={styles.title}>Recurring Merchants</Text>
            </View>
            <Text style={styles.subtitle}>Paid 3 or more times</Text>

            {recurringPayments.map((rp, idx) => (
                <View key={rp.merchantName} style={[styles.row, idx === 0 && styles.rowFirst]}>
                    <View style={styles.left}>
                        <Text style={styles.merchant}>{rp.merchantName}</Text>
                        <Text style={styles.lastPaid}>
                            Last: {format(new Date(rp.lastPaymentTimestamp), "MMM dd, yyyy")}
                        </Text>
                    </View>
                    <View style={styles.right}>
                        <Text style={styles.amount}>
                            {formatCentstoDisplayCurrency(rp.totalSpentInCents, currencyCode)}
                        </Text>
                        <View style={styles.freqPill}>
                            <Text style={styles.freqText}>×{rp.frequency}</Text>
                        </View>
                    </View>
                </View>
            ))}
        </Card>
    );
};

export default RecurringMerchantsCard;
