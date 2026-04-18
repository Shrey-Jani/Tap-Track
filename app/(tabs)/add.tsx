import AmountInput from "@/components/AmountInput";
import CategoryPicker from "@/components/CategoryPicker";
import { usePayments } from "@/hooks/usePayments";
import { PaymentCategory } from "@/models/payment";
import { validatePaymentInput } from "@/services/PaymentValidator";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
} from "react-native";

const AddPaymentScreen: React.FC = () => {
    const {addNewPayment} = usePayments();
    
    const [amountInCents, setAmountInCents] = useState<number>(0);
    const [merchantName, setMerchantName] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<PaymentCategory>(PaymentCategory.OTHER);
    const [cardLastFourDigits, setCardLastFourDigits] = useState<string>("");
    const [note, setNote] = useState<string>("");

    const handleAddPayment = () => {
        const result = validatePaymentInput(amountInCents, merchantName, selectedCategory, cardLastFourDigits);


        if(!result.isValid){
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
    }
    return(
        <ScrollView 
            style = {styles.container}
            contentContainerStyle = {styles.contentContainer}
            keyboardShouldPersistTaps = "handled">
                <Text style={styles.container}>Add Payment</Text>

                <AmountInput onAmountChange={setAmountInCents}/>

                <TextInput style={styles.textInput} placeholder="Merchant Name" value={merchantName} onChangeText={setMerchantName} placeholderTextColor="#888"/>

                <TextInput 
                    style={styles.textInput} 
                    placeholder="Last 4 digits of card" 
                    value={cardLastFourDigits} 
                    onChangeText={setCardLastFourDigits}
                    placeholderTextColor="#888"
                    maxLength={4}
                    keyboardType="number-pad"
/>


                <CategoryPicker selectedCategory={selectedCategory} onSelectedCategory={setSelectedCategory}/>

                <TextInput style={[styles.textInput, styles.noteInput]} placeholder="For note" value={note} onChangeText={setNote} 
                placeholderTextColor={"#888"} multiline/>

                <TouchableOpacity 
                    style={styles.submitButton} 
                    onPress={handleAddPayment} 
                    accessibilityLabel="Add payment"
                    accessibilityRole="button">
                    <Text style={styles.submitButtonText}>Add Payment</Text>
                </TouchableOpacity>
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
  }
});

export default AddPaymentScreen;