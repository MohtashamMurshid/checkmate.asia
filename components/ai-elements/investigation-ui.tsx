'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function CredibilityBadge({ score, username, platform }: { score: number; username: string; platform: string }) {
  const getColor = (s: number) => {
    if (s >= 8) return 'bg-green-500';
    if (s >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getLabel = (s: number) => {
    if (s >= 8) return 'High Credibility';
    if (s >= 5) return 'Medium Credibility';
    return 'Low Credibility';
  };

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">{username}</span>
          <Badge variant="outline" className="text-[10px] h-5">{platform}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={score * 10} className={cn("h-2 w-24", getColor(score))} />
          <span className="text-xs font-medium text-muted-foreground">{score}/10</span>
        </div>
      </div>
      <Badge className={cn("text-white", getColor(score))}>
        {getLabel(score)}
      </Badge>
    </div>
  );
}

interface ComparisonPoint {
  category: string;
  userSource: string;
  externalSource: string;
  match: boolean;
}

export function SourceComparison({ 
  userSourceContent, 
  externalSummary,
  comparisonPoints 
}: { 
  userSourceContent: string;
  externalSummary: string;
  comparisonPoints: ComparisonPoint[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Source Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">User Personal Source</h4>
            <div className="p-3 bg-muted/30 rounded-md text-sm border min-h-[100px] max-h-[200px] overflow-y-auto">
              {userSourceContent}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">External Investigation</h4>
            <div className="p-3 bg-muted/30 rounded-md text-sm border min-h-[100px] max-h-[200px] overflow-y-auto">
              {externalSummary}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Key Differences & Similarities</h4>
          {comparisonPoints.map((point, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 border rounded-md text-sm">
              <div className="mt-0.5">
                {point.match ? (
                  <CheckCircle2 className="size-4 text-green-500" />
                ) : (
                  <AlertCircle className="size-4 text-yellow-500" />
                )}
              </div>
              <div className="flex-1 grid md:grid-cols-3 gap-2">
                <div className="font-medium md:col-span-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {point.category}
                </div>
                <div className="md:col-span-2 grid gap-1">
                  <div className="grid grid-cols-[80px_1fr] gap-2 text-xs">
                     <span className="text-muted-foreground">User:</span>
                     <span>{point.userSource}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-2 text-xs">
                     <span className="text-muted-foreground">External:</span>
                     <span>{point.externalSource}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

