'use client';

import { use } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Share, Download, Clock, AlertTriangle, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Visualization } from "@/components/ai-elements/visualization";
import { EvolutionGraph } from "@/components/ai-elements/evolution-graph";
import { SourceComparison } from "@/components/ai-elements/investigation-ui";
import { MessageResponse } from "@/components/ai-elements/message";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function HistoryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const investigation = useQuery(api.investigations.get, { id: id as Id<"investigations"> });

  if (investigation === undefined) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <div className="p-4 rounded-full bg-muted">
          <Clock className="size-8 text-muted-foreground animate-spin" />
        </div>
        <h2 className="text-xl font-semibold">Loading...</h2>
      </div>
    );
  }

  if (!investigation) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <div className="p-4 rounded-full bg-muted">
          <AlertTriangle className="size-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Investigation Not Found</h2>
        <p className="text-muted-foreground max-w-md">
          The investigation details you requested could not be found.
        </p>
        <Button asChild variant="outline">
          <Link href="/investigate/history">Return to History</Link>
        </Button>
      </div>
    );
  }

  const dateStr = new Date(investigation.timestamp).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  // Comprehensive logging of investigation structure
  console.log('[HISTORY] Full investigation object:', JSON.stringify(investigation, null, 2));
  console.log('[HISTORY] Investigation results:', investigation.results);
  console.log('[HISTORY] Investigation results keys:', investigation.results ? Object.keys(investigation.results) : 'no results');
  console.log('[HISTORY] Investigation graphData:', investigation.graphData);
  
  // Extract summary from results
  const summary = investigation.results?.summary || investigation.results?.title || 'Investigation completed';
  
  // Extract visual data - check multiple possible locations
  const visualData = investigation.results?.visual || investigation.results?.visualData || null;
  
  // Extract sentiment and bias from visual data
  const sentiment = visualData?.initialContent?.sentiment?.classification || 
                   visualData?.exaResults?.sentiment?.classification ||
                   investigation.results?.sentiment?.classification ||
                   null;
  const politicalBias = visualData?.initialContent?.politicalLeaning?.classification ||
                        visualData?.exaResults?.politicalLeaning?.classification ||
                        investigation.results?.politicalBias?.classification ||
                        null;
  
  // Extract citations - check multiple locations
  const citations = investigation.results?.citations || 
                    investigation.results?.citationData || 
                    [];
  
  // Extract graph data - check both locations
  const graphData = investigation.results?.graphData || investigation.graphData || null;
  
  // Extract comparison data with logging
  const comparisonData = investigation.results?.comparisonData || null;
  
  console.log('[HISTORY] Extracted data:', {
    hasSummary: !!summary,
    summaryLength: summary?.length || 0,
    hasVisualData: !!visualData,
    visualDataKeys: visualData ? Object.keys(visualData) : [],
    hasSentiment: !!sentiment,
    hasPoliticalBias: !!politicalBias,
    citationsCount: citations.length,
    hasGraphData: !!graphData,
    graphDataKeys: graphData ? Object.keys(graphData) : [],
    hasComparisonData: !!comparisonData,
    comparisonDataKeys: comparisonData ? Object.keys(comparisonData) : [],
  });
  
  if (comparisonData) {
    console.log('[HISTORY] Comparison data structure:', {
      hasUserContextComparison: !!(comparisonData.userContextComparison || comparisonData.comparisonPoints),
      userContextComparisonLength: Array.isArray(comparisonData.userContextComparison) 
        ? comparisonData.userContextComparison.length 
        : Array.isArray(comparisonData.comparisonPoints)
        ? comparisonData.comparisonPoints.length
        : 0,
      hasSearchVsResearchComparison: !!comparisonData.searchVsResearchComparison,
      searchVsResearchComparisonLength: Array.isArray(comparisonData.searchVsResearchComparison) 
        ? comparisonData.searchVsResearchComparison.length 
        : 0,
      hasUserSourceContent: !!comparisonData.userSourceContent,
      hasWebSearchSummary: !!(comparisonData.webSearchSummary || comparisonData.externalSourcesSummary),
      hasDeepResearchSummary: !!comparisonData.deepResearchSummary,
      comparisonDataKeys: Object.keys(comparisonData),
    });
    console.log('[HISTORY] Full comparisonData:', JSON.stringify(comparisonData, null, 2));
  } else {
    console.log('[HISTORY] No comparisonData found');
    console.log('[HISTORY] Results structure:', investigation.results);
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Button variant="ghost" size="icon" className="h-6 w-6 -ml-2" asChild>
              <Link href="/investigate/history">
                <ChevronLeft className="size-4" />
              </Link>
            </Button>
            <span className="text-sm">Back to History</span>
            <span className="text-sm">•</span>
            <span className="text-sm flex items-center gap-1">
              <Clock className="size-3" /> {dateStr}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{investigation.userQuery}</h1>
          <div className="flex items-center gap-2 mt-2">
            {sentiment && (
              <Badge variant="outline">
                {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} Sentiment
              </Badge>
            )}
            {politicalBias && (
              <Badge variant="outline">{politicalBias} Bias</Badge>
            )}
            <Badge className="bg-chart-2/15 text-chart-2 hover:bg-chart-2/25 dark:text-chart-2 border-0">
              Completed
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Share className="size-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="size-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Source & Preview */}
        {investigation.userSourceContent && (
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              Source & Preview
            </h3>
            <Card>
              <CardContent className="p-4">
                <div className="bg-muted/30 p-3 rounded-md text-sm whitespace-pre-wrap">
                  {investigation.userSourceContent}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Cross-Check */}
        {comparisonData ? (
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              Cross-Check
            </h3>
            {(() => {
              console.log('[CROSS-CHECK] History page - Rendering SourceComparison');
              console.log('[CROSS-CHECK] History page - Props:', {
                userContextComparison: comparisonData.userContextComparison || comparisonData.comparisonPoints,
                searchVsResearchComparison: comparisonData.searchVsResearchComparison,
                userSourceContent: comparisonData.userSourceContent || investigation.userSourceContent,
                webSearchSummary: comparisonData.webSearchSummary || comparisonData.externalSourcesSummary,
                deepResearchSummary: comparisonData.deepResearchSummary,
              });
              
              return (
                <SourceComparison 
                  userContextComparison={comparisonData.userContextComparison || comparisonData.comparisonPoints}
                  searchVsResearchComparison={comparisonData.searchVsResearchComparison}
                  userSourceContent={comparisonData.userSourceContent || investigation.userSourceContent || undefined}
                  webSearchSummary={comparisonData.webSearchSummary || comparisonData.externalSourcesSummary}
                  deepResearchSummary={comparisonData.deepResearchSummary}
                />
              );
            })()}
          </section>
        ) : (
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              Cross-Check
            </h3>
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No cross-check data available for this investigation.</p>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* DD Analysis (Visuals) */}
        {visualData ? (
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              DD Analysis
            </h3>
            <Card>
              <CardContent className="p-4">
                <Visualization data={visualData} />
              </CardContent>
            </Card>
          </section>
        ) : (
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              DD Analysis
            </h3>
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No visualization data available for this investigation.</p>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Evolution Graph */}
        {graphData ? (
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">4</span>
              Evolution Graph
            </h3>
            <Card className="overflow-hidden">
              <div className="h-[500px] relative">
                <EvolutionGraph nodes={graphData.nodes || []} edges={graphData.edges || []} />
              </div>
            </Card>
          </section>
        ) : (
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">4</span>
              Evolution Graph
            </h3>
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No evolution graph data available for this investigation.</p>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Text Report */}
        {summary && summary !== 'Investigation completed' ? (
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">5</span>
              Text Report
            </h3>
            <Card>
              <CardContent className="p-6">
                <MessageResponse>
                  {summary}
                </MessageResponse>
              </CardContent>
            </Card>
          </section>
        ) : (
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">5</span>
              Text Report
            </h3>
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No detailed text report available for this investigation.</p>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Citations */}
        {citations.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">6</span>
              Citations
            </h3>
            <div className="grid gap-3">
              {citations.map((citation: any, idx: number) => (
                <Card key={idx} className="overflow-hidden">
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium leading-tight mb-1 truncate">
                          {citation.title || 'Untitled Source'}
                        </h4>
                        {citation.url && (
                          <a href={citation.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 truncate">
                            <LinkIcon className="size-3" />
                            {citation.url}
                          </a>
                        )}
                      </div>
                    </div>
                    {citation.text && (
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mt-2">
                        {citation.text}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

