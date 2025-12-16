'use client';

import { 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Building2, 
  Globe, 
  Link as LinkIcon, 
  TrendingUp, 
  Activity,
  ShieldCheck,
  History,
  FileText,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Simplified container for visualizations
const VisualContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn(
    "relative w-full h-full flex flex-col justify-center select-none pointer-events-none",
    className
  )}>
    {children}
  </div>
);

// Reusable glass card for internal elements
const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn(
    "bg-background/90 backdrop-blur-md rounded-xl border border-border/50 shadow-sm p-4",
    className
  )}>
    {children}
  </div>
);

export function FactCheckVisual() {
  return (
    <VisualContainer>
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Claim Verification</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
            Reviewing
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="bg-muted/50 rounded-lg p-2.5 border border-border/50">
            <div className="flex gap-2">
              <div className="w-1 h-8 rounded-full bg-amber-500/50 shrink-0" />
              <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                "Federal revenue increased by 40% immediately following the new tax legislation passed last quarter..."
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center shadow-sm z-10 first:z-30 last:z-10">
                  <div className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-emerald-500' : i === 2 ? 'bg-amber-500' : 'bg-red-500'}`} />
                </div>
              ))}
              <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-[8px] font-medium z-0 pl-1">
                +12
              </div>
            </div>
            <div className="text-[10px] font-medium text-muted-foreground">
              Cross-referencing sources...
            </div>
          </div>
        </div>
      </GlassCard>
    </VisualContainer>
  );
}

export function BiasDetectionVisual() {
  return (
    <VisualContainer>
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Bias Patterns</span>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: "Partisanship", score: 85, color: "bg-blue-500" },
            { label: "Sensationalism", score: 42, color: "bg-amber-500" },
            { label: "Objectivity", score: 20, color: "bg-emerald-500" },
          ].map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                <span>{item.label}</span>
                <span>{item.score}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000", item.color)} 
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </VisualContainer>
  );
}

export function SentimentAnalysisVisual() {
  return (
    <VisualContainer>
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium">Emotional Tone</span>
          </div>
        </div>

        <div className="flex items-end gap-1 h-24 w-full px-1 mb-2">
          {[30, 45, 35, 60, 40, 75, 55, 80, 50, 90, 70, 45, 55, 40, 30].map((h, i) => (
            <div 
              key={i} 
              className={cn(
                "w-full rounded-t-sm transition-all duration-500",
                h > 60 ? "bg-purple-500/80" : "bg-purple-500/30"
              )}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        <div className="flex justify-between items-center text-[10px] text-muted-foreground font-medium border-t border-border/50 pt-2">
          <span>Neutral</span>
          <span className="text-purple-500">Highly Charged</span>
        </div>
      </GlassCard>
    </VisualContainer>
  );
}

export function OriginMapVisual() {
  return (
    <VisualContainer>
      <GlassCard className="overflow-hidden">
         <div className="absolute top-0 right-0 p-3 opacity-20">
            <Globe className="w-16 h-16 text-indigo-500" />
         </div>
         
         <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-500">
                <LinkIcon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Source Trace</span>
            </div>

            <div className="relative pl-3 space-y-4">
              <div className="absolute left-[5.5px] top-2 bottom-2 w-px bg-gradient-to-b from-indigo-500/50 to-transparent" />
              
              {[
                { type: "Original", time: "0h 00m", verified: false },
                { type: "Aggregator", time: "+2h 15m", verified: false },
                { type: "Verified News", time: "+4h 30m", verified: true },
              ].map((step, i) => (
                <div key={i} className="relative flex items-center gap-3">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full z-10 ring-2 ring-background",
                    step.verified ? "bg-emerald-500" : "bg-indigo-500"
                  )} />
                  <div className="flex-1 p-2 rounded-md bg-muted/40 border border-border/50 text-[10px]">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">{step.type}</span>
                      <span className="text-muted-foreground text-[9px]">{step.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
         </div>
      </GlassCard>
    </VisualContainer>
  );
}

export function CreatorBackgroundVisual() {
  return (
    <VisualContainer>
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
           <div className="relative">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-rose-400 p-[1px]">
               <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                 <User className="w-5 h-5 text-muted-foreground" />
               </div>
             </div>
             <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-background rounded-full flex items-center justify-center p-0.5">
               <CheckCircle2 className="w-full h-full text-blue-500" />
             </div>
           </div>
           <div>
              <div className="text-sm font-semibold">@AnalysisBot</div>
              <div className="text-[10px] text-muted-foreground">High Credibility • Automated</div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
           <div className="bg-muted/30 p-2 rounded-lg border border-border/50 text-center">
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Accuracy</div>
              <div className="text-lg font-bold text-emerald-500">98%</div>
           </div>
           <div className="bg-muted/30 p-2 rounded-lg border border-border/50 text-center">
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Bias</div>
              <div className="text-lg font-bold text-blue-500">0.2</div>
           </div>
        </div>
      </GlassCard>
    </VisualContainer>
  );
}

export function CompanyBackgroundVisual() {
  return (
    <VisualContainer>
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Building2 className="w-5 h-5" />
           </div>
           <div>
              <div className="text-sm font-semibold">Global Media Inc.</div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">Verified Entity</span>
              </div>
           </div>
        </div>

        <div className="space-y-2">
           {[
             { label: "Funding", value: "Public", icon: FileText },
             { label: "Leaning", value: "Centrist", icon: Activity },
             { label: "History", value: "25 Years", icon: History },
           ].map((item, i) => (
             <div key={i} className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2">
                   <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                   <span className="text-[11px] font-medium text-muted-foreground">{item.label}</span>
                </div>
                <span className="text-[11px] font-semibold text-foreground">
                  {item.value}
                </span>
             </div>
           ))}
        </div>
      </GlassCard>
    </VisualContainer>
  );
}

