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
    "relative w-full h-full overflow-auto rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm p-5 flex flex-col",
    className
  )}>
    {children}
  </div>
);

export function FactCheckVisual() {
  return (
    <CardBase>
      <div className="flex items-center justify-between mb-5 border-b border-border/10 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-medium text-muted-foreground">Verification Status</span>
        </div>
        <span className="text-xs bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full font-medium">
          Partially False
        </span>
      </div>
      
      <div className="space-y-4">
        <div className="bg-muted/30 rounded-lg p-3 border border-amber-500/20">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs text-foreground/90 font-medium leading-relaxed">
              "Tax cuts increased federal revenue by $2 trillion"
            </p>
            <AlertCircle className="w-4.5 h-4.5 text-amber-500 shrink-0" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-4.5 h-4.5 rounded-full bg-primary/20 border border-background flex items-center justify-center text-[10px]">
                    {i}
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">3 sources analyzed</span>
            </div>
            <div className="bg-background/50 rounded p-2 border border-border/10">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">Analysis:</span> While tax cuts occurred, revenue data shows mixed results. Some sources claim increase, others show deficit growth. Requires deeper investigation.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full h-8 text-xs"
          onClick={() => window.location.href = '/investigate'}
        >
          Learn More
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </CardBase>
  );
}

export function BiasDetectionVisual() {
  return (
    <CardBase>
      <div className="flex items-center justify-between mb-5 border-b border-border/10 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-medium text-muted-foreground">Bias Analysis</span>
        </div>
        <span className="text-xs bg-red-500/10 text-red-500 px-3 py-1 rounded-full font-medium">
          Detected
        </span>
      </div>

      <div className="space-y-4 mb-4">
        <div className="bg-muted/30 rounded-lg p-3 border border-border/10">
          <p className="text-xs text-foreground/80 mb-2 leading-relaxed">
            "Government spending is out of control and hurting working families"
          </p>
        </div>
        
        <div className="space-y-3">
          {[
            { label: "Political Right", score: 78, color: "bg-red-500", lean: "Conservative" },
            { label: "Political Left", score: 15, color: "bg-blue-500", lean: "Liberal" },
            { label: "Demographic", score: 8, color: "bg-emerald-500", lean: "Low" },
          ].map((item, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-medium">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="text-foreground">{item.score}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000", item.color)} 
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground italic">
                {item.lean} leaning detected
              </p>
            </div>
          ))}
        </div>
        
        <div className="bg-background/50 rounded p-2 border border-red-500/20">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Explanation:</span> Language patterns suggest conservative political bias with emphasis on fiscal responsibility and family values.
          </p>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full h-8 text-xs"
        onClick={() => window.location.href = '/investigate'}
      >
        Learn More
        <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </CardBase>
  );
}

export function SentimentAnalysisVisual() {
  return (
    <CardBase>
      <div className="flex items-center justify-between mb-5 border-b border-border/10 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-500" />
          <span className="text-sm font-medium text-muted-foreground">Sentiment</span>
        </div>
        <span className="text-xs bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full font-medium">
          Highly Controversial
        </span>
      </div>

      <div className="space-y-4">
        <div className="bg-muted/30 rounded-lg p-3 border border-border/10">
          <p className="text-xs text-foreground/80 mb-2 leading-relaxed">
            "Climate policies are destroying the economy"
          </p>
        </div>

        <div className="relative h-24 w-full flex items-end gap-1.5 px-1">
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
          <div className="absolute top-2 right-2 bg-background/90 backdrop-blur border border-amber-500/50 p-2 rounded-lg shadow-sm">
             <div className="flex items-center gap-1.5">
               <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
               <span className="text-xs font-medium">Polarized</span>
             </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-red-500/10 border border-red-500/20 rounded p-2 text-center">
            <div className="text-muted-foreground">Negative</div>
            <div className="text-red-500 font-bold text-sm">68%</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2 text-center">
            <div className="text-muted-foreground">Positive</div>
            <div className="text-blue-500 font-bold text-sm">32%</div>
          </div>
        </div>
        
        <div className="bg-background/50 rounded p-2 border border-amber-500/20">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Analysis:</span> Content triggers strong emotional responses. Sentiment split along political lines - conservatives negative, liberals positive.
          </p>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full h-8 text-xs mt-2"
        onClick={() => window.location.href = '/investigate'}
      >
        Learn More
        <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </CardBase>
  );
}

export function OriginMapVisual() {
  return (
    <CardBase>
      <div className="flex items-center justify-between mb-5 border-b border-border/10 pb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-500" />
          <span className="text-sm font-medium text-muted-foreground">Origin Trail</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-muted/30 rounded-lg p-3 border border-border/10">
          <p className="text-xs text-foreground/80 mb-2 leading-relaxed">
            "Election fraud evidence discovered"
          </p>
        </div>

        <div className="relative pl-4 space-y-4">
          {/* Vertical line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border/60" />

          {[
            { type: "First Post", source: "@ConservativeNews", time: "8:15 AM", active: true, bias: "Right-leaning" },
            { type: "Viral Spread", source: "Parler", time: "9:42 AM", active: false, bias: "Right-leaning" },
            { type: "Mainstream", source: "News Portal", time: "11:30 AM", active: false, bias: "Fact-checked" },
          ].map((item, i) => (
            <div key={i} className="relative flex items-center gap-3">
               <div className={cn(
                 "w-2 h-2 rounded-full z-10 ring-4 ring-background", 
                 item.active ? "bg-indigo-500" : "bg-muted-foreground/30"
               )} />
               <div className={cn(
                 "flex-1 p-2.5 rounded-md border text-xs",
                 item.active ? "bg-indigo-500/5 border-indigo-500/20" : "bg-muted/20 border-border/10"
               )}>
                  <div className="flex justify-between font-medium mb-1">
                    <span>{item.type}</span>
                    <span className="text-muted-foreground">{item.time}</span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1.5 mb-1">
                    <LinkIcon className="w-3.5 h-3.5" />
                    {item.source}
                  </div>
                  <div className="text-xs text-muted-foreground italic">
                    {item.bias}
                  </div>
               </div>
            </div>
          ))}
        </div>
        
        <div className="bg-background/50 rounded p-2 border border-indigo-500/20">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Timeline:</span> Content originated from right-leaning source, spread through conservative platforms before mainstream fact-checking.
          </p>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full h-8 text-xs mt-2"
        onClick={() => window.location.href = '/investigate'}
      >
        Learn More
        <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </CardBase>
  );
}

export function CreatorBackgroundVisual() {
  return (
    <CardBase>
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
              <User className="w-6 h-6 text-foreground/70" />
           </div>
           <div>
              <div className="text-sm font-bold">@PoliticalCommentator</div>
              <div className="text-xs text-muted-foreground">2.4M followers • Verified</div>
           </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-3 border border-border/10">
          <div className="text-xs text-muted-foreground mb-3">Political Leaning</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Conservative</span>
              <span className="text-sm font-bold text-red-500">82%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: '82%' }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Liberal</span>
              <span className="text-sm font-bold text-blue-500">18%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '18%' }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
           <div className="bg-muted/30 p-3 rounded-lg border border-border/10 text-center">
              <div className="text-xs text-muted-foreground mb-1">Credibility</div>
              <div className="text-base font-bold text-amber-500">64%</div>
           </div>
           <div className="bg-muted/30 p-3 rounded-lg border border-border/10 text-center">
              <div className="text-xs text-muted-foreground mb-1">Fact Accuracy</div>
              <div className="text-base font-bold text-orange-500">58%</div>
           </div>
        </div>
        
        <div className="bg-background/50 rounded p-2 border border-red-500/20">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Profile:</span> Strong conservative bias detected. History of sharing partisan content with mixed fact-checking results.
          </p>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full h-8 text-xs mt-2"
        onClick={() => window.location.href = '/investigate'}
      >
        Learn More
        <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </CardBase>
  );
}

export function CompanyBackgroundVisual() {
  return (
    <CardBase>
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
           <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Building2 className="w-6 h-6 text-blue-500" />
           </div>
           <div>
              <div className="text-sm font-bold flex items-center gap-1.5">
                MediaCorp Holdings
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xs text-muted-foreground">Founded 2015 • Public Company</div>
           </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-3 border border-border/10">
          <div className="text-xs text-muted-foreground mb-3">Political Affiliation</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Donations (2020-2024)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-red-500">Republican</span>
                  <span className="font-medium">$2.4M</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-blue-500">Democratic</span>
                  <span className="font-medium">$800K</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
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
             <div key={i} className="flex items-center justify-between p-2.5 rounded-md bg-muted/20 border border-border/10">
                <div className="flex items-center gap-2">
                   <item.icon className="w-4 h-4 text-muted-foreground" />
                   <span className="text-xs font-medium">{item.label}</span>
                </div>
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded",
                  item.status === "Verified" ? "text-emerald-500 bg-emerald-500/5" :
                  item.status === "Right-leaning" ? "text-red-500 bg-red-500/5" :
                  "text-amber-500 bg-amber-500/5"
                )}>
                  {item.status}
                </span>
             </div>
           ))}
        </div>
        
        <div className="bg-background/50 rounded p-2 border border-red-500/20">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Analysis:</span> Company shows significant right-leaning political bias through campaign contributions and editorial history.
          </p>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full h-8 text-xs mt-2"
        onClick={() => window.location.href = '/investigate'}
      >
        Learn More
        <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </CardBase>
  );
}

