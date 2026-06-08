import { Text, Section, Link, Hr } from "@react-email/components";
import { render } from "@react-email/render";
import * as React from "react";
import { BaseTemplate } from "./BaseTemplate";

interface LeadMagnetEmailProps {
  baseUrl: string;
  unsubscribeUrl: string;
  fishingType?: string;
}

const zonesByType: Record<string, Array<{ zone: string; window: string; species: string }>> = {
  salt: [
    { zone: "San Clemente Basin", window: "5:30 — 8:00 AM", species: "Bluefin, Yellowtail" },
    { zone: "Dana Point", window: "6:00 — 8:30 AM", species: "Halibut, Calico Bass" },
    { zone: "Newport Pier", window: "5:45 — 7:30 AM", species: "Corbina, Yellowfin Croaker" },
    { zone: "Catalina Island", window: "5:30 — 8:00 AM", species: "White Seabass, Yellowtail" },
    { zone: "San Diego Bay", window: "6:00 — 8:00 AM", species: "Halibut, Spotfin Croaker" },
  ],
  fresh: [
    { zone: "Lake Perris", window: "6:00 — 9:00 AM", species: "Largemouth Bass, Trout" },
    { zone: "Lake Elsinore", window: "6:30 — 9:30 AM", species: "Striped Bass, Catfish" },
    { zone: "Castaic Lake", window: "5:30 — 8:30 AM", species: "Largemouth Bass, Striped Bass" },
    { zone: "Lake Skinner", window: "6:00 — 9:00 AM", species: "Rainbow Trout, Catfish" },
    { zone: "Dixon Lake", window: "6:30 — 9:00 AM", species: "Rainbow Trout, Largemouth Bass" },
  ],
  both: [
    { zone: "San Clemente Basin", window: "5:30 — 8:00 AM", species: "Bluefin, Yellowtail" },
    { zone: "Dana Point", window: "6:00 — 8:30 AM", species: "Halibut, Calico Bass" },
    { zone: "Catalina Island", window: "5:30 — 8:00 AM", species: "White Seabass, Yellowtail" },
    { zone: "Lake Perris", window: "6:00 — 9:00 AM", species: "Largemouth Bass, Trout" },
    { zone: "Castaic Lake", window: "5:30 — 8:30 AM", species: "Largemouth Bass, Striped Bass" },
  ],
};

const titleByType: Record<string, string> = {
  salt: "Your SoCal Saltwater Bite Window Cheat Sheet",
  fresh: "Your SoCal Freshwater Bite Window Cheat Sheet",
  both: "Your SoCal Bite Window Cheat Sheet",
};

export function LeadMagnetEmail({ baseUrl, unsubscribeUrl, fishingType = "both" }: LeadMagnetEmailProps) {
  const zones = zonesByType[fishingType] ?? zonesByType.both;
  const title = titleByType[fishingType] ?? titleByType.both;

  return (
    <BaseTemplate
      preview={`${title} is here!`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={heading}>{title}</Text>
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
            {zones.map((row, i) => (
              <tr key={row.zone}>
                <td style={i % 2 === 0 ? td : tdAlt}>{row.zone}</td>
                <td style={i % 2 === 0 ? td : tdAlt}>{row.window}</td>
                <td style={i % 2 === 0 ? td : tdAlt}>{row.species}</td>
              </tr>
            ))}
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
