import DailySummaryCard from "@/components/DailySummaryCard";
import DateRangePicker from "@/components/DateRangePicker";
import PaymentCard from "@/components/PaymentCard";
import { spacing, typography } from "@/design/theme";
import { useTheme } from "@/design/useTheme";
import { useBudgetAlert } from "@/hooks/useBudgetAlert";
import { useDailySummary } from "@/hooks/useDailySummary";
import { usePayments } from "@/hooks/usePayments";
import { Payment } from "@/models/payment";
import { useAppstore } from "@/store/appStore";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const HomeScreen: React.FC = () => {
    const { palette } = useTheme();
    const { payment, removePayment, isLoading } = usePayments();
    const Summary = useDailySummary(payment);
    const { selectedDate, setSelectedDate, dailyBudgetInCents, loadBudget } = useAppstore();

    useEffect(() => {
        loadBudget();
    }, []);

    useBudgetAlert(Summary.totalSpentInCents, dailyBudgetInCents);

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: palette.bg.base,
            paddingTop: 60,
            paddingHorizontal: spacing.lg,
        },
        loadingContainer: {
            flex: 1,
            backgroundColor: palette.bg.base,
            alignItems: "center",
            justifyContent: "center",
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: spacing.lg,
        },
        greeting: {
            ...typography.caption,
            color: palette.text.muted,
            textTransform: "uppercase",
            letterSpacing: 1,
        },
        brand: {
            ...typography.h1,
            color: palette.text.primary,
            marginTop: 2,
        },
        addButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: palette.brand.primary,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: palette.brand.primary,
            shadowOpacity: 0.5,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 0 },
            elevation: 6,
        },
        sectionHeader: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: spacing.xl,
            marginBottom: spacing.md,
        },
        sectionTitle: {
            ...typography.h3,
            color: palette.text.primary,
        },
        sectionCount: {
            ...typography.caption,
            color: palette.text.muted,
            backgroundColor: palette.bg.surface,
            paddingHorizontal: 10,
            paddingVertical: 3,
            borderRadius: 999,
            fontWeight: "700",
            minWidth: 24,
            textAlign: "center",
        },
        emptyState: {
            alignItems: "center",
            marginTop: 60,
        },
        emptyIconBubble: {
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: palette.bg.surface,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: palette.border.brand,
        },
        emptyTitle: {
            ...typography.h3,
            color: palette.text.primary,
            marginBottom: 4,
        },
        emptyHint: {
            ...typography.body,
            color: palette.text.muted,
            textAlign: "center",
        },
    }), [palette]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={palette.brand.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back</Text>
                    <Text style={styles.brand}>TapTrack</Text>
                </View>
                <Pressable
                    onPress={() => router.push("/(tabs)/add")}
                    style={styles.addButton}
                    hitSlop={8}
                >
                    <Feather name="plus" size={22} color="#FFFFFF" />
                </Pressable>
            </View>

            <DateRangePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />

            <DailySummaryCard summary={Summary} />

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today's Payments</Text>
                <Text style={styles.sectionCount}>{payment.length}</Text>
            </View>

            <FlatList
                data={payment}
                keyExtractor={(item: Payment) => item.id}
                renderItem={({ item, index }) => (
                    <Animated.View entering={FadeInDown.delay(index * 60).duration(360)}>
                        <PaymentCard payment={item} onDelete={removePayment} />
                    </Animated.View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconBubble}>
                            <Feather name="credit-card" size={28} color={palette.brand.primary} />
                        </View>
                        <Text style={styles.emptyTitle}>No payments yet</Text>
                        <Text style={styles.emptyHint}>Tap the + button to log your first payment.</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            />
        </View>
    );
};

export default HomeScreen;
