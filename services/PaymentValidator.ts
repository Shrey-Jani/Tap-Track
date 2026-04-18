import { PaymentCategory } from "@/models/payment";

export function validatePaymentInput(amountInCents: number, 
    merchantName: string, 
    category: PaymentCategory, 
    cardLastFourDigits: string,)
    {
    if (amountInCents <= 0){
        return {isValid:false ,error: "Amount must be greater than zero"};
    }
    if (amountInCents > 99999999){
        return {isValid:false ,error: "Amount exceeds maximum limit"};
    }

    if (!merchantName.trim()){
        return {eisValid:false ,rror: "Merchant Name is required"};
    }

    if(!/^\d{4}$/.test(cardLastFourDigits)){
        return {isValid:false ,error: "Card must be exactly 4 digits"}
    }
    return{
        isValid: true,
        errorMessage: "" 
    };
}