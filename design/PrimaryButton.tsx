import { radii, typography } from "@/design/theme";
import { useTheme } from "@/design/useTheme";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PrimaryButtonProps {
    label: string;
    onPress: () => void;
    style?: ViewStyle;
    disabled?: boolean;
    variant?: "primary" | "ghost" | "danger";
    icon?: React.ReactNode;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    label,
    onPress,
    style,
    disabled = false,
    variant = "primary",
    icon,
}) => {
    const { palette, gradients, shadows } = useTheme();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: disabled ? 0.5 : 1,
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.96, { damping: 14, stiffness: 320 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 14, stiffness: 320 });
    };

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
        onPress();
    };

    const styles = useMemo(() => StyleSheet.create({
        primaryButton: {
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: radii.md,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
        },
        primaryLabel: {
            color: palette.text.inverse,
            ...typography.h3,
        },
        ghostButton: {
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: radii.md,
            alignItems: "center",
            backgroundColor: palette.bg.surfaceAlt,
            borderWidth: 1,
            borderColor: palette.border.brand,
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
        },
        ghostLabel: {
            color: palette.brand.primary,
            ...typography.h3,
        },
    }), [palette]);

    if (variant === "ghost") {
        return (
            <AnimatedPressable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled}
                style={[styles.ghostButton, animatedStyle, style]}
            >
                {icon}
                <Text style={styles.ghostLabel}>{label}</Text>
            </AnimatedPressable>
        );
    }

    const gradientColors = variant === "danger" ? gradients.danger : gradients.brand;

    return (
        <AnimatedPressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={[animatedStyle, style]}
        >
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.primaryButton, variant === "primary" && shadows.glow]}
            >
                {icon}
                <Text style={styles.primaryLabel}>{label}</Text>
            </LinearGradient>
        </AnimatedPressable>
    );
};

export default PrimaryButton;
