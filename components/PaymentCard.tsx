import { CATEGORY_GRADIENTS, radii, spacing, typography } from "@/design/theme";
import { useTheme } from "@/design/useTheme";
import { Payment } from "@/models/payment";
import { useAppstore } from "@/store/appStore";
import { CATEGORY_ICONS } from "@/utils/constants";
import { formatCentstoDisplayCurrency } from "@/utils/formatCurrency";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";

interface PaymentCardProps {
    payment: Payment;
    onDelete: (id: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PaymentCard: React.FC<PaymentCardProps> = ({ payment, onDelete }) => {
    const { palette } = useTheme();
    const currencyCode = useAppstore((s) => s.currencyCode);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const handleDelete = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
        opacity.value = withTiming(0, { duration: 200 });
        setTimeout(() => onDelete(payment.id), 200);
    };

    const handlePressIn = () => {
        scale.value = withSpring(0.98, { damping: 16, stiffness: 320 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 16, stiffness: 320 });
    };

    const gradient = CATEGORY_GRADIENTS[payment.category];

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: palette.bg.surface,
            padding: spacing.md,
            borderRadius: radii.lg,
            marginBottom: spacing.sm,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: palette.border.subtle,
        },
        iconBubble: {
            width: 44,
            height: 44,
            borderRadius: 22,
            justifyContent: "center",
            alignItems: "center",
            marginRight: spacing.md,
        },
        icon: { fontSize: 20 },
        middle: { flex: 1, minWidth: 0 },
        merchant: {
            ...typography.bodyStrong,
            color: palette.text.primary,
        },
        metaRow: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: 3,
        },
        category: {
            ...typography.caption,
            color: palette.text.secondary,
        },
        dot: {
            width: 3,
            height: 3,
            borderRadius: 2,
            backgroundColor: palette.text.muted,
            marginHorizontal: 6,
        },
        cardChip: {
            ...typography.caption,
            color: palette.text.muted,
            fontVariant: ["tabular-nums"],
        },
        right: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
        },
        amount: {
            ...typography.bodyStrong,
            color: palette.text.primary,
            fontVariant: ["tabular-nums"],
        },
    }), [palette]);

    return (
        <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.container, animatedStyle]}
        >
            <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconBubble}
            >
                <Text style={styles.icon}>{CATEGORY_ICONS[payment.category]}</Text>
            </LinearGradient>

            <View style={styles.middle}>
                <Text style={styles.merchant} numberOfLines={1}>{payment.merchantName}</Text>
                <View style={styles.metaRow}>
                    <Text style={styles.category}>{payment.category}</Text>
                    <View style={styles.dot} />
                    <Text style={styles.cardChip}>•••• {payment.cardLastFourDigits}</Text>
                </View>
            </View>

            <View style={styles.right}>
                <Text style={styles.amount}>
                    {formatCentstoDisplayCurrency(payment.amountInCents, currencyCode)}
                </Text>
                <Pressable onPress={handleDelete} hitSlop={10}>
                    <Feather name="x" size={16} color={palette.text.muted} />
                </Pressable>
            </View>
        </AnimatedPressable>
    );
};

export default PaymentCard;
