import { getCurrencyByCode } from "@/utils/currencies";

export function formatCentstoDisplayCurrency(amountInCents: number, currencyCode: string = "CAD"): string {
    const currency = getCurrencyByCode(currencyCode);
    const amountInDollars = amountInCents / 100;

    return new Intl.NumberFormat(currency.locale, {
        style: "currency",
        currency: currency.code,
    }).format(amountInDollars);
}
