import { Payment } from "@/models/payment";
import { addPayment, deletePayment, getPaymentsByDataRange } from "@/services/PaymentRepository";
import { getEndOfDayTimestamp, getStartOfDayTimestamp } from "@/utils/dateHelpers";
import { DEFAULT_DAILY_BUDGET_IN_CENTS } from "@/utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const BUDGET_STORAGE_KEY = "taptrack_daily_budget";

interface AppState {
    payment: Payment[];
    isLoading: boolean;
    selectedDate: Date;
    dailyBudgetInCents: number;
    loadTodayPayments: () => Promise<void>;
    addNewPayment: (payment: Omit<Payment, "id" | "timestamp">) => Promise<void>;
    removePayment: (id: string) => Promise<void>;
    setSelectedDate: (date: Date) => void;
    loadBudget: () => Promise<void>;
    saveBudget: (budgetInCents: number) => Promise<void>;
}

export const useAppstore = create<AppState>((set, get) => ({
    payment: [],
    isLoading: false,
    selectedDate: new Date(),
    dailyBudgetInCents: DEFAULT_DAILY_BUDGET_IN_CENTS,

    loadTodayPayments: async () => {
        set({ isLoading: true });
        const currentDate = get().selectedDate;
        const startTime = getStartOfDayTimestamp(currentDate);
        const endTime = getEndOfDayTimestamp(currentDate);

        const dailyPayments = await getPaymentsByDataRange(startTime, endTime);

        set({ payment: dailyPayments, isLoading: false });
    },

    addNewPayment: async (paymentData) => {
        await addPayment(paymentData);
        await get().loadTodayPayments();
    },

    removePayment: async (id) => {
        await deletePayment(id);
        await get().loadTodayPayments();
    },

    setSelectedDate: async (date) => {
        set({ selectedDate: date });
        await get().loadTodayPayments();
    },

    loadBudget: async () => {
        const stored = await AsyncStorage.getItem(BUDGET_STORAGE_KEY);
        if (stored) {
            set({ dailyBudgetInCents: parseInt(stored, 10) });
        }
    },

    saveBudget: async (budgetInCents) => {
        set({ dailyBudgetInCents: budgetInCents });
        await AsyncStorage.setItem(BUDGET_STORAGE_KEY, budgetInCents.toString());
    },
}));
