import { Text, Section, Link, Hr } from "@react-email/components";
import { render } from "@react-email/render";
import * as React from "react";
import { BaseTemplate } from "./BaseTemplate";

interface PaymentReceiptEmailProps {
  name: string;
  plan: string;
  amount: string;
  paymentId: string;
  baseUrl: string;
  unsubscribeUrl: string;
}

const planLabels: Record<string, string> = {
  FRESHWATER: "Freshwater — 3 Month Access",
  SALTWATER: "Saltwater — 3 Month Access",
  ALL_ACCESS: "All Access — 3 Month Access",
};

export function PaymentReceiptEmail({
  name,
  plan,
  amount,
  paymentId,
  baseUrl,
  unsubscribeUrl,
}: PaymentReceiptEmailProps) {
  const planLabel = planLabels[plan] ?? plan;

  return (
    <BaseTemplate
      preview={`Payment confirmed — welcome to The Fish Forecaster!`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={heading}>Payment Confirmed!</Text>
      <Text style={paragraph}>
        Hi {name}, thanks for subscribing. Your account is now active and ready
        to use.
      </Text>

      <Section style={receiptCard}>
        <Text style={receiptTitle}>Receipt</Text>
        <table style={table}>
          <tbody>
            <tr>
              <td style={label}>Plan</td>
              <td style={value}>{planLabel}</td>
            </tr>
            <tr>
              <td style={label}>Amount charged</td>
              <td style={value}>{amount}</td>
            </tr>
            <tr>
              <td style={label}>Payment ID</td>
              <td style={{ ...value, fontSize: "11px", color: "#94a3b8" }}>
                {paymentId}
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Hr style={divider} />

      <Text style={paragraph}>
        Your forecast access is live. Head to your dashboard to check today&apos;s
        bite scores, windows, and Captain&apos;s Call for all your zones.
      </Text>

      <Section style={{ textAlign: "center" as const, padding: "16px 0" }}>
        <Link href={`${baseUrl}/dashboard`} style={cta}>
          Go to Your Dashboard
        </Link>
      </Section>
    </BaseTemplate>
  );
}

export async function renderPaymentReceiptEmail(
  props: PaymentReceiptEmailProps
): Promise<string> {
  return await render(<PaymentReceiptEmail {...props} />);
}

// ─── Styles ──────────────────────────────────────────────────

const heading: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#0f172a",
  marginBottom: "16px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  color: "#334155",
  lineHeight: "1.6",
};

const receiptCard: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
};

const receiptTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#64748b",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  marginBottom: "12px",
};

const table: React.CSSProperties = {
  width: "100%",
};

const label: React.CSSProperties = {
  fontSize: "14px",
  color: "#64748b",
  padding: "6px 0",
  width: "40%",
};

const value: React.CSSProperties = {
  fontSize: "14px",
  color: "#0f172a",
  fontWeight: "500",
  padding: "6px 0",
};

const divider: React.CSSProperties = {
  borderColor: "#e2e8f0",
  margin: "24px 0",
};

const cta: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "6px",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "15px",
};
