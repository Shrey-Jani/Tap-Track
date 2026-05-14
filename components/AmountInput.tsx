import { radii, spacing, typography } from "@/design/theme";
import { useTheme } from "@/design/useTheme";
import { useAppstore } from "@/store/appStore";
import { getCurrencyByCode } from "@/utils/currencies";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface AmountInputProps {
    onAmountChange: (amountInCents: number) => void;
}

const AmountInput: React.FC<AmountInputProps> = ({ onAmountChange }) => {
    const { palette, gradients } = useTheme();
    const [displayText, setDisplayText] = useState<string>("");
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const currencyCode = useAppstore((s) => s.currencyCode);
    const currency = getCurrencyByCode(currencyCode);

    const handleTextChange = (text: string) => {
        setDisplayText(text);
        const parsed = parseFloat(text);
        const amountInCents = isNaN(parsed) ? 0 : Math.round(parsed * 100);
        onAmountChange(amountInCents);
    };

    const styles = useMemo(() => StyleSheet.create({
        wrap: { marginBottom: spacing.md },
        label: {
            ...typography.label,
            color: palette.text.secondary,
            marginBottom: spacing.sm,
        },
        borderWrap: {
            borderRadius: radii.lg,
            padding: 1.5,
        },
        container: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: palette.bg.surface,
            borderRadius: radii.lg - 1.5,
            paddingHorizontal: spacing.lg,
        },
        currencySymbol: {
            color: palette.brand.primary,
            fontSize: 36,
            fontWeight: "800",
            marginRight: 6,
        },
        input: {
            flex: 1,
            color: palette.text.primary,
            fontSize: 36,
            fontWeight: "800",
            paddingVertical: spacing.lg,
            fontVariant: ["tabular-nums"],
            letterSpacing: -1,
        },
    }), [palette]);

    return (
        <View style={styles.wrap}>
            <Text style={styles.label}>Amount</Text>
            <LinearGradient
                colors={isFocused ? gradients.brand : (["transparent", "transparent"] as const)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.borderWrap}
            >
                <View style={styles.container}>
                    <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={handleTextChange}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        value={displayText}
                        placeholderTextColor={palette.text.muted}
                        accessibilityLabel="Enter payment amount"
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                </View>
            </LinearGradient>
        </View>
    );
};

export default AmountInput;
