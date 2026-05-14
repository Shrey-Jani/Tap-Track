export interface CurrencyOption {
    code: string;
    name: string;
    locale: string;
    symbol: string;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
    { code: "CAD", name: "Canadian Dollar", locale: "en-CA", symbol: "$" },
    { code: "USD", name: "US Dollar", locale: "en-US", symbol: "$" },
    { code: "EUR", name: "Euro", locale: "en-IE", symbol: "€" },
    { code: "GBP", name: "British Pound", locale: "en-GB", symbol: "£" },
    { code: "INR", name: "Indian Rupee", locale: "en-IN", symbol: "₹" },
    { code: "JPY", name: "Japanese Yen", locale: "ja-JP", symbol: "¥" },
    { code: "AUD", name: "Australian Dollar", locale: "en-AU", symbol: "A$" },
    { code: "SGD", name: "Singapore Dollar", locale: "en-SG", symbol: "S$" },
];

export const DEFAULT_CURRENCY_CODE = "CAD";

export function getCurrencyByCode(code: string): CurrencyOption {
    return SUPPORTED_CURRENCIES.find((c) => c.code === code) ?? SUPPORTED_CURRENCIES[0];
}
