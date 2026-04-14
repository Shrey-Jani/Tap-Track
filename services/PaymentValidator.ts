import { PaymentCategory } from "@/models/payment";

export function validatePaymentInput(amountInCents: number, 
    merchantName: string, 
    category: PaymentCategory, 
    cardLastFourDigits: string,)
    {
    if (amountInCents <= 0){
        return {error: "Amount must be greater than zero"};
    }
    if (amountInCents > 99999999){
        return {error: "Amount exceeds maximum limit"};
    }

    if (!merchantName.trim()){
        return {error: "Merchant Name is required"};
    }

    if(!/^\d{4}$/.test(cardLastFourDigits)){
        return {error: "Card must be exactly 4 digits"}
    }
    return{
        isValid: true,
        errorMessage: "" 
    };
}