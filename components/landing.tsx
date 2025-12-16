'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, AlertCircle, Activity, Database } from "lucide-react";
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
               Get instant fact-checking, bias detection, and sentiment analysis. Make confident decisions.
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

                 {/* Fact Item 2 */}
                 <div className="bg-muted/30 rounded-lg p-3 border border-border/10">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                      "New tax regulations impact 85% of small businesses immediately."
                    </p>
                    <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                     <span className="text-[10px] text-amber-500/90 font-medium">Context Missing</span>
                     <span className="text-[10px] text-muted-foreground">• Needs clarification</span>
                  </div>
                </div>
              </div>

              {/* Data Checking Visualization */}
              <div className="relative h-20 w-full bg-muted/20 rounded-lg border border-border/10 overflow-hidden p-3">
                  <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-1.5">
                        <Activity className="size-3 text-blue-500" />
                        <span className="text-[10px] font-medium text-muted-foreground">Data Integrity Check</span>
                     </div>
                     <span className="text-[10px] text-emerald-500 animate-pulse flex items-center gap-1">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        Active
                     </span>
                  </div>
                  
                  {/* Data flow bars */}
                  <div className="flex items-end justify-between h-8 gap-0.5">
                    {[40, 70, 45, 90, 60, 80, 50, 75, 60, 95, 85, 40, 60, 75, 45, 90, 55, 80].map((h, i) => (
                         <div key={i} className="w-full bg-primary/20 rounded-t-[1px] relative overflow-hidden transition-all duration-1000 ease-in-out" style={{ height: `${h}%` }}>
                             <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-primary/30 to-transparent" />
                         </div>
                    ))}
                  </div>
              </div>

            </div>
          </div>
        </div>
        
        {/* Footer Text */}
        <div className="mt-24 text-center">
            <p className={`text-xs md:text-sm tracking-widest text-muted-foreground uppercase opacity-60 ${departureMono.className}`}>
                Trusted by organizations worldwide
            </p>
        </div>

      </div>

    </section>
  );
}
