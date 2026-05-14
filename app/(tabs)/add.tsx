import AmountInput from "@/components/AmountInput";
import CategoryPicker from "@/components/CategoryPicker";
import { usePayments } from "@/hooks/usePayments";
import { PaymentCategory } from "@/models/payment";
import { validatePaymentInput } from "@/services/PaymentValidator";
import { parseSmsToPayment } from "@/services/SmsParser";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const AddPaymentScreen: React.FC = () => {
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
            Alert.alert("Error", result.errorMessage);
            return;
        }

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
            Alert.alert("Couldn't parse", "No amount found. Paste a bank notification SMS that mentions an amount.");
            return;
        }
        setAmountInCents(parsed.amountInCents);
        setMerchantName(parsed.merchantName);
        setCardLastFourDigits(parsed.cardLastFourDigits);
        setSelectedCategory(parsed.category);
        setFormKey((prev) => prev + 1);
        setShowSmsModal(false);
        setSmsText("");
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.title}>Add Payment</Text>

            <TouchableOpacity style={styles.smsButton} onPress={() => setShowSmsModal(true)}>
                <Text style={styles.smsButtonText}>📩 Paste SMS to auto-fill</Text>
            </TouchableOpacity>

            <AmountInput key={formKey} onAmountChange={setAmountInCents} />

            <TextInput style={styles.textInput} placeholder="Merchant Name" value={merchantName} onChangeText={setMerchantName} placeholderTextColor="#888" />

            <TextInput
                style={styles.textInput}
                placeholder="Last 4 digits of card"
                value={cardLastFourDigits}
                onChangeText={setCardLastFourDigits}
                placeholderTextColor="#888"
                maxLength={4}
                keyboardType="number-pad"
            />

            <CategoryPicker selectedCategory={selectedCategory} onSelectedCategory={setSelectedCategory} />

            <TextInput
                style={[styles.textInput, styles.noteInput]}
                placeholder="For note"
                value={note}
                onChangeText={setNote}
                placeholderTextColor={"#888"}
                multiline
            />

            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddPayment}
                accessibilityLabel="Add payment"
                accessibilityRole="button"
            >
                <Text style={styles.submitButtonText}>Add Payment</Text>
            </TouchableOpacity>

            <Modal visible={showSmsModal} animationType="slide" transparent>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Paste Bank SMS</Text>
                        <Text style={styles.modalHint}>
                            Copy a transaction SMS from your bank and paste it below. We'll extract the amount, merchant, and card.
                        </Text>
                        <TextInput
                            style={[styles.textInput, styles.smsTextArea]}
                            placeholder="e.g. INR 850 spent on card ending 4521 at SWIGGY on 14-May-26"
                            value={smsText}
                            onChangeText={setSmsText}
                            placeholderTextColor="#666"
                            multiline
                        />
                        <View style={styles.modalRow}>
                            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowSmsModal(false)}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirm} onPress={handleParseSms}>
                                <Text style={styles.modalConfirmText}>Auto-fill</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121218",
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 20,
    },
    smsButton: {
        backgroundColor: "#2A2A3C",
        borderWidth: 1,
        borderColor: "#4ADE80",
        borderRadius: 12,
        padding: 14,
        alignItems: "center",
        marginBottom: 16,
    },
    smsButtonText: {
        color: "#4ADE80",
        fontSize: 14,
        fontWeight: "600",
    },
    textInput: {
        backgroundColor: "#1E1E2E",
        color: "#FFFFFF",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    noteInput: {
        marginTop: 12,
        minHeight: 80,
        textAlignVertical: "top",
    },
    submitButton: {
        backgroundColor: "#4ADE80",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        marginTop: 8,
    },
    submitButtonText: {
        color: "#000000",
        fontSize: 16,
        fontWeight: "bold",
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        padding: 20,
    },
    modalCard: {
        backgroundColor: "#1E1E2E",
        borderRadius: 16,
        padding: 20,
    },
    modalTitle: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
    },
    modalHint: {
        color: "#888",
        fontSize: 13,
        marginBottom: 16,
    },
    smsTextArea: {
        minHeight: 100,
        textAlignVertical: "top",
    },
    modalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    modalCancel: {
        flex: 1,
        backgroundColor: "#2A2A3C",
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
        marginRight: 8,
    },
    modalCancelText: {
        color: "#FFFFFF",
        fontSize: 15,
    },
    modalConfirm: {
        flex: 1,
        backgroundColor: "#4ADE80",
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
        marginLeft: 8,
    },
    modalConfirmText: {
        color: "#000",
        fontSize: 15,
        fontWeight: "bold",
    },
});

export default AddPaymentScreen;
