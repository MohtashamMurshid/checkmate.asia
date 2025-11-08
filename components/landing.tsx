'use client';

import { Button } from "@/components/ui/button";
import {  ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import localFont from "next/font/local";
import { DottedSurface } from "@/components/dotted";

const departureMono = localFont({ src: "../fonts/DepartureMono-Regular.woff2" });

export function LandingHero() {

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-[calc(100vh-88px)] flex items-center justify-center overflow-hidden">
      {/* Dotted Surface Background */}
      <DottedSurface className="absolute inset-0" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Top badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1.5 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs sm:text-sm text-muted-foreground">New: External API & Dashboard updates</span>
          </div>

          {/* Headline */}
          <h1 className={`max-w-3xl mx-auto text-5xl md:text-6xl font-semibold tracking-tight mb-2 `}>
            Verify Information in <span className="text-primary">
                Seconds
            </span>

          </h1>
          {/* Subheadline */}
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive AI-powered tools to investigate your information’s <span className="text-primary">
                accuracy</span> and <span className="text-primary">
                    bias</span> from credible sources.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            
          
            <Button variant="default" >
            <Link href="/contact" className="flex items-center">
              Book a Demo <ArrowRight className="ml-2 h-4 w-4" />
               </Link>
            </Button>
          </div>


          {/* Sponsors strip */}
          <div className="mx-auto mt-14 w-full max-w-5xl border-t border-border/60 pt-8">
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <div className="opacity-80">Due diligence

</div>
              <div className="opacity-80">Trace your data</div>
              <div className="opacity-80">Political bias</div>
              <div className="opacity-80">Data Compliance</div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

