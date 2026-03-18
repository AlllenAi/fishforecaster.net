import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Preview,
} from "@react-email/components";
import * as React from "react";

interface BaseTemplateProps {
  preview: string;
  children: React.ReactNode;
  unsubscribeUrl?: string;
}

export function BaseTemplate({ preview, children, unsubscribeUrl }: BaseTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        {/* Header */}
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>
              <span style={{ fontSize: "24px" }}>&#x1F3A3;</span> The Fish Forecaster
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} The Fish Forecaster. All rights reserved.
            </Text>
            {unsubscribeUrl && (
              <Text style={footerText}>
                <Link href={unsubscribeUrl} style={unsubscribeLink}>
                  Unsubscribe from emails
                </Link>
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Inline Styles ───────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  overflow: "hidden",
};

const header: React.CSSProperties = {
  backgroundColor: "#0f172a",
  padding: "24px 32px",
  textAlign: "center" as const,
};

const logo: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "bold",
  margin: 0,
  letterSpacing: "-0.5px",
};

const content: React.CSSProperties = {
  padding: "32px",
};

const hr: React.CSSProperties = {
  borderColor: "#e2e8f0",
  margin: "0 32px",
};

const footer: React.CSSProperties = {
  padding: "24px 32px",
  textAlign: "center" as const,
};

const footerText: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
  margin: "4px 0",
};

const unsubscribeLink: React.CSSProperties = {
  color: "#94a3b8",
  textDecoration: "underline",
};
