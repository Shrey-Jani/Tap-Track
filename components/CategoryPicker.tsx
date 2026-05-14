import { CATEGORY_GRADIENTS, radii, spacing, typography } from "@/design/theme";
import { useTheme } from "@/design/useTheme";
import { PaymentCategory } from "@/models/payment";
import { CATEGORY_ICONS } from "@/utils/constants";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

interface CategoryPickerProps {
    selectedCategory: PaymentCategory;
    onSelectedCategory: (category: PaymentCategory) => void;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({ selectedCategory, onSelectedCategory }) => {
    const categories = Object.values(PaymentCategory);

    return (
        <View style={pickerStyles.container}>
            {categories.map((category) => (
                <CategoryChip
                    key={category}
                    category={category}
                    selected={selectedCategory === category}
                    onPress={() => {
                        Haptics.selectionAsync().catch(() => undefined);
                        onSelectedCategory(category);
                    }}
                />
            ))}
        </View>
    );
};

interface CategoryChipProps {
    category: PaymentCategory;
    selected: boolean;
    onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CategoryChip: React.FC<CategoryChipProps> = ({ category, selected, onPress }) => {
    const { palette } = useTheme();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const gradient = CATEGORY_GRADIENTS[category];

    const styles = useMemo(() => StyleSheet.create({
        chipWrapSelected: {
            width: "30.5%",
            borderRadius: radii.md,
        },
        chipGradient: {
            paddingVertical: spacing.md,
            borderRadius: radii.md,
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
        },
        chip: {
            width: "30.5%",
            paddingVertical: spacing.md,
            borderRadius: radii.md,
            backgroundColor: palette.bg.surfaceAlt,
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: palette.border.subtle,
        },
        icon: { fontSize: 18 },
        label: {
            ...typography.caption,
            color: palette.text.secondary,
            textAlign: "center",
        },
        labelSelected: {
            ...typography.caption,
            color: "#FFFFFF",
            fontWeight: "800",
            textAlign: "center",
        },
    }), [palette]);

    if (selected) {
        return (
            <AnimatedPressable
                onPress={onPress}
                onPressIn={() => { scale.value = withSpring(0.94, { damping: 14 }); }}
                onPressOut={() => { scale.value = withSpring(1, { damping: 14 }); }}
                style={[styles.chipWrapSelected, animatedStyle]}
            >
                <LinearGradient
                    colors={gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.chipGradient}
                >
                    <Text style={styles.icon}>{CATEGORY_ICONS[category]}</Text>
                    <Text style={styles.labelSelected} numberOfLines={1}>{category}</Text>
                </LinearGradient>
            </AnimatedPressable>
        );
    }

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={() => { scale.value = withSpring(0.94, { damping: 14 }); }}
            onPressOut={() => { scale.value = withSpring(1, { damping: 14 }); }}
            style={[styles.chip, animatedStyle]}
        >
            <Text style={styles.icon}>{CATEGORY_ICONS[category]}</Text>
            <Text style={styles.label} numberOfLines={1}>{category}</Text>
        </AnimatedPressable>
    );
};

const pickerStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
});

export default CategoryPicker;
