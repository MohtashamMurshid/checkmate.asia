'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, AlertCircle, Activity, Database, Scale, Heart, Search, XCircle } from "lucide-react";
import Link from "next/link";
import localFont from "next/font/local";
import { Instrument_Sans } from "next/font/google";

const departureMono = localFont({ src: "../fonts/DepartureMono-Regular.woff2" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"] });

export function LandingHero() {

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className={`relative min-h-screen flex items-center overflow-hidden pt-20 ${instrumentSans.className}`}>
      {/* Content Container */}
      <div className="container mx-auto max-w-6xl px-4 md:px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text Content */}
          <div className="lg:col-span-7 flex flex-col gap-8 text-left z-10">
            {/* Headline */}
            <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-foreground leading-[1.1]">
              Stop Guessing. <br />
              Know What's Real.
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
               Get instant fact-checking, bias detection, and sentiment analysis. Make Data verified decisions.
            </p>

            {/* CTA Button */}
            <div className="flex flex-wrap gap-4 pt-2">
               <Button 
                asChild 
                size="lg" 
                className="bg-[#FCD34D] hover:bg-[#FCD34D]/90 text-black font-medium rounded-md h-12 px-8 text-base shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <Link href="/contact">
                  Try Demo 
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: Visualization */}
          <div className="lg:col-span-5 relative z-0 mt-12 lg:mt-0 transform scale-110 md:scale-125 origin-center">
             {/* Orange Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-orange-400/30 blur-[100px] rounded-full pointer-events-none opacity-60 dark:opacity-40" />

            {/* Dashboard Card */}
            <div className="relative rounded-xl border border-border/40 bg-background/80 backdrop-blur-xl shadow-2xl overflow-hidden p-6 max-w-md mx-auto transform rotate-1 transition-transform hover:rotate-0 duration-500">
              
              {/* Card Header / Tabs */}
              <div className="flex border-b border-border/10 pb-4 mb-4">
                 <div className="w-1/2 border-r border-border/10 pr-4">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Trust Score</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-semibold">94.2</span>
                        <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">High</span>
                    </div>
                 </div>
                 <div className="w-1/2 pl-4">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Bias Detected</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-semibold">1.2%</span>
                        <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">Low</span>
                    </div>
                 </div>
              </div>

              {/* Fact Analysis Stream */}
              <div className="space-y-3 mb-5">
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Live Fact Analysis</div>
                
                {/* Fact Item 1 */}
                <div className="bg-muted/30 rounded-lg p-3 border border-border/10">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                      "Global renewable energy capacity grew by 50% in 2023."
                    </p>
                    <AlertCircle className="size-4 text-red-500 shrink-0 mt-0.5" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                       <div className="size-4 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-[6px]">1</div>
                       <div className="size-4 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-[6px]">2</div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Disputed across 2 sources</span>
                  </div>
                </div>

                 {/* Fact Item 2 */}
                 <div className="bg-muted/30 rounded-lg p-3 border border-border/10">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                      "The world’s largest solar power plant is located in India."
                    </p>
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                     <div className="flex -space-x-1.5">
                        <div className="size-4 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[6px]">1</div>
                        <div className="size-4 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[6px]">2</div>
                        <div className="size-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[6px]">3</div>
                     </div>
                     <span className="text-[10px] text-muted-foreground">Verified across 3 sources</span>
                  </div>
                </div>
              </div>

              {/* Data Row */}
              <div className="space-y-2 mb-5">
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Data Analysis</div>
                
                {/* Data Row 1 */}
                <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/10 text-xs">
                  <span className="text-muted-foreground shrink-0 w-8">#1</span>
                  <span className="truncate flex-1 text-[10px]">Climate change impacts are accelerating...</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">2%</Badge>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">pos</Badge>
                    <CheckCircle2 className="size-3 text-emerald-500" />
                  </div>
                </div>

                {/* Data Row 2 */}
                <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/10 text-xs">
                  <span className="text-muted-foreground shrink-0 w-8">#2</span>
                  <span className="truncate flex-1 text-[10px]">Economic forecasts show mixed signals...</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4">45%</Badge>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">neg</Badge>
                    <AlertCircle className="size-3 text-red-500" />
                  </div>
                </div>

           
              </div>


            </div>
          </div>
        </div>
        
        {/* Footer Text */}
        <div className="mt-24 text-center">
            <p className={`text-xs md:text-sm tracking-widest text-muted-foreground uppercase opacity-60 ${departureMono.className}`}>
                Noisy world, noisy data 

            </p>
        </div>

      </div>

    </section>
  );
}
