import { DailySummary, Payment, PaymentCategory } from "@/models/payment";
import { CATEGORY_ICONS } from "@/utils/constants";
import { formatCentstoDisplayCurrency } from "@/utils/formatCurrency";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

export async function exportDailySummaryAsPdf(
    summary: DailySummary,
    payments: Payment[],
    date: string
): Promise<void> {
    let runningTotal = 0;
    const paymentRows = payments
        .map((p, index) => {
            runningTotal += p.amountInCents;
            return `
            <tr>
                <td style="text-align:center; color:#888;">${index + 1}</td>
                <td><strong>${p.merchantName}</strong></td>
                <td>${p.category}</td>
                <td style="font-family:monospace;">•••• ${p.cardLastFourDigits}</td>
                <td style="text-align:right; font-weight:600;">${formatCentstoDisplayCurrency(p.amountInCents)}</td>
                <td style="text-align:right; color:#888;">${formatCentstoDisplayCurrency(runningTotal)}</td>
            </tr>`;
        })
        .join("");

    const categoryRows = Object.entries(summary.categoryBreakdown)
        .filter(([, amount]) => amount > 0)
        .map(([category, amount]) => {
            const percentage = summary.totalSpentInCents > 0
                ? Math.round((amount / summary.totalSpentInCents) * 100)
                : 0;
            return `
            <tr>
                <td>${CATEGORY_ICONS[category as PaymentCategory]} ${category}</td>
                <td style="text-align:right;">${formatCentstoDisplayCurrency(amount)}</td>
                <td style="text-align:right; color:#888;">${percentage}%</td>
            </tr>`;
        })
        .join("");

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
            @page {
                size: A4;
                margin: 20mm;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
                color: #222;
                font-size: 13px;
                line-height: 1.5;
                padding: 0;
            }

            /* Header */
            .header {
                border-bottom: 3px solid #4ADE80;
                padding-bottom: 16px;
                margin-bottom: 24px;
            }
            .header h1 {
                font-size: 22px;
                color: #111;
                margin-bottom: 4px;
            }
            .header .subtitle {
                color: #666;
                font-size: 13px;
            }
            .header .date {
                font-size: 15px;
                font-weight: 600;
                color: #333;
                margin-top: 8px;
            }

            /* Summary Section */
            .summary {
                display: flex;
                justify-content: space-between;
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 28px;
            }
            .summary-item {
                text-align: center;
                flex: 1;
            }
            .summary-label {
                font-size: 11px;
                color: #888;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 6px;
            }
            .summary-value {
                font-size: 20px;
                font-weight: 700;
                color: #111;
            }
            .summary-value.highlight {
                color: #16a34a;
            }

            /* Transaction Table */
            .section-title {
                font-size: 14px;
                font-weight: 700;
                color: #333;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 12px;
                padding-bottom: 6px;
                border-bottom: 1px solid #ddd;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 28px;
            }
            th {
                background-color: #1a1a2e;
                color: #fff;
                padding: 10px 12px;
                text-align: left;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            th:first-child { border-radius: 6px 0 0 0; }
            th:last-child { border-radius: 0 6px 0 0; text-align: right; }
            td {
                padding: 10px 12px;
                border-bottom: 1px solid #f0f0f0;
                font-size: 13px;
            }
            tr:nth-child(even) { background-color: #fafafa; }
            tr:last-child td { border-bottom: 2px solid #1a1a2e; }

            /* Category Table */
            .category-table th {
                background-color: #4ADE80;
                color: #000;
            }

            /* Total Row */
            .total-row {
                background: #f0fdf4 !important;
                font-weight: 700;
            }
            .total-row td {
                border-bottom: 3px double #16a34a;
                padding: 12px;
            }

            /* Footer */
            .footer {
                margin-top: 32px;
                padding-top: 16px;
                border-top: 1px solid #ddd;
                text-align: center;
                color: #aaa;
                font-size: 10px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>TapTrack</h1>
            <div class="subtitle">Daily Spending Statement</div>
            <div class="date">Date: ${date}</div>
        </div>

        <div class="summary">
            <div class="summary-item">
                <div class="summary-label">Total Spent</div>
                <div class="summary-value highlight">${formatCentstoDisplayCurrency(summary.totalSpentInCents)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Transactions</div>
                <div class="summary-value">${summary.transactionCount}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Average</div>
                <div class="summary-value">${formatCentstoDisplayCurrency(summary.averagePaymentInCents)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Largest</div>
                <div class="summary-value">${summary.largestPayment ? formatCentstoDisplayCurrency(summary.largestPayment.amountInCents) : "—"}</div>
            </div>
        </div>

        <div class="section-title">Transaction Details</div>
        <table>
            <thead>
                <tr>
                    <th style="text-align:center; width:40px;">#</th>
                    <th>Merchant</th>
                    <th>Category</th>
                    <th>Card</th>
                    <th style="text-align:right;">Amount</th>
                    <th style="text-align:right;">Running Total</th>
                </tr>
            </thead>
            <tbody>
                ${paymentRows}
                <tr class="total-row">
                    <td colspan="4" style="text-align:right;">TOTAL</td>
                    <td style="text-align:right; color:#16a34a;">${formatCentstoDisplayCurrency(summary.totalSpentInCents)}</td>
                    <td></td>
                </tr>
            </tbody>
        </table>

        <div class="section-title">Category Summary</div>
        <table class="category-table">
            <thead>
                <tr>
                    <th>Category</th>
                    <th style="text-align:right;">Amount</th>
                    <th style="text-align:right;">Share</th>
                </tr>
            </thead>
            <tbody>
                ${categoryRows}
            </tbody>
        </table>

        <div class="footer">
            Generated by TapTrack • ${new Date().toLocaleString()}
        </div>
    </body>
    </html>
    `;

    if (Platform.OS === "web") {
        const newWindow = window.open("", "_blank");
        if (newWindow) {
            newWindow.document.write(htmlContent);
            newWindow.document.close();
        }
    } else {
        const { uri } = await Print.printToFileAsync({
            html: htmlContent,
            width: 595,
            height: 842,
        });

        await Sharing.shareAsync(uri, {
            mimeType: "application/pdf",
            dialogTitle: "Share Daily Statement",
            UTI: "com.adobe.pdf",
        });
    }
}