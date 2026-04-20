import { Payment } from "@/models/payment";
import { addPayment, deletePayment, getPaymentsByDataRange } from "@/services/PaymentRepository";
import { getEndOfDayTimestamp, getStartOfDayTimestamp } from "@/utils/dateHelpers";
import { create } from "zustand";


interface AppState{
    payment: Payment[],
    isLoading: boolean,
    selectedDate: Date,
    loadTodayPayments: () => Promise<void>,
    addNewPayment: (payment: Omit<Payment, "id" | "timestamp">) => Promise<void>,
    removePayment: (id: string) => Promise<void>
    setSelectedDate: (date: Date) => void,
};

export const useAppstore = create<AppState>((set, get) => ({
    payment: [],
    isLoading: false,
    selectedDate: new Date(),

    loadTodayPayments: async () => {
        set({isLoading: true});
        const currentDate = get().selectedDate;
        const startTime = getStartOfDayTimestamp(currentDate);
        const endTime = getEndOfDayTimestamp(currentDate);

        const dailyPayments = await getPaymentsByDataRange(startTime, endTime);

        set({payment: dailyPayments, isLoading: false});
    },

    addNewPayment: async(paymentData) => {
        await addPayment(paymentData);
        await get().loadTodayPayments();
    },
    
    removePayment: async(id) => {
        await deletePayment(id);
        await get().loadTodayPayments();
    },

    setSelectedDate: async(date) => {
        set({selectedDate: date});
        await get().loadTodayPayments();
    }
}));

