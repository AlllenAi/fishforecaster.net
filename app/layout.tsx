import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "sonner";
import { CookieConsentBanner } from "@/modules/privacy/ui/CookieConsentBanner";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://fishforecaster.net"
  ),
  title: {
    default: "fishforecaster.net - Know When The Fish Will Bite",
    template: "%s | fishforecaster.net",
  },
  description:
    "AI-powered fishing forecasts for Southern California. Daily bite scores, best fishing windows, and species predictions for 13 saltwater and freshwater zones.",
  keywords:
    "fishing forecast, bite score, SoCal fishing, tide fishing, fishing weather, fishing moon phase",
  openGraph: {
    type: "website",
    siteName: "fishforecaster.net",
    title: "fishforecaster.net - Know When The Fish Will Bite",
    description:
      "AI-powered fishing forecasts for Southern California. Daily bite scores, best fishing windows, and species predictions.",
  },
  twitter: {
    card: "summary_large_image",
    title: "fishforecaster.net - Know When The Fish Will Bite",
    description:
      "AI-powered fishing forecasts for Southern California. Daily bite scores, best fishing windows, and species predictions.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
          storageKey="theme"
        >
          <QueryProvider>
            {children}
            <Toaster richColors position="top-right" />
            <CookieConsentBanner />
            <Analytics />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}