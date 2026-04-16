import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface AmountInputProps{
    onAmountChange : (amountInCents: number)=> void;
}

const AmountInput: React.FC<AmountInputProps> = ({onAmountChange}) => {
    const [displayText, setDisplayText] = useState<string>("");

    const handleTextChange = (text: string) => {
        setDisplayText(text);
    

    const parsed = parseFloat(text);
    const ampuntInCents = isNaN(parsed) ? 0 :Math.round(parsed * 100);

    onAmountChange(ampuntInCents);
};

return(
    <View style={styles.container}>
        <Text style={styles.currencySymbol}>₹</Text>
        <TextInput 
        style={styles.input}
        onChangeText={handleTextChange}
        placeholder="0.00"
        keyboardType="decimal-pad"
        value={displayText}
        placeholderTextColor="#888"
        accessibilityLabel="Enter payment amount"
    />
    </View>
);
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E2E",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  currencySymbol: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "600",
    marginRight: 4,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 32,
    paddingVertical: 16,
  },
});

export default AmountInput;