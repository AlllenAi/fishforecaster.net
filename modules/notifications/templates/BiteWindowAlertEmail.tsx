import { Text, Section, Link, Hr } from "@react-email/components";
import { render } from "@react-email/render";
import * as React from "react";
import { BaseTemplate } from "@/modules/email/templates/BaseTemplate";
import type { BiteWindowAlert } from "../types/notification.schema";

interface BiteWindowAlertEmailProps {
  alerts: BiteWindowAlert[];
  baseUrl: string;
  unsubscribeUrl: string;
}

const strengthColors: Record<string, string> = {
  STRONG: "#16a34a",
  MODERATE: "#2563eb",
  WEAK: "#d97706",
};

export function BiteWindowAlertEmail({
  alerts,
  baseUrl,
  unsubscribeUrl,
}: BiteWindowAlertEmailProps) {
  return (
    <BaseTemplate
      preview={`Strong bite windows detected in ${alerts.length} zone${alerts.length > 1 ? "s" : ""} today`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={heading}>&#127919; Bite Window Alert</Text>
      <Text style={paragraph}>
        Strong bite windows detected in {alerts.length} of your favorite zone
        {alerts.length > 1 ? "s" : ""} today. Get out there!
      </Text>

      {alerts.map((alert, i) => (
        <Section key={i} style={alertCard}>
          <Text style={zoneName}>
            {alert.zoneName}{" "}
            <span style={scoreLabel}>
              Score: {alert.score} ({alert.label})
            </span>
          </Text>

          {alert.windows.map((w, j) => (
            <Section key={j} style={windowRow}>
              <Text style={windowTime}>
                {w.start} &mdash; {w.end}
                <span
                  style={{
                    ...strengthBadge,
                    color: strengthColors[w.strength] || "#334155",
                  }}
                >
                  {" "}
                  {w.strength}
                </span>
              </Text>
              <Text style={windowFactors}>{w.factors.join(" + ")}</Text>
            </Section>
          ))}

          <Section style={{ marginTop: "8px" }}>
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

export async function renderBiteWindowAlertEmail(
  props: BiteWindowAlertEmailProps
): Promise<string> {
  return await render(<BiteWindowAlertEmail {...props} />);
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
  backgroundColor: "#eff6ff",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "12px 0",
  borderLeft: "4px solid #2563eb",
};

const zoneName: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#0f172a",
  margin: "0 0 8px 0",
};

const scoreLabel: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "normal",
  color: "#64748b",
};

const windowRow: React.CSSProperties = {
  margin: "6px 0",
  padding: "8px 12px",
  backgroundColor: "#ffffff",
  borderRadius: "6px",
};

const windowTime: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: "bold",
  color: "#0f172a",
  margin: "0 0 2px 0",
};

const strengthBadge: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: "bold",
  textTransform: "uppercase" as const,
};

const windowFactors: React.CSSProperties = {
  fontSize: "12px",
  color: "#64748b",
  margin: 0,
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
