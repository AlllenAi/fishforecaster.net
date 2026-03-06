import type { Metadata } from "next";

export const defaultMeta: Metadata = {
  title: "The Fish Forecaster — Know When The Fish Will Bite",
  description:
    "AI-powered fishing forecasts for Southern California. Daily bite scores, best fishing windows, and species predictions for 13 saltwater and freshwater zones.",
  keywords:
    "fishing forecast, bite score, SoCal fishing, tide fishing, fishing weather, fishing moon phase, Southern California fishing, saltwater fishing, freshwater fishing",
  openGraph: {
    title: "The Fish Forecaster — Know When The Fish Will Bite",
    description:
      "AI-powered fishing forecasts combining tides, weather, moon phase, and swell data into one daily bite score for Southern California.",
    type: "website",
    siteName: "The Fish Forecaster",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Fish Forecaster — Know When The Fish Will Bite",
    description:
      "AI-powered fishing forecasts combining tides, weather, moon phase, and swell data into one daily bite score for Southern California.",
  },
};
