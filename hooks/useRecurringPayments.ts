import { getAllPayments } from "@/services/PaymentRepository";
import { detectRecurringPayment, RecurringPayment } from "@/services/RecurringPaymentDetector";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

export const useRecurringPayments = (): RecurringPayment[] => {
    const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);

    useFocusEffect(
        useCallback(() => {
            const loadRecurringPayments = async () => {
                const allPayments = await getAllPayments();
                setRecurringPayments(detectRecurringPayment(allPayments));
            };
            loadRecurringPayments();
        }, [])
    );

    return recurringPayments;
};
