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
    name: "Fact Verification",
    description: "Instantly cross-reference claims against thousands of verified global sources to determine accuracy with high confidence.",
    href: "/investigate",
    cta: "Start Verification",
    className: "col-span-3 lg:col-span-2",
    background: <FactCheckVisual />,
  },
  {
    Icon: Activity,
    name: "Bias Detection",
    description: "Uncover hidden political, demographic, and corporate biases using advanced linguistic analysis.",
    href: "/investigate",
    cta: "Analyze Bias",
    className: "col-span-3 lg:col-span-1",
    background: <BiasDetectionVisual />,
  },
  {
    Icon: TrendingUp,
    name: "Sentiment Analysis",
    description: "Decode emotional undercurrents and predict potential public reaction to content.",
    href: "/investigate",
    cta: "View Sentiment",
    className: "col-span-3 lg:col-span-1",
    background: <SentimentAnalysisVisual />,
  },
  {
    Icon: Globe,
    name: "Source Tracing",
    description: "Map the complete genealogy of a story from its original source through every modification and share.",
    href: "/investigate",
    cta: "Trace Source",
    className: "col-span-3 lg:col-span-2",
    background: <OriginMapVisual />,
  },
  {
    Icon: User,
    name: "Creator Profiling",
    description: "Analyze creator credibility, past accuracy records, and content distribution patterns.",
    href: "/investigate",
    cta: "Analyze Profile",
    className: "col-span-3 lg:col-span-1",
    background: <CreatorBackgroundVisual />,
  },
  {
    Icon: Building2,
    name: "Entity Background",
    description: "Deep-dive verification of companies and organizations, including funding sources and affiliations.",
    href: "/investigate",
    cta: "Check Entity",
    className: "col-span-3 lg:col-span-2",
    background: <CompanyBackgroundVisual />,
  },
];

export function BentoFeatures() {
  return (
    <section id="features" className="relative py-24 md:py-32 bg-background overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] max-w-[1000px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Section Header */}
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
              Intelligence at Scale
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Equip your organization with comprehensive AI tools designed to detect, verify, and analyze information integrity across the digital landscape.
            </p>
          </div>

          {/* Bento Grid */}
          <BentoGrid className="lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <BentoCard key={idx} {...feature} />
            ))}
          </BentoGrid>
        </div>
      </div>
    </section>
  );
}

