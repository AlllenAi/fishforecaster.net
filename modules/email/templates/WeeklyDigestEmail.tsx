import { Text, Section, Link, Hr } from "@react-email/components";
import { render } from "@react-email/render";
import * as React from "react";
import { BaseTemplate } from "./BaseTemplate";
import type { DigestDay } from "../types/email.schema";

interface WeeklyDigestEmailProps {
  dateRange: string;
  topDays: DigestDay[];
  baseUrl: string;
  unsubscribeUrl: string;
}

const labelColors: Record<string, string> = {
  EXCELLENT: "#16a34a",
  GOOD: "#2563eb",
  FAIR: "#d97706",
  POOR: "#94a3b8",
};

const labelEmoji: Record<string, string> = {
  EXCELLENT: "&#128293;", // fire
  GOOD: "&#127919;", // dart
  FAIR: "&#9978;", // anchor
  POOR: "&#127754;", // wave
};

export function WeeklyDigestEmail({
  dateRange,
  topDays,
  baseUrl,
  unsubscribeUrl,
}: WeeklyDigestEmailProps) {
  return (
    <BaseTemplate
      preview={`This week's hot fishing days — ${dateRange}`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={heading}>This Week&apos;s Hot Fishing Days</Text>
      <Text style={subheading}>{dateRange}</Text>
      <Text style={paragraph}>
        Here are the top fishing days coming up this week, ranked by our bite
        score algorithm.
      </Text>

      {topDays.map((day, i) => (
        <Section key={i} style={dayCard}>
          <Text style={dayRank}>
            <span
              dangerouslySetInnerHTML={{
                __html: labelEmoji[day.label] || "&#127919;",
              }}
            />{" "}
            {i === 0 ? "BEST DAY" : i === 1 ? "RUNNER UP" : "HONORABLE MENTION"}
          </Text>
          <Text style={dayName}>
            {day.dayName} &mdash; {day.zoneName}
          </Text>
          <Text style={dayDetails}>
            <span style={{ fontWeight: "bold" }}>{day.topSpecies}</span> &mdash;
            Score:{" "}
            <span
              style={{
                fontWeight: "bold",
                color: labelColors[day.label] || "#334155",
              }}
            >
              {day.score} ({day.label})
            </span>
          </Text>
          <Text style={dayWindow}>Best Window: {day.bestWindow}</Text>
          <Text style={dayType}>
            {day.waterType === "SALT" ? "Saltwater" : "Freshwater"}
          </Text>
        </Section>
      ))}

      <Hr style={divider} />

      <Section style={{ textAlign: "center" as const, padding: "16px 0" }}>
        <Link href={`${baseUrl}/dashboard`} style={cta}>
          View Full Forecast
        </Link>
      </Section>
    </BaseTemplate>
  );
}

export async function renderWeeklyDigestEmail(
  props: WeeklyDigestEmailProps
): Promise<string> {
  return await render(<WeeklyDigestEmail {...props} />);
}

// ─── Styles ──────────────────────────────────────────────────

const heading: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#0f172a",
  marginBottom: "4px",
};

const subheading: React.CSSProperties = {
  fontSize: "14px",
  color: "#64748b",
  marginTop: 0,
  marginBottom: "16px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  color: "#334155",
  lineHeight: "1.6",
};

const dayCard: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "12px 0",
  borderLeft: "4px solid #2563eb",
};

const dayRank: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: "bold",
  color: "#64748b",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 4px 0",
};

const dayName: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#0f172a",
  margin: "0 0 4px 0",
};

const dayDetails: React.CSSProperties = {
  fontSize: "14px",
  color: "#334155",
  margin: "0 0 2px 0",
};

const dayWindow: React.CSSProperties = {
  fontSize: "13px",
  color: "#475569",
  margin: "0 0 2px 0",
};

const dayType: React.CSSProperties = {
  fontSize: "11px",
  color: "#94a3b8",
  textTransform: "uppercase" as const,
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
