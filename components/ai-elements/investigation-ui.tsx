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
  userSource?: string;
  externalSource?: string;
  searchSource?: string;
  researchSource?: string;
  match: boolean;
}

export function SourceComparison({ 
  userContextComparison,
  searchVsResearchComparison,
  userSourceContent,
  webSearchSummary,
  deepResearchSummary
}: { 
  userContextComparison?: ComparisonPoint[];
  searchVsResearchComparison?: ComparisonPoint[];
  userSourceContent?: string;
  webSearchSummary?: string;
  deepResearchSummary?: string;
}) {
  console.log('[CROSS-CHECK] Step 10: SourceComparison component rendered');
  console.log('[CROSS-CHECK] Component props:', {
    userContextComparison: userContextComparison,
    userContextComparisonLength: Array.isArray(userContextComparison) ? userContextComparison.length : 0,
    searchVsResearchComparison: searchVsResearchComparison,
    searchVsResearchComparisonLength: Array.isArray(searchVsResearchComparison) ? searchVsResearchComparison.length : 0,
    hasUserSourceContent: !!userSourceContent,
    userSourceContentLength: userSourceContent?.length || 0,
    hasWebSearchSummary: !!webSearchSummary,
    webSearchSummaryLength: webSearchSummary?.length || 0,
    hasDeepResearchSummary: !!deepResearchSummary,
    deepResearchSummaryLength: deepResearchSummary?.length || 0,
  });
  
  // Check if we have any data to show
  const hasUserContextSection = userSourceContent && (userContextComparison?.length || 0) > 0;
  const hasSearchVsResearchSection = searchVsResearchComparison && searchVsResearchComparison.length > 0;
  const hasWebSearchData = !!webSearchSummary;
  const hasDeepResearchData = !!deepResearchSummary;
  
  console.log('[CROSS-CHECK] Rendering conditions:', {
    hasUserContextSection,
    hasSearchVsResearchSection,
    hasWebSearchData,
    hasDeepResearchData,
    willRenderUserContext: hasUserContextSection,
    willRenderSearchVsResearch: hasSearchVsResearchSection,
  });
  
  // If we have no data at all, show a message
  if (!hasUserContextSection && !hasSearchVsResearchSection && !hasWebSearchData && !hasDeepResearchData) {
    console.log('[CROSS-CHECK] No data to render - showing empty state');
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Source Comparison Cross-Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Info className="size-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No comparison data available yet.</p>
            <p className="text-xs mt-1">Waiting for cross-check analysis to complete...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Source Comparison Cross-Check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* User Context vs External Search */}
        {(userSourceContent || (userContextComparison && userContextComparison.length > 0)) && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <Badge variant="outline">Context Check</Badge>
              <h3 className="text-sm font-semibold">User Context vs. Web Search</h3>
            </div>
            
            {(userSourceContent || webSearchSummary) && (
              <div className="grid md:grid-cols-2 gap-4">
                {userSourceContent && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase">User Personal Source</h4>
                    <div className="p-3 bg-muted/30 rounded-md text-sm border min-h-[100px] max-h-[200px] overflow-y-auto">
                      {userSourceContent}
                    </div>
                  </div>
                )}
                {webSearchSummary && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase">Web Search Findings</h4>
                    <div className="p-3 bg-muted/30 rounded-md text-sm border min-h-[100px] max-h-[200px] overflow-y-auto">
                      {webSearchSummary}
                    </div>
                  </div>
                )}
              </div>
            )}

            {userContextComparison && userContextComparison.length > 0 && (
              <div className="space-y-3">
                {userContextComparison.map((point, idx) => (
                  <ComparisonRow key={idx} point={point} leftLabel="User" rightLabel="Search" leftKey="userSource" rightKey="externalSource" />
                ))}
              </div>
            )}
            
            {(!userContextComparison || userContextComparison.length === 0) && (
              <div className="text-sm text-muted-foreground text-center py-4">
                <Info className="size-4 mx-auto mb-1 opacity-50" />
                <p>No comparison points generated yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Search vs Deep Research */}
        {(searchVsResearchComparison && searchVsResearchComparison.length > 0) || webSearchSummary || deepResearchSummary ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <Badge variant="outline">Fact Check</Badge>
              <h3 className="text-sm font-semibold">Initial Search vs. Deep Research</h3>
            </div>

            {(webSearchSummary || deepResearchSummary) && (
              <div className="grid md:grid-cols-2 gap-4">
                {webSearchSummary && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase">Initial News Search</h4>
                    <div className="p-3 bg-muted/30 rounded-md text-sm border min-h-[100px] max-h-[200px] overflow-y-auto">
                      {webSearchSummary}
                    </div>
                  </div>
                )}
                {deepResearchSummary && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase">Deep Research & Facts</h4>
                    <div className="p-3 bg-muted/30 rounded-md text-sm border min-h-[100px] max-h-[200px] overflow-y-auto">
                      {deepResearchSummary}
                    </div>
                  </div>
                )}
                {!deepResearchSummary && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase">Deep Research & Facts</h4>
                    <div className="p-3 bg-muted/30 rounded-md text-sm border min-h-[100px] max-h-[200px] overflow-y-auto text-muted-foreground">
                      No deep research summary available.
                    </div>
                  </div>
                )}
              </div>
            )}

            {searchVsResearchComparison && searchVsResearchComparison.length > 0 ? (
              <div className="space-y-3">
                {searchVsResearchComparison.map((point, idx) => (
                  <ComparisonRow key={idx} point={point} leftLabel="Search" rightLabel="Research" leftKey="searchSource" rightKey="researchSource" />
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                <Info className="size-4 mx-auto mb-1 opacity-50" />
                <p>No comparison points generated yet.</p>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ComparisonRow({ point, leftLabel, rightLabel, leftKey, rightKey }: { point: ComparisonPoint, leftLabel: string, rightLabel: string, leftKey: keyof ComparisonPoint, rightKey: keyof ComparisonPoint }) {
  return (
    <div className="flex items-start gap-3 p-3 border rounded-md text-sm bg-background/50">
      <div className="mt-0.5">
        {point.match ? (
          <CheckCircle2 className="size-4 text-green-500" />
        ) : (
          <AlertCircle className="size-4 text-yellow-500" />
        )}
      </div>
      <div className="flex-1 grid md:grid-cols-3 gap-2">
        <div className="font-medium md:col-span-1 text-xs uppercase tracking-wider text-muted-foreground flex items-center">
          {point.category}
        </div>
        <div className="md:col-span-2 grid gap-1">
          <div className="grid grid-cols-[80px_1fr] gap-2 text-xs">
             <span className="text-muted-foreground">{leftLabel}:</span>
             <span>{point[leftKey]}</span>
          </div>
          <div className="grid grid-cols-[80px_1fr] gap-2 text-xs">
             <span className="text-muted-foreground">{rightLabel}:</span>
             <span>{point[rightKey]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
