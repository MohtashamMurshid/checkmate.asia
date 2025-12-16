'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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
    <section className={`relative min-h-screen flex items-center overflow-hidden pt-20 ${instrumentSans.className}`}>
      {/* Content Container */}
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text Content */}
          <div className="lg:col-span-7 flex flex-col gap-8 text-left z-10">
            {/* Headline */}
            <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-foreground leading-[1.1]">
              Know What <br />
              To Trust
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Checkmate analyzes information for factual accuracy, bias, and sentiment.
            </p>

            {/* CTA Button */}
            <div className="flex flex-wrap gap-4 pt-2">
               <Button 
                asChild 
                size="lg" 
                className="bg-[#FCD34D] hover:bg-[#FCD34D]/90 text-black font-medium rounded-md h-12 px-8 text-base shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <Link href="/contact">
                  GET A DEMO
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
              <div className="flex border-b border-border/10 pb-4 mb-6">
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

              {/* Chart Area (Abstract Scatter Plot) */}
              <div className="relative h-48 w-full bg-transparent">
                  {/* Axis Labels */}
                  <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-muted-foreground/60 h-full py-2">
                      <span>100</span>
                      <span>80</span>
                      <span>60</span>
                      <span>40</span>
                      <span>20</span>
                      <span>0</span>
                  </div>
                  
                  {/* Scatter Dots - Simulated Data */}
                  <div className="absolute inset-0 ml-8">
                      {/* Random distribution of dots to match the design's scatter plot feel */}
                      {[...Array(40)].map((_, i) => (
                          <div 
                              key={i}
                              className={`absolute rounded-full border ${Math.random() > 0.3 ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-rose-500/20 bg-rose-500/10'}`}
                              style={{
                                  width: Math.random() > 0.7 ? '8px' : '6px',
                                  height: Math.random() > 0.7 ? '8px' : '6px',
                                  left: `${Math.random() * 90}%`,
                                  top: `${Math.random() * 80 + 10}%`,
                                  opacity: Math.random() * 0.5 + 0.3
                              }}
                          />
                      ))}
                      
                      {/* Highlighted Insight Tooltip */}
                      <div className="absolute bottom-8 right-0 bg-background border border-border/50 shadow-lg rounded-lg p-3 max-w-[200px] animate-in fade-in zoom-in duration-700 delay-300">
                          <p className="text-xs text-foreground/80 leading-snug">
                            3 potential inaccuracies detected in latest viral source analysis.
                          </p>
                          <div className="mt-2">
                             <Button variant="outline" size="sm" className="h-6 text-[10px] px-2">
                                View Report
                             </Button>
                          </div>
                      </div>
                  </div>
                  
                  {/* X Axis */}
                  <div className="absolute bottom-0 left-8 right-0 border-t border-border/10 pt-1 flex justify-between text-[10px] text-muted-foreground/60">
                      <span>SEP 1</span>
                      <span>OCT 1</span>
                  </div>
              </div>

            </div>
          </div>
        </div>
        
        {/* Footer Text */}
        <div className="mt-24 text-center">
            <p className={`text-xs md:text-sm tracking-widest text-muted-foreground uppercase opacity-60 ${departureMono.className}`}>
                Trusted by leading organizations
            </p>
        </div>

      </div>

    </section>
  );
}
