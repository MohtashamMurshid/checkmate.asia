'use client';

import { LandingHero } from "@/components/landing";
import { HeroSubtitle } from "@/components/hero-subtitle";
import { CTASection } from "@/components/cta-section";
import Features from "@/components/features-12";
import Features10 from "@/components/features-10";
import { SourcesSection } from "@/components/sources-section";
import { useEffect } from "react";

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
      <LandingHero />
      <HeroSubtitle />
      <Features />
      <Features10 />
      <SourcesSection />
      <CTASection />
    </div>
  );
}

