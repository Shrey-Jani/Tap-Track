import AnimatedAmount from "@/design/AnimatedAmount";
import Card from "@/design/Card";
import { spacing, typography } from "@/design/theme";
import { useTheme } from "@/design/useTheme";
import { DailySummary } from "@/models/payment";
import { useAppstore } from "@/store/appStore";
import { formatCentstoDisplayCurrency } from "@/utils/formatCurrency";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface DailySummaryCardProps {
    summary: DailySummary;
}

export const DailySummaryCard: React.FC<DailySummaryCardProps> = ({ summary }) => {
    const { palette, gradients } = useTheme();
    const currencyCode = useAppstore((s) => s.currencyCode);

    const styles = useMemo(() => StyleSheet.create({
        glowBackdrop: {
            ...StyleSheet.absoluteFillObject,
            opacity: 0.5,
        },
        label: {
            ...typography.label,
            color: palette.text.secondary,
            marginBottom: 8,
        },
        hero: {
            color: palette.brand.primary,
            fontSize: 44,
            fontWeight: "800",
            letterSpacing: -1.5,
            fontVariant: ["tabular-nums"],
        },
        divider: {
            height: StyleSheet.hairlineWidth,
            backgroundColor: palette.border.emphasis,
            marginVertical: spacing.lg,
        },
        statsRow: {
            flexDirection: "row",
            alignItems: "center",
        },
        statBox: {
            flex: 1,
            alignItems: "center",
        },
        statDivider: {
            width: StyleSheet.hairlineWidth,
            height: 32,
            backgroundColor: palette.border.emphasis,
        },
        statLabel: {
            ...typography.caption,
            color: palette.text.muted,
            marginBottom: 4,
        },
        statValue: {
            ...typography.bodyStrong,
            color: palette.text.primary,
            fontVariant: ["tabular-nums"],
        },
    }), [palette]);

    return (
        <Card padding={spacing.xl} glow>
            <View style={styles.glowBackdrop} pointerEvents="none">
                <LinearGradient
                    colors={gradients.heroGlow}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
            </View>

            <Text style={styles.label}>Total Spent Today</Text>
            <AnimatedAmount
                valueInCents={summary.totalSpentInCents}
                currencyCode={currencyCode}
                style={styles.hero}
            />

            <View style={styles.divider} />

            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Payments</Text>
                    <Text style={styles.statValue}>{summary.transactionCount}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Average</Text>
                    <Text style={styles.statValue}>
                        {formatCentstoDisplayCurrency(summary.averagePaymentInCents, currencyCode)}
                    </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Largest</Text>
                    <Text style={styles.statValue}>
                        {summary.largestPayment
                            ? formatCentstoDisplayCurrency(summary.largestPayment.amountInCents, currencyCode)
                            : "—"}
                    </Text>
                </View>
            </View>
        </Card>
    );
};

export default DailySummaryCard;
