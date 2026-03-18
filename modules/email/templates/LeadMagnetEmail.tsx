import { Text, Section, Link, Hr } from "@react-email/components";
import { render } from "@react-email/render";
import * as React from "react";
import { BaseTemplate } from "./BaseTemplate";

interface LeadMagnetEmailProps {
  baseUrl: string;
  unsubscribeUrl: string;
}

export function LeadMagnetEmail({ baseUrl, unsubscribeUrl }: LeadMagnetEmailProps) {
  return (
    <BaseTemplate
      preview="Your SoCal Bite Window Cheat Sheet is here!"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={heading}>Your SoCal Bite Window Cheat Sheet</Text>
      <Text style={paragraph}>
        Thanks for signing up! Here are the top bite window tips that SoCal anglers
        swear by — backed by the same data our forecast engine uses.
      </Text>

      <Section style={tipCard}>
        <Text style={tipTitle}>Top Fishing Tips</Text>

        <Text style={tip}>
          <strong>Best tide timing:</strong> 2 hours before high tide through the
          first hour of outgoing — bait gets pushed into feeding zones.
        </Text>

        <Text style={tip}>
          <strong>Moon matters:</strong> New and full moons create the strongest
          tidal swings, which triggers aggressive feeding.
        </Text>

        <Text style={tip}>
          <strong>Dawn &amp; dusk always win:</strong> Low light = confident fish.
          First and last light are prime time, every time.
        </Text>

        <Text style={tip}>
          <strong>Watch the barometer:</strong> Falling barometric pressure triggers
          feeding frenzies. Fish sense the change before storms arrive.
        </Text>
      </Section>

      <Hr style={divider} />

      <Section style={tipCard}>
        <Text style={tipTitle}>SoCal Zone Quick Reference</Text>

        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Zone</th>
              <th style={th}>Best Window</th>
              <th style={th}>Top Species</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={td}>San Clemente Basin</td>
              <td style={td}>5:30 — 8:00 AM</td>
              <td style={td}>Bluefin, Yellowtail</td>
            </tr>
            <tr>
              <td style={tdAlt}>Dana Point</td>
              <td style={tdAlt}>6:00 — 8:30 AM</td>
              <td style={tdAlt}>Halibut, Calico Bass</td>
            </tr>
            <tr>
              <td style={td}>Newport Pier</td>
              <td style={td}>5:45 — 7:30 AM</td>
              <td style={td}>Corbina, Yellowfin Croaker</td>
            </tr>
            <tr>
              <td style={tdAlt}>Catalina Island</td>
              <td style={tdAlt}>5:30 — 8:00 AM</td>
              <td style={tdAlt}>White Seabass, Yellowtail</td>
            </tr>
            <tr>
              <td style={td}>Lake Perris</td>
              <td style={td}>6:00 — 9:00 AM</td>
              <td style={td}>Largemouth Bass, Trout</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Hr style={divider} />

      <Section style={{ textAlign: "center" as const, padding: "16px 0" }}>
        <Text style={paragraph}>
          Want personalized daily forecasts with live data?
        </Text>
        <Link href={`${baseUrl}/register`} style={cta}>
          Get Your Daily Forecast
        </Link>
      </Section>
    </BaseTemplate>
  );
}

export async function renderLeadMagnetEmail(props: LeadMagnetEmailProps): Promise<string> {
  return await render(<LeadMagnetEmail {...props} />);
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

const tipCard: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
};

const tipTitle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#0f172a",
  marginBottom: "12px",
};

const tip: React.CSSProperties = {
  fontSize: "14px",
  color: "#475569",
  lineHeight: "1.6",
  margin: "8px 0",
};

const divider: React.CSSProperties = {
  borderColor: "#e2e8f0",
  margin: "24px 0",
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse" as const,
  fontSize: "13px",
};

const th: React.CSSProperties = {
  textAlign: "left" as const,
  padding: "8px",
  borderBottom: "2px solid #e2e8f0",
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
};

const td: React.CSSProperties = {
  padding: "8px",
  borderBottom: "1px solid #f1f5f9",
  color: "#334155",
};

const tdAlt: React.CSSProperties = {
  ...td,
  backgroundColor: "#f8fafc",
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
