import { PaymentCategory } from "@/models/payment";

export interface ParsedSmsPayment {
    amountInCents: number;
    merchantName: string;
    cardLastFourDigits: string;
    category: PaymentCategory;
}

const AMOUNT_REGEX = /(?:USD|CAD|EUR|GBP|INR|\$|£|€|₹|Rs\.?)\s?([\d,]+(?:\.\d{1,2})?)/i;
const CARD_REGEX = /(?:card|account|a\/c)[^\d]{0,10}(?:[xX*]{2,}|ending(?:\s+in)?)\s?(\d{4})/i;
const MERCHANT_REGEX = /(?:at|to|towards|for)\s+([A-Z][A-Z0-9 .,&'-]{2,40})/;

const CATEGORY_KEYWORDS: Array<{ keywords: string[]; category: PaymentCategory }> = [
    { keywords: ["uber", "lyft", "ola", "gas", "fuel", "shell", "petro", "esso"], category: PaymentCategory.TRANSPORT },
    { keywords: ["starbucks", "tim hortons", "mcdonald", "pizza", "kfc", "swiggy", "zomato", "doordash", "ubereats"], category: PaymentCategory.FOOD },
    { keywords: ["amazon", "walmart", "costco", "ikea", "target", "myntra", "flipkart"], category: PaymentCategory.SHOPPING },
    { keywords: ["netflix", "spotify", "disney", "hbo", "prime video", "cineplex"], category: PaymentCategory.ENTERTAINMENT },
    { keywords: ["pharmacy", "shoppers drug", "medplus", "apollo", "hospital", "clinic"], category: PaymentCategory.HEALTH },
    { keywords: ["hydro", "electric", "bell", "rogers", "telus", "comcast", "verizon", "airtel", "jio"], category: PaymentCategory.BILLS },
];

function parseAmountInCents(text: string): number | null {
    const match = text.match(AMOUNT_REGEX);
    if (!match) return null;

    const numeric = match[1].replace(/,/g, "");
    const value = parseFloat(numeric);
    if (isNaN(value)) return null;

    return Math.round(value * 100);
}

function parseCardLastFour(text: string): string | null {
    const match = text.match(CARD_REGEX);
    return match ? match[1] : null;
}

function parseMerchantName(text: string): string | null {
    const match = text.match(MERCHANT_REGEX);
    if (!match) return null;
    return match[1].trim().split(/\s+/).slice(0, 4).join(" ");
}

function categorizeMerchant(merchantName: string): PaymentCategory {
    const lower = merchantName.toLowerCase();
    for (const rule of CATEGORY_KEYWORDS) {
        if (rule.keywords.some((kw) => lower.includes(kw))) {
            return rule.category;
        }
    }
    return PaymentCategory.OTHER;
}

export function parseSmsToPayment(smsText: string): ParsedSmsPayment | null {
    const amountInCents = parseAmountInCents(smsText);
    if (amountInCents === null) return null;

    const cardLastFourDigits = parseCardLastFour(smsText) ?? "0000";
    const merchantName = parseMerchantName(smsText) ?? "Unknown Merchant";
    const category = categorizeMerchant(merchantName);

    return {
        amountInCents,
        merchantName,
        cardLastFourDigits,
        category,
    };
}
