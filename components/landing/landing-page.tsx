"use client";

import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingExplorer } from "@/components/landing/landing-explorer";
import { LandingLeads } from "@/components/landing/landing-leads";
import { LandingSteps } from "@/components/landing/landing-steps";
import { LandingStats } from "@/components/landing/landing-stats";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

export function LandingPage() {
  return (
    <main className="min-h-screen w-full" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <LandingNavbar />
      <LandingHero />
      <LandingFeatures />
      <LandingExplorer />
      <LandingLeads />
      <LandingSteps />
      <LandingStats />
      <LandingCta />
      <LandingFooter />
    </main>
  );
}
