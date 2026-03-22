import { Text, Section, Link, Hr } from "@react-email/components";
import { render } from "@react-email/render";
import * as React from "react";
import { BaseTemplate } from "@/modules/email/templates/BaseTemplate";
import type { HighScoreAlert } from "../types/notification.schema";

interface HighScoreAlertEmailProps {
  alerts: HighScoreAlert[];
  threshold: number;
  baseUrl: string;
  unsubscribeUrl: string;
}

const labelColors: Record<string, string> = {
  EXCELLENT: "#16a34a",
  GOOD: "#2563eb",
  FAIR: "#d97706",
};

export function HighScoreAlertEmail({
  alerts,
  threshold,
  baseUrl,
  unsubscribeUrl,
}: HighScoreAlertEmailProps) {
  return (
    <BaseTemplate
      preview={`${alerts.length} zone${alerts.length > 1 ? "s" : ""} scored above ${threshold} today!`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={heading}>&#128293; High Score Alert</Text>
      <Text style={paragraph}>
        {alerts.length} of your favorite zone{alerts.length > 1 ? "s" : ""}{" "}
        scored above your {threshold}-point threshold today.
      </Text>

      {alerts.map((alert, i) => (
        <Section key={i} style={alertCard}>
          <Text style={zoneName}>{alert.zoneName}</Text>
          <Text style={scoreText}>
            Score:{" "}
            <span
              style={{
                fontWeight: "bold",
                color: labelColors[alert.label] || "#334155",
              }}
            >
              {alert.score} ({alert.label})
            </span>
          </Text>
          <Text style={detailText}>
            <span style={{ fontWeight: "bold" }}>{alert.topSpecies}</span>
          </Text>
          <Text style={detailText}>Best Window: {alert.bestWindow}</Text>
          <Text style={captainCallText}>
            &ldquo;{alert.captainCall}&rdquo;
          </Text>
          <Section style={{ marginTop: "12px" }}>
            <Link
              href={`${baseUrl}/dashboard/zones/${alert.zoneSlug}`}
              style={zoneLink}
            >
              View Full Forecast &rarr;
            </Link>
          </Section>
        </Section>
      ))}

      <Hr style={divider} />

      <Section style={{ textAlign: "center" as const, padding: "16px 0" }}>
        <Link href={`${baseUrl}/dashboard`} style={cta}>
          Open Dashboard
        </Link>
      </Section>
    </BaseTemplate>
  );
}

export async function renderHighScoreAlertEmail(
  props: HighScoreAlertEmailProps
): Promise<string> {
  return await render(<HighScoreAlertEmail {...props} />);
}

// ─── Styles ──────────────────────────────────────────────────

const heading: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#0f172a",
  marginBottom: "8px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  color: "#334155",
  lineHeight: "1.6",
};

const alertCard: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "12px 0",
  borderLeft: "4px solid #16a34a",
};

const zoneName: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#0f172a",
  margin: "0 0 4px 0",
};

const scoreText: React.CSSProperties = {
  fontSize: "14px",
  color: "#334155",
  margin: "0 0 2px 0",
};

const detailText: React.CSSProperties = {
  fontSize: "13px",
  color: "#475569",
  margin: "0 0 2px 0",
};

const captainCallText: React.CSSProperties = {
  fontSize: "13px",
  color: "#64748b",
  fontStyle: "italic",
  margin: "6px 0 0 0",
};

const zoneLink: React.CSSProperties = {
  fontSize: "13px",
  color: "#2563eb",
  textDecoration: "underline",
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
