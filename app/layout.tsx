import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "sonner";
import { CookieConsentBanner } from "@/modules/privacy/ui/CookieConsentBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Fish Forecaster - Know When The Fish Will Bite",
  description:
    "AI-powered fishing forecasts for Southern California. Daily bite scores, best fishing windows, and species predictions for 13 saltwater and freshwater zones.",
  keywords:
    "fishing forecast, bite score, SoCal fishing, tide fishing, fishing weather, fishing moon phase",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}