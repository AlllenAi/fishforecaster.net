"use client";

import { LandingHeader } from "./LandingHeader";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { SampleForecastSection } from "./SampleForecastSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { PricingPreview } from "./PricingPreview";
import { LeadCaptureForm } from "./LeadCaptureForm";
import { FooterCTA } from "./FooterCTA";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      <LandingHeader />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SampleForecastSection />
      <TestimonialsSection />
      <PricingPreview />
      <LeadCaptureForm />
      <FooterCTA />
    </div>
  );
}
