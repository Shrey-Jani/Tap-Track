import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AmountInputProps{
    onAmountChange : (amountInCents: number)=> void;
}

