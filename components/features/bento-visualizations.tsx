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
  Users,
  Search,
  FileText,
  Info,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Common card style to match landing page glassmorphism
const CardBase = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn(
    "relative w-full h-full overflow-hidden rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm p-4",
    className
  )}>
    {children}
  </div>
);

export function FactCheckVisual() {
  return (
    <CardBase>
      <div className="flex items-center justify-between mb-4 border-b border-border/10 pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-medium text-muted-foreground">Verification Status</span>
        </div>
        <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-medium">
          Partially False
        </span>
      </div>
      
      <div className="space-y-3">
        <div className="bg-muted/30 rounded-lg p-2.5 border border-amber-500/20">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] text-foreground/90 font-medium leading-relaxed">
              "Tax cuts increased federal revenue by $2 trillion"
            </p>
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-3.5 h-3.5 rounded-full bg-primary/20 border border-background flex items-center justify-center text-[6px]">
                    {i}
                  </div>
                ))}
              </div>
              <span className="text-[9px] text-muted-foreground">3 sources analyzed</span>
            </div>
            <div className="bg-background/50 rounded p-1.5 border border-border/10">
              <div className="flex items-start gap-1.5">
                <Info className="w-2.5 h-2.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[9px] text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">Analysis:</span> While tax cuts occurred, revenue data shows mixed results. Some sources claim increase, others show deficit growth. Requires deeper investigation.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full h-7 text-[10px] text-xs"
          onClick={() => window.location.href = '/investigate'}
        >
          Learn More
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </CardBase>
  );
}

export function BiasDetectionVisual() {
  return (
    <CardBase>
      <div className="flex items-center justify-between mb-4 border-b border-border/10 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-medium text-muted-foreground">Bias Analysis</span>
        </div>
        <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-medium">
          Detected
        </span>
      </div>

      <div className="space-y-3 mb-3">
        <div className="bg-muted/30 rounded-lg p-2 border border-border/10">
          <p className="text-[10px] text-foreground/80 mb-2 leading-relaxed">
            "Government spending is out of control and hurting working families"
          </p>
        </div>
        
        <div className="space-y-2.5">
          {[
            { label: "Political Right", score: 78, color: "bg-red-500", lean: "Conservative" },
            { label: "Political Left", score: 15, color: "bg-blue-500", lean: "Liberal" },
            { label: "Demographic", score: 8, color: "bg-emerald-500", lean: "Low" },
          ].map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-medium">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="text-foreground">{item.score}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000", item.color)} 
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <p className="text-[9px] text-muted-foreground italic">
                {item.lean} leaning detected
              </p>
            </div>
          ))}
        </div>
        
        <div className="bg-background/50 rounded p-1.5 border border-red-500/20">
          <p className="text-[9px] text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Explanation:</span> Language patterns suggest conservative political bias with emphasis on fiscal responsibility and family values.
          </p>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full h-7 text-[10px] text-xs"
        onClick={() => window.location.href = '/investigate'}
      >
        Learn More
        <ArrowRight className="w-3 h-3 ml-1" />
      </Button>
    </CardBase>
  );
}

export function SentimentAnalysisVisual() {
  return (
    <CardBase>
      <div className="flex items-center justify-between mb-4 border-b border-border/10 pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-medium text-muted-foreground">Sentiment</span>
        </div>
        <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-medium">
          Highly Controversial
        </span>
      </div>

      <div className="space-y-3">
        <div className="bg-muted/30 rounded-lg p-2 border border-border/10">
          <p className="text-[10px] text-foreground/80 mb-2 leading-relaxed">
            "Climate policies are destroying the economy"
          </p>
        </div>

        <div className="relative h-20 w-full flex items-end gap-1 px-1">
          {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 85, 40, 60, 75, 50].map((h, i) => (
            <div 
              key={i} 
              className="w-full bg-purple-500/20 rounded-t-sm relative overflow-hidden transition-all duration-500" 
              style={{ height: `${h}%` }}
            >
               <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-purple-500/40 to-transparent" />
            </div>
          ))}
          
          {/* Floating indicator */}
          <div className="absolute top-2 right-2 bg-background/90 backdrop-blur border border-amber-500/50 p-1.5 rounded-lg shadow-sm">
             <div className="flex items-center gap-1">
               <AlertCircle className="w-2.5 h-2.5 text-amber-500" />
               <span className="text-[9px] font-medium">Polarized</span>
             </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-[9px]">
          <div className="bg-red-500/10 border border-red-500/20 rounded p-1.5 text-center">
            <div className="text-muted-foreground">Negative</div>
            <div className="text-red-500 font-bold text-xs">68%</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded p-1.5 text-center">
            <div className="text-muted-foreground">Positive</div>
            <div className="text-blue-500 font-bold text-xs">32%</div>
          </div>
        </div>
        
        <div className="bg-background/50 rounded p-1.5 border border-amber-500/20">
          <p className="text-[9px] text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Analysis:</span> Content triggers strong emotional responses. Sentiment split along political lines - conservatives negative, liberals positive.
          </p>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full h-7 text-[10px] text-xs mt-2"
        onClick={() => window.location.href = '/investigate'}
      >
        Learn More
        <ArrowRight className="w-3 h-3 ml-1" />
      </Button>
    </CardBase>
  );
}

export function OriginMapVisual() {
  return (
    <CardBase>
      <div className="flex items-center justify-between mb-4 border-b border-border/10 pb-2">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-medium text-muted-foreground">Origin Trail</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-muted/30 rounded-lg p-2 border border-border/10">
          <p className="text-[10px] text-foreground/80 mb-2 leading-relaxed">
            "Election fraud evidence discovered"
          </p>
        </div>

        <div className="relative pl-3 space-y-3">
          {/* Vertical line */}
          <div className="absolute left-[5.5px] top-2 bottom-2 w-px bg-border/60" />

          {[
            { type: "First Post", source: "@ConservativeNews", time: "8:15 AM", active: true, bias: "Right-leaning" },
            { type: "Viral Spread", source: "Parler", time: "9:42 AM", active: false, bias: "Right-leaning" },
            { type: "Mainstream", source: "News Portal", time: "11:30 AM", active: false, bias: "Fact-checked" },
          ].map((item, i) => (
            <div key={i} className="relative flex items-center gap-3">
               <div className={cn(
                 "w-1.5 h-1.5 rounded-full z-10 ring-4 ring-background", 
                 item.active ? "bg-indigo-500" : "bg-muted-foreground/30"
               )} />
               <div className={cn(
                 "flex-1 p-2 rounded-md border text-[10px]",
                 item.active ? "bg-indigo-500/5 border-indigo-500/20" : "bg-muted/20 border-border/10"
               )}>
                  <div className="flex justify-between font-medium mb-0.5">
                    <span>{item.type}</span>
                    <span className="text-muted-foreground">{item.time}</span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1 mb-1">
                    <LinkIcon className="w-2.5 h-2.5" />
                    {item.source}
                  </div>
                  <div className="text-[9px] text-muted-foreground italic">
                    {item.bias}
                  </div>
               </div>
            </div>
          ))}
        </div>
        
        <div className="bg-background/50 rounded p-1.5 border border-indigo-500/20">
          <p className="text-[9px] text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Timeline:</span> Content originated from right-leaning source, spread through conservative platforms before mainstream fact-checking.
          </p>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full h-7 text-[10px] text-xs mt-2"
        onClick={() => window.location.href = '/investigate'}
      >
        Learn More
        <ArrowRight className="w-3 h-3 ml-1" />
      </Button>
    </CardBase>
  );
}

export function CreatorBackgroundVisual() {
  return (
    <CardBase>
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-3">
           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
              <User className="w-5 h-5 text-foreground/70" />
           </div>
           <div>
              <div className="text-xs font-bold">@PoliticalCommentator</div>
              <div className="text-[10px] text-muted-foreground">2.4M followers • Verified</div>
           </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-2 border border-border/10">
          <div className="text-[10px] text-muted-foreground mb-2">Political Leaning</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Conservative</span>
              <span className="text-xs font-bold text-red-500">82%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: '82%' }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Liberal</span>
              <span className="text-xs font-bold text-blue-500">18%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '18%' }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
           <div className="bg-muted/30 p-2 rounded-lg border border-border/10 text-center">
              <div className="text-[10px] text-muted-foreground mb-1">Credibility</div>
              <div className="text-sm font-bold text-amber-500">64%</div>
           </div>
           <div className="bg-muted/30 p-2 rounded-lg border border-border/10 text-center">
              <div className="text-[10px] text-muted-foreground mb-1">Fact Accuracy</div>
              <div className="text-sm font-bold text-orange-500">58%</div>
           </div>
        </div>
        
        <div className="bg-background/50 rounded p-1.5 border border-red-500/20">
          <p className="text-[9px] text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Profile:</span> Strong conservative bias detected. History of sharing partisan content with mixed fact-checking results.
          </p>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full h-7 text-[10px] text-xs mt-2"
        onClick={() => window.location.href = '/investigate'}
      >
        Learn More
        <ArrowRight className="w-3 h-3 ml-1" />
      </Button>
    </CardBase>
  );
}

export function CompanyBackgroundVisual() {
  return (
    <CardBase>
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-3">
           <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Building2 className="w-5 h-5 text-blue-500" />
           </div>
           <div>
              <div className="text-xs font-bold flex items-center gap-1">
                MediaCorp Holdings
                <CheckCircle2 className="w-3 h-3 text-blue-500" />
              </div>
              <div className="text-[10px] text-muted-foreground">Founded 2015 • Public Company</div>
           </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-2 border border-border/10">
          <div className="text-[10px] text-muted-foreground mb-2">Political Affiliation</div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Donations (2020-2024)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex justify-between text-[9px] mb-0.5">
                  <span className="text-red-500">Republican</span>
                  <span className="font-medium">$2.4M</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-[9px] mb-0.5">
                  <span className="text-blue-500">Democratic</span>
                  <span className="font-medium">$800K</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
           {[
             { label: "Entity Verification", status: "Verified", icon: FileText },
             { label: "Political Bias", status: "Right-leaning", icon: Activity },
             { label: "Track Record", status: "Mixed", icon: History },
           ].map((item, i) => (
             <div key={i} className="flex items-center justify-between p-2 rounded-md bg-muted/20 border border-border/10">
                <div className="flex items-center gap-2">
                   <item.icon className="w-3 h-3 text-muted-foreground" />
                   <span className="text-[10px] font-medium">{item.label}</span>
                </div>
                <span className={cn(
                  "text-[9px] font-medium px-1.5 py-0.5 rounded",
                  item.status === "Verified" ? "text-emerald-500 bg-emerald-500/5" :
                  item.status === "Right-leaning" ? "text-red-500 bg-red-500/5" :
                  "text-amber-500 bg-amber-500/5"
                )}>
                  {item.status}
                </span>
             </div>
           ))}
        </div>
        
        <div className="bg-background/50 rounded p-1.5 border border-red-500/20">
          <p className="text-[9px] text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Analysis:</span> Company shows significant right-leaning political bias through campaign contributions and editorial history.
          </p>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full h-7 text-[10px] text-xs mt-2"
        onClick={() => window.location.href = '/investigate'}
      >
        Learn More
        <ArrowRight className="w-3 h-3 ml-1" />
      </Button>
    </CardBase>
  );
}

