'use client';

import { BentoCard, BentoGrid } from "./bento-grid";
import { 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  Globe, 
  User, 
  Building2 
} from "lucide-react";
import {
  FactCheckVisual,
  BiasDetectionVisual,
  SentimentAnalysisVisual,
  OriginMapVisual,
  CreatorBackgroundVisual,
  CompanyBackgroundVisual
} from "@/components/features/bento-visualizations";

const features = [
  {
    Icon: ShieldCheck,
    name: "Fact Check",
    description: "Accurate and unbiased data in seconds. Verified sources under 2 minutes.",
    href: "/investigate",
    cta: "Verify Now",
    className: "col-span-3 lg:col-span-2",
    background: <FactCheckVisual />,
  },
  {
    Icon: Activity,
    name: "Bias Detection",
    description: "Political, Demographic, and Personal bias analysis.",
    href: "/investigate",
    cta: "Scan Content",
    className: "col-span-3 lg:col-span-1",
    background: <BiasDetectionVisual />,
  },
  {
    Icon: TrendingUp,
    name: "Sentiment Analysis",
    description: "Controversial detection and emotional tone mapping.",
    href: "/investigate",
    cta: "Analyze",
    className: "col-span-3 lg:col-span-1",
    background: <SentimentAnalysisVisual />,
  },
  {
    Icon: Globe,
    name: "Origin Map",
    description: "Real estates linked citations in chronological order.",
    href: "/investigate",
    cta: "Trace Origin",
    className: "col-span-3 lg:col-span-2",
    background: <OriginMapVisual />,
  },
  {
    Icon: User,
    name: "Creator Background",
    description: "Creator profile and social media norm detection.",
    href: "/investigate",
    cta: "View Profile",
    className: "col-span-3 lg:col-span-1",
    background: <CreatorBackgroundVisual />,
  },
  {
    Icon: Building2,
    name: "Company Background",
    description: "Verified entity checks and historical data.",
    href: "/investigate",
    cta: "Check Entity",
    className: "col-span-3 lg:col-span-2",
    background: <CompanyBackgroundVisual />,
  },
];

export function BentoFeatures() {
  return (
    <section id="features" className="relative py-20 md:py-32 bg-background overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] max-w-[1000px] bg-orange-400/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-4">
            <h2 className="text-5xl md:text-6xl font-medium tracking-tight text-foreground leading-[1.1]">
              Powerful Features for
              <span className="text-primary"> Truth Verification</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive AI-powered tools to detect, verify, and combat misinformation across all digital platforms
            </p>
          </div>

          {/* Bento Grid */}
          <BentoGrid className="max-w-6xl mx-auto lg:grid-cols-3">
            {features.map((feature, idx) => (
              <BentoCard key={idx} {...feature} />
            ))}
          </BentoGrid>
        </div>
      </div>
    </section>
  );
}

