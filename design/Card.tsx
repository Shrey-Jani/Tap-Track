import { radii, spacing } from "@/design/theme";
import { useTheme } from "@/design/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    gradientBorder?: boolean;
    gradientBorderColors?: readonly [string, string, ...string[]];
    glow?: boolean;
    padding?: number;
}

const Card: React.FC<CardProps> = ({
    children,
    style,
    gradientBorder = false,
    gradientBorderColors,
    glow = false,
    padding = spacing.lg,
}) => {
    const { palette, shadows } = useTheme();
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(12);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) });
        translateY.value = withTiming(0, { duration: 380, easing: Easing.out(Easing.cubic) });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    const styles = useMemo(() => StyleSheet.create({
        card: {
            backgroundColor: palette.bg.surface,
            borderRadius: radii.lg,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: palette.border.subtle,
        },
        borderWrap: {
            padding: 1.5,
            borderRadius: radii.lg,
        },
        inner: {
            backgroundColor: palette.bg.surface,
            borderRadius: radii.lg - 1.5,
        },
    }), [palette]);

    if (gradientBorder && gradientBorderColors) {
        return (
            <Animated.View style={[animatedStyle, glow && shadows.glow]}>
                <LinearGradient
                    colors={gradientBorderColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.borderWrap, style]}
                >
                    <View style={[styles.inner, { padding }]}>{children}</View>
                </LinearGradient>
            </Animated.View>
        );
    }

    return (
        <Animated.View style={[styles.card, { padding }, animatedStyle, glow && shadows.glow, style]}>
            {children}
        </Animated.View>
    );
};

export default Card;
