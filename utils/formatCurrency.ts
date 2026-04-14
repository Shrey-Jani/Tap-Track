export function formatCentstoDisplayCurrency (amountInCents: number, currency: string = "CAD") : string {

    const amountInDollars = amountInCents / 100;
    const formattedAmount = new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: currency,
    }).format(amountInDollars);

    return formattedAmount;
};


