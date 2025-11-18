"use client";

import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { 
  TrendingUp, 
  ShieldCheck, 
  BrainCircuit, 
  Scale,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export type VisualizationProps = ComponentProps<"div"> & {
  data: any;
};

const MetricsCard = ({ 
  confidence, 
  sourceCount 
}: { 
  confidence: number; 
  sourceCount: number;
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Analysis Metrics</CardTitle>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{Math.round(confidence * 100)}%</span>
            </div>
            <p className="text-xs text-muted-foreground">Confidence</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{sourceCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Sources</p>
          </div>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          Click to view detailed metrics and source credibility
        </div>
      </CardContent>
    </Card>
  );
};

const ConsistencyCard = ({ 
  sentiment,
  matchScore
}: { 
  sentiment: any;
  matchScore: number;
}) => {
  const breakdown = sentiment?.breakdown || { positive: 0, negative: 0, neutral: 0, mixed: 0 };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Sentiment-Verdict Consistency</CardTitle>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-xs text-muted-foreground mb-1">
            {sentiment?.classification === 'negative' ? 'Negative' : sentiment?.classification === 'positive' ? 'Positive' : 'Neutral'} ({Math.round((sentiment?.confidence || 0) * 100)}%) • High intensity • {sentiment?.classification} sentiment
          </div>
        </div>

        <div className="space-y-1 mb-4">
          <div className="flex justify-between text-xs font-medium mb-1">
            <span>Pattern Match</span>
            <span className="text-blue-600">{Math.round(matchScore * 100)}%</span>
          </div>
          <Progress value={matchScore * 100} className="h-1.5 bg-blue-100 text-blue-600" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Sentiment Breakdown</span>
            <span className="font-bold uppercase">{sentiment?.classification || 'UNKNOWN'}</span>
          </div>
          
          <div className="space-y-1.5">
            {['positive', 'negative', 'neutral', 'mixed'].map((type) => {
              const val = breakdown[type] || 0;
              const color = type === 'positive' ? 'bg-green-500' : type === 'negative' ? 'bg-red-500' : type === 'mixed' ? 'bg-yellow-500' : 'bg-gray-500';
              return (
                <div key={type} className="grid grid-cols-[80px_1fr_40px] items-center gap-2 text-xs">
                  <span className="capitalize text-muted-foreground">{type}</span>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", color)} style={{ width: `${val * 100}%` }} />
                  </div>
                  <span className="text-right">{Math.round(val * 100)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const BeliefDriversCard = ({ drivers }: { drivers: string[] }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Belief Drivers</CardTitle>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">
          Top psychological factors influencing belief ({drivers.length} total)
        </p>
        <ul className="space-y-2">
          {drivers.slice(0, 4).map((driver, i) => (
            <li key={i} className="text-xs flex items-start gap-2">
              <span className="mt-1.5 size-1 rounded-full bg-primary shrink-0" />
              <span>{driver}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

const BiasMeterCard = ({ political }: { political: any }) => {
  const score = political?.confidence || 0;
  const leaning = political?.classification || 'center';
  
  // Map generic leaning to "Pro-Government" / "Opposition" style if needed, 
  // or just keep as Left/Right/Center but display with the meter.
  // For this component, let's map Left -> Opposition, Right -> Pro-Government, Center -> Neutral for visual flair if desired,
  // but keeping strictly to data is safer. Let's stick to data but use the visual style.
  
  const getLabel = (l: string) => {
    if (l === 'left') return 'Left Leaning';
    if (l === 'right') return 'Right Leaning';
    return 'Center / Neutral';
  };

  const getColor = (l: string) => {
    if (l === 'left') return 'text-blue-600';
    if (l === 'right') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Political Bias Analysis</CardTitle>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">
          Analysis of political leaning in all news
        </p>

        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="text-muted-foreground">Assessment</span>
          <span className={cn("font-bold", getColor(leaning))}>{getLabel(leaning)}</span>
        </div>

        <div className="space-y-1 mb-1">
          <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
            <span>Left</span>
            <span>Center</span>
            <span>Right</span>
          </div>
          <div className="h-2 bg-gradient-to-r from-blue-500 via-gray-300 to-red-500 rounded-full relative">
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-primary rounded-full shadow-sm transition-all duration-500"
              style={{ 
                left: leaning === 'left' ? `${(1-score)*50}%` : leaning === 'right' ? `${50 + score*50}%` : '50%',
                transform: 'translate(-50%, -50%)' 
              }}
            />
          </div>
          <div className="text-center text-[10px] text-muted-foreground mt-1">
             {Math.round(score * 100)}% confidence
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const Visualization = ({ className, data, ...props }: VisualizationProps) => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  // Check if this is a full visualization data structure
  if (data.type === 'investigation_visualization') {
    const { initialContent, exaResults, comparison } = data;
    
    // Use Exa results for the main display as it's the "investigation" result, 
    // but we can use initialContent for comparison context if needed.
    const sentiment = exaResults?.sentiment;
    const political = exaResults?.politicalLeaning;
    const confidence = exaResults?.overallConfidence || sentiment?.confidence || 0;
    const sourceCount = exaResults?.citations?.length || 0;
    const beliefDrivers = exaResults?.beliefDrivers?.length ? exaResults.beliefDrivers : initialContent?.beliefDrivers || [];
    
    // Calculate match score (consistency)
    const matchScore = comparison?.sentimentDiff?.match ? 
      (sentiment?.confidence || 0.8) : 
      (1 - (sentiment?.confidence || 0));

    return (
      <div className={cn("grid md:grid-cols-2 gap-4", className)} {...props}>
        <MetricsCard confidence={confidence} sourceCount={sourceCount} />
        <ConsistencyCard sentiment={sentiment} matchScore={matchScore} />
        <BeliefDriversCard drivers={beliefDrivers} />
        <BiasMeterCard political={political} />
      </div>
    );
  }

  // Fallback for individual analysis (mock or partial data)
  if (data.sentiment || data.politicalLeaning) {
     // Adapt to new format on the fly if possible
     return (
      <div className={cn("grid md:grid-cols-2 gap-4", className)} {...props}>
        <ConsistencyCard sentiment={data.sentiment} matchScore={data.sentiment?.confidence || 0} />
        <BiasMeterCard political={data.politicalLeaning} />
      </div>
     );
  }

  return null;
};
