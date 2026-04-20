import { formatCentstoDisplayCurrency } from "@/utils/formatCurrency";
import { useEffect, useRef } from "react";
import { Alert } from "react-native";

export const useBudgetAlert = (totalSpentInCents: number, budgetInCents: number) => {
    const hasAlerted = useRef<boolean>(false);

    useEffect(() => {
        if(budgetInCents <= 0) return;

        if(totalSpentInCents >= budgetInCents && !hasAlerted.current) {
            hasAlerted.current = true;
            Alert.alert(
                "Budget Alert 🚨",
                `You've spent ${formatCentstoDisplayCurrency(totalSpentInCents)} out of your ${formatCentstoDisplayCurrency(budgetInCents)} monthly budget!`,
                [{text: "OK"}]
            );
        }
        if (totalSpentInCents < budgetInCents){
            hasAlerted.current = false;
        }
    }, [totalSpentInCents, budgetInCents]);
};

