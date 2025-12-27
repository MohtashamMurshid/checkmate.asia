'use client';

import { Newspaper, Users, Shield, ArrowRight, CheckCircle2, TrendingUp, Lock } from "lucide-react";
import Link from "next/link";
import localFont from "next/font/local";
import { Instrument_Sans } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

const departureMono = localFont({ src: "../fonts/DepartureMono-Regular.woff2" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"] });

export function UseCasesSection() {
  const cases = [
    {
      title: "News & Media",
      description: "Automated fact-checking and bias detection for modern newsrooms.",
      icon: Newspaper,
      href: "/newsreporting",
      visual: NewsReportingVisual,
    },
    {
      title: "Public Relations",
      description: "Monitor brand sentiment and verify public statements in real-time.",
      icon: Users,
      href: "/publicrelations",
      visual: PublicRelationsVisual,
    },
    {
      title: "Data Compliance & Agentic Solutions",
      description: "Ensure AI agents operate within regulatory boundaries with verified data.",
      icon: Shield,
      href: "/datacompliance",
      visual: DataComplianceVisual,
    },
  ];

  return (
    <section id="use-cases" className={`py-20 md:py-32 bg-background ${instrumentSans.className}`}>
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        
        {/* Header Section */}
        <div className="text-center space-y-4 mb-16 md:mb-24">
          <h2 className={`text-sm md:text-base text-primary uppercase tracking-wider ${departureMono.className}`}>
          </h2>
          <h3 className="text-3xl md:text-5xl font-medium tracking-tight text-foreground">
                       
        Use Cases
          </h3>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We show what's trustworthy through our comprehensive suite of verification tools
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cases.map((item, index) => (
            <Card key={index} className="flex flex-col border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors duration-300 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="mb-4 inline-flex items-center justify-center size-12 rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-6" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-medium">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground leading-relaxed">
                  {item.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 min-h-[160px] p-0">
                  <div className="w-full h-full border-y border-border/50 bg-background/50 p-4 relative overflow-hidden">
                      <item.visual />
                  </div>
              </CardContent>

              <CardFooter className="pt-4">
                <Button variant="ghost" className="group pl-0 hover:pl-2 transition-all" asChild>
                  <Link href={item.href}>
                    Learn more 
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}

// Visual Components

const NewsReportingVisual = () => (
    <div className="flex flex-col gap-3 h-full justify-center select-none">
        {[1, 2, 3].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-md bg-muted/40 border border-border/40">
                <div className="size-2 rounded-full bg-primary/40 shrink-0" />
                <div className="space-y-1.5 flex-1">
                    <div className="h-1.5 w-3/4 rounded-full bg-muted-foreground/20" />
                    <div className="h-1.5 w-1/2 rounded-full bg-muted-foreground/10" />
                </div>
                <CheckCircle2 className="size-3 text-green-500 shrink-0" />
            </div>
        ))}
    </div>
)

const PublicRelationsVisual = () => (
    <div className="relative h-full w-full flex items-end justify-between px-2 pb-2 gap-1 select-none">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-[0.05]" 
             style={{ 
                 backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', 
                 backgroundSize: '16px 16px' 
             }} 
        />
        
        {/* Trend Line */}
        <div className="absolute inset-0 flex items-center justify-center">
            <TrendingUp className="size-12 text-primary/10" />
        </div>

        {/* Bars */}
        {[30, 45, 35, 60, 55, 75, 80, 65, 85, 90].map((h, i) => (
            <div key={i} className="w-full bg-primary/20 rounded-t-sm relative group overflow-hidden" style={{ height: `${h}%` }}>
                <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-primary/30 to-transparent group-hover:from-primary/50 transition-colors" />
            </div>
        ))}
    </div>
)

const DataComplianceVisual = () => (
    <div className="h-full w-full flex items-center justify-center select-none relative">
         <div className="absolute inset-0 flex items-center justify-center">
             <div className="size-24 rounded-full border border-primary/10 animate-[spin_10s_linear_infinite]" />
             <div className="size-32 rounded-full border border-primary/5 border-dashed absolute animate-[spin_15s_linear_infinite_reverse]" />
         </div>
         
         <div className="bg-background border border-border shadow-sm rounded-lg p-3 z-10 flex flex-col items-center gap-2">
            <Lock className="size-6 text-primary" />
            <div className="flex gap-1">
                <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                <div className="size-1.5 rounded-full bg-green-500 animate-pulse delay-75" />
                <div className="size-1.5 rounded-full bg-green-500 animate-pulse delay-150" />
            </div>
            <div className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 rounded">
                VERIFIED
            </div>
         </div>
    </div>
)
