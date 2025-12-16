'use client';

import { LandingHero } from "@/components/landing";
import { HeroSubtitle } from "@/components/hero-subtitle";
import { CTASection } from "@/components/cta-section";
import { BentoFeatures } from "@/components/bento-features";
import { SourcesSection } from "@/components/sources-section";
import { useEffect } from "react";
import FooterSection from "@/components/footer";
import { Header } from "@/components/header";
import Features from "@/components/features-10";
import { UseCasesSection } from "@/components/use-cases-section";

export default function LandingContent() {
  useEffect(() => {
    // Handle hash navigation on page load
    const hash = window.location.hash.slice(1);
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  return (
    <div className="relative">
        <Header />
      <LandingHero />
       <BentoFeatures />
      <Features />
      <UseCasesSection />
      <SourcesSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}

