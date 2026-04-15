import { Payment } from "@/models/payment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";


const STORAGE_KEY_PAYMENTS = "PAYMENT_LIST";

export async function getAllPayments(): Promise<Payment[]>{
    
    const jsonString = await AsyncStorage.getItem(STORAGE_KEY_PAYMENTS);
    
    if(jsonString === null ){
        return [];
    }

    const paymentArraay = JSON.parse(jsonString);

    return paymentArraay;

}

export async function saveAllPayments(payments: Payment[]): Promise<void> {
    const jsonString = await AsyncStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(payments)); 
}

export async function addPayment(payment:Omit<Payment, "id" | "timestamp">): Promise<Payment>{
    const newPayment: Payment = {
        ...payment,
        id: uuidv4(),
        timestamp: Date.now()
    };

    const existingPayment = await getAllPayments();
    existingPayment.push(newPayment);
    await saveAllPayments(existingPayment);
    return newPayment;
}

export async function deletePayment(id: string): Promise<void>{
    const allPayment = await getAllPayments();

    const filteredPayment = allPayment.filter(payment => payment.id !== id);
    await saveAllPayments(filteredPayment);
}

export async function getPaymentsByDataRange(startTimestamp: number, endTimestamp: number): Promise<Payment[]>{
    const allPayment = await getAllPayments();

    const filterByTimePayment = allPayment.filter(payment => {
        return (payment.timestamp >= startTimestamp && payment.timestamp <= endTimestamp);
    });

    return filterByTimePayment;
    
}
