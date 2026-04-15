import { useAppstore } from "@/store/appStore";
import { useEffect } from "react";


export const usePayments =() => {
    const{
        payment,
        isLoading,
        loadTodayPayments,
        addNewPayment,
        removePayment
    }  = useAppstore();

    useEffect(() => {
         loadTodayPayments();
    }, []);

    return {
        payment,
        isLoading,
        loadTodayPayments,
        addNewPayment,
        removePayment
    }
}