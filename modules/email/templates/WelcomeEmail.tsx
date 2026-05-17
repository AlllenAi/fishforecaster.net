import { Text, Section, Link, Hr } from "@react-email/components";
import { render } from "@react-email/render";
import * as React from "react";
import { BaseTemplate } from "./BaseTemplate";

interface WelcomeEmailProps {
  name: string;
  baseUrl: string;
}

export function WelcomeEmail({ name, baseUrl }: WelcomeEmailProps) {
  return (
    <BaseTemplate preview={`Welcome to fishforecaster.net, ${name}!`}>
      <Text style={heading}>Welcome aboard, {name}!</Text>
      <Text style={paragraph}>
        Your account is all set. Here&apos;s how to get the most out of The Fish
        Forecaster in 3 easy steps:
      </Text>

      <Section style={stepCard}>
        <Text style={stepNumber}>1</Text>
        <Text style={stepTitle}>Choose Your Plan</Text>
        <Text style={stepDesc}>
          Pick Freshwater, Saltwater, or All Access to unlock daily bite scores
          for your favorite zones.
        </Text>
      </Section>

      <Section style={stepCard}>
        <Text style={stepNumber}>2</Text>
        <Text style={stepTitle}>Check Your Dashboard</Text>
        <Text style={stepDesc}>
          See today&apos;s scores, bite windows, and Captain&apos;s Call for every zone
          in your plan — updated daily.
        </Text>
      </Section>

      <Section style={stepCard}>
        <Text style={stepNumber}>3</Text>
        <Text style={stepTitle}>Fish the Hot Days</Text>
        <Text style={stepDesc}>
          Focus your time on days scoring 70+ for the best results. Our weekly
          digest email highlights the top days ahead.
        </Text>
      </Section>

      <Hr style={divider} />

      <Section style={{ textAlign: "center" as const, padding: "16px 0" }}>
        <Link href={`${baseUrl}/dashboard`} style={cta}>
          Go to Your Dashboard
        </Link>
        <Text style={secondaryCta}>
          or{" "}
          <Link href={`${baseUrl}/pricing`} style={link}>
            view subscription plans
          </Link>
        </Text>
      </Section>
    </BaseTemplate>
  );
}

export async function renderWelcomeEmail(props: WelcomeEmailProps): Promise<string> {
  return await render(<WelcomeEmail {...props} />);
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

const stepCard: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "12px 0",
};

const stepNumber: React.CSSProperties = {
  display: "inline-block",
  width: "28px",
  height: "28px",
  lineHeight: "28px",
  textAlign: "center" as const,
  backgroundColor: "#2563eb",
  color: "#ffffff",
  borderRadius: "50%",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 8px 0",
};

const stepTitle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#0f172a",
  margin: "0 0 4px 0",
};

const stepDesc: React.CSSProperties = {
  fontSize: "14px",
  color: "#475569",
  lineHeight: "1.5",
  margin: 0,
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

const secondaryCta: React.CSSProperties = {
  fontSize: "13px",
  color: "#64748b",
  marginTop: "12px",
};

const link: React.CSSProperties = {
  color: "#2563eb",
  textDecoration: "underline",
};
