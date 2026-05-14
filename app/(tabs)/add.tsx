import AmountInput from "@/components/AmountInput";
import CategoryPicker from "@/components/CategoryPicker";
import PrimaryButton from "@/design/PrimaryButton";
import { radii, spacing, typography } from "@/design/theme";
import { useTheme } from "@/design/useTheme";
import { usePayments } from "@/hooks/usePayments";
import { PaymentCategory } from "@/models/payment";
import { validatePaymentInput } from "@/services/PaymentValidator";
import { parseSmsToPayment } from "@/services/SmsParser";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const AddPaymentScreen: React.FC = () => {
    const { palette } = useTheme();
    const { addNewPayment } = usePayments();

    const [amountInCents, setAmountInCents] = useState<number>(0);
    const [merchantName, setMerchantName] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<PaymentCategory>(PaymentCategory.OTHER);
    const [cardLastFourDigits, setCardLastFourDigits] = useState<string>("");
    const [note, setNote] = useState<string>("");
    const [formKey, setFormKey] = useState<number>(0);

    const [showSmsModal, setShowSmsModal] = useState<boolean>(false);
    const [smsText, setSmsText] = useState<string>("");

    useFocusEffect(
        useCallback(() => {
            setAmountInCents(0);
            setMerchantName("");
            setSelectedCategory(PaymentCategory.OTHER);
            setCardLastFourDigits("");
            setNote("");
            setFormKey((prev) => prev + 1);
        }, [])
    );

    const handleAddPayment = () => {
        const result = validatePaymentInput(amountInCents, merchantName, selectedCategory, cardLastFourDigits);
        if (!result.isValid) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
            Alert.alert("Error", result.errorMessage);
            return;
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
        addNewPayment({
            amountInCents,
            merchantName,
            category: selectedCategory,
            cardLastFourDigits,
            note,
            isRecurring: false,
        });
        router.back();
    };

    const handleParseSms = () => {
        const parsed = parseSmsToPayment(smsText);
        if (!parsed) {
            Alert.alert("Couldn't parse", "No amount found in the SMS text.");
            return;
        }
        setAmountInCents(parsed.amountInCents);
        setMerchantName(parsed.merchantName);
        setCardLastFourDigits(parsed.cardLastFourDigits);
        setSelectedCategory(parsed.category);
        setFormKey((prev) => prev + 1);
        setShowSmsModal(false);
        setSmsText("");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    };

    const styles = useMemo(() => StyleSheet.create({
        container: { flex: 1, backgroundColor: palette.bg.base },
        content: { paddingTop: 60, paddingHorizontal: spacing.lg, paddingBottom: 120 },
        headerRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: spacing.xl,
        },
        kicker: {
            ...typography.caption,
            color: palette.text.muted,
            textTransform: "uppercase",
            letterSpacing: 1,
        },
        title: {
            ...typography.h1,
            color: palette.text.primary,
            marginTop: 2,
        },
        smsBtn: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: palette.bg.surface,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: palette.border.brand,
        },
        smsBtnText: {
            ...typography.caption,
            color: palette.brand.primary,
            fontWeight: "700",
        },
        fieldLabel: {
            ...typography.label,
            color: palette.text.secondary,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
        },
        textInput: {
            backgroundColor: palette.bg.surface,
            color: palette.text.primary,
            padding: 16,
            borderRadius: radii.md,
            fontSize: 16,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: palette.border.subtle,
        },
        noteInput: {
            minHeight: 80,
            textAlignVertical: "top",
        },
        modalBackdrop: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            padding: 20,
        },
        modalCard: {
            backgroundColor: palette.bg.surface,
            borderRadius: radii.xl,
            padding: spacing.lg,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: palette.border.subtle,
        },
        modalTitle: {
            ...typography.h2,
            color: palette.text.primary,
            marginBottom: 6,
        },
        modalHint: {
            ...typography.caption,
            color: palette.text.muted,
            marginBottom: spacing.md,
        },
        smsTextArea: {
            minHeight: 100,
            textAlignVertical: "top",
            marginBottom: spacing.md,
        },
        modalRow: {
            flexDirection: "row",
            gap: 8,
            alignItems: "center",
        },
        modalCancel: {
            backgroundColor: palette.bg.surfaceAlt,
            paddingVertical: 16,
            paddingHorizontal: 22,
            borderRadius: radii.md,
            alignItems: "center",
        },
        modalCancelText: {
            ...typography.h3,
            color: palette.text.secondary,
        },
    }), [palette]);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.kicker}>New entry</Text>
                    <Text style={styles.title}>Add Payment</Text>
                </View>
                <Pressable style={styles.smsBtn} onPress={() => setShowSmsModal(true)} hitSlop={8}>
                    <Feather name="message-square" size={16} color={palette.brand.primary} />
                    <Text style={styles.smsBtnText}>Paste SMS</Text>
                </Pressable>
            </View>

            <AmountInput key={formKey} onAmountChange={setAmountInCents} />

            <Text style={styles.fieldLabel}>Merchant</Text>
            <TextInput
                style={styles.textInput}
                placeholder="Starbucks, Uber, …"
                value={merchantName}
                onChangeText={setMerchantName}
                placeholderTextColor={palette.text.muted}
            />

            <Text style={styles.fieldLabel}>Card (last 4)</Text>
            <TextInput
                style={styles.textInput}
                placeholder="1234"
                value={cardLastFourDigits}
                onChangeText={setCardLastFourDigits}
                placeholderTextColor={palette.text.muted}
                maxLength={4}
                keyboardType="number-pad"
            />

            <Text style={styles.fieldLabel}>Category</Text>
            <CategoryPicker selectedCategory={selectedCategory} onSelectedCategory={setSelectedCategory} />

            <Text style={styles.fieldLabel}>Note (optional)</Text>
            <TextInput
                style={[styles.textInput, styles.noteInput]}
                placeholder="Anything to remember?"
                value={note}
                onChangeText={setNote}
                placeholderTextColor={palette.text.muted}
                multiline
            />

            <View style={{ marginTop: spacing.lg }}>
                <PrimaryButton
                    label="Save Payment"
                    onPress={handleAddPayment}
                    icon={<Feather name="check" size={18} color="#FFFFFF" />}
                />
            </View>

            <Modal visible={showSmsModal} animationType="slide" transparent>
                <Pressable style={styles.modalBackdrop} onPress={() => setShowSmsModal(false)}>
                    <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
                        <Text style={styles.modalTitle}>Paste bank SMS</Text>
                        <Text style={styles.modalHint}>
                            Copy a transaction SMS, paste below. We'll extract amount, merchant, and card.
                        </Text>
                        <TextInput
                            style={[styles.textInput, styles.smsTextArea]}
                            placeholder="e.g. ₹850 spent on card ending 4521 at SWIGGY"
                            value={smsText}
                            onChangeText={setSmsText}
                            placeholderTextColor={palette.text.muted}
                            multiline
                        />
                        <View style={styles.modalRow}>
                            <Pressable style={styles.modalCancel} onPress={() => setShowSmsModal(false)}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </Pressable>
                            <View style={{ flex: 1 }}>
                                <PrimaryButton label="Auto-fill" onPress={handleParseSms} />
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </ScrollView>
    );
};

export default AddPaymentScreen;
