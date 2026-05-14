import { Payment } from "@/models/payment";
import { addPayment, deletePayment, getPaymentsByDataRange } from "@/services/PaymentRepository";
import { refreshSpendingWidget } from "@/services/WidgetService";
import { DEFAULT_CURRENCY_CODE } from "@/utils/currencies";
import { getEndOfDayTimestamp, getStartOfDayTimestamp } from "@/utils/dateHelpers";
import { DEFAULT_DAILY_BUDGET_IN_CENTS } from "@/utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const BUDGET_STORAGE_KEY = "taptrack_daily_budget";
const CURRENCY_STORAGE_KEY = "taptrack_currency_code";

interface AppState {
    payment: Payment[];
    isLoading: boolean;
    selectedDate: Date;
    dailyBudgetInCents: number;
    currencyCode: string;
    loadTodayPayments: () => Promise<void>;
    addNewPayment: (payment: Omit<Payment, "id" | "timestamp">) => Promise<void>;
    removePayment: (id: string) => Promise<void>;
    setSelectedDate: (date: Date) => void;
    loadBudget: () => Promise<void>;
    saveBudget: (budgetInCents: number) => Promise<void>;
    loadCurrency: () => Promise<void>;
    saveCurrency: (code: string) => Promise<void>;
}

export const useAppstore = create<AppState>((set, get) => ({
    payment: [],
    isLoading: false,
    selectedDate: new Date(),
    dailyBudgetInCents: DEFAULT_DAILY_BUDGET_IN_CENTS,
    currencyCode: DEFAULT_CURRENCY_CODE,

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
        refreshSpendingWidget().catch(() => undefined);
    },

    removePayment: async (id) => {
        await deletePayment(id);
        await get().loadTodayPayments();
        refreshSpendingWidget().catch(() => undefined);
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
        refreshSpendingWidget().catch(() => undefined);
    },

    loadCurrency: async () => {
        const stored = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
        if (stored) {
            set({ currencyCode: stored });
        }
    },

    saveCurrency: async (code) => {
        set({ currencyCode: code });
        await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, code);
    },
}));
