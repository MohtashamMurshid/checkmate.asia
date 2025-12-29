'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader } from '@/components/ai-elements/loader';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from '@/components/ai-elements/prompt-input';
  import { 
    AlertCircle, 
    CheckCircle2, 
    AlertTriangle, 
    ExternalLink, 
    ChevronRight,
    XCircle,
    HelpCircle,
    Link2,
    User,
  } from 'lucide-react';

interface Source {
  url: string;
  title: string;
  excerpt: string;
}

interface FactualClaim {
  claim: string;
  assessment: string;
  sources: Source[];
  reasoning: string;
}

interface CheckmateVerification {
  verdict: string;
  score: number;
  confidence: string;
  reasoning: string;
}

interface ApiData {
  overallBias: string;
  biasScore: number;
  sentiment: string;
  sentimentScore: number;
  emotionalLanguage: string[];
  factualClaims: FactualClaim[];
  summary: string;
  recommendations: string[];
  checkmateVerification: CheckmateVerification;
}

interface ApiResponse {
  success: boolean;
  data: ApiData;
  metadata: {
    model: string;
    articleLength: number;
    claimsAnalyzed: number;
    sourcesFound: number;
    timestamp: string;
    usage: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      cost: number;
    };
    inputType: string;
    sourceUrl?: string;
    sourceAuthor?: string;
    sourcePlatform?: string;
  };
}

export default function DemoPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [collapsedClaims, setCollapsedClaims] = useState<Set<number>>(new Set());

  const handleSubmit = async ({ text }: { text: string }) => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/investigate-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError('Analysis failed. Please try again.');
      }
    } catch {
      setError('Failed to connect. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case 'trustworthy':
      case 'verified':
        return 'text-green-500 border-green-500/50 bg-green-500/10';
      case 'questionable':
      case 'needs verification':
        return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
      default:
        return 'text-red-500 border-red-500/50 bg-red-500/10';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case 'trustworthy':
      case 'verified':
        return <CheckCircle2 className="size-4" />;
      case 'questionable':
      case 'needs verification':
        return <AlertTriangle className="size-4" />;
      default:
        return <AlertCircle className="size-4" />;
    }
  };

  const getAssessmentColor = (assessment: string) => {
    switch (assessment.toLowerCase()) {
      case 'true':
      case 'verified':
        return 'border-green-500/50 bg-green-500/10 text-green-400';
      case 'misleading':
      case 'questionable':
        return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400';
      default:
        return 'border-red-500/50 bg-red-500/10 text-red-400';
    }
  };

  const getAssessmentIcon = (assessment: string) => {
    switch (assessment.toLowerCase()) {
      case 'true':
      case 'verified':
        return <CheckCircle2 className="size-5" />;
      case 'misleading':
      case 'questionable':
        return <AlertTriangle className="size-5" />;
      case 'false':
        return <XCircle className="size-5" />;
      default:
        return <HelpCircle className="size-5" />;
    }
  };

  const getAssessmentBorderClass = (assessment: string) => {
    switch (assessment.toLowerCase()) {
      case 'true':
      case 'verified':
        return 'border-l-4 border-l-green-500';
      case 'misleading':
      case 'questionable':
        return 'border-l-4 border-l-yellow-500';
      default:
        return 'border-l-4 border-l-red-500';
    }
  };

  const getBiasPosition = (score: number) => ((score + 1) / 2) * 100;

  return (
    <div className="min-h-screen bg-background">
      <main className={`container mx-auto px-4 transition-all duration-500 ${
        !result && !loading ? 'py-32 max-w-2xl' : 'py-16 max-w-3xl'
      }`}>
        {/* Minimal Hero */}
        <div className={`text-center space-y-3 transition-all duration-500 ${
          !result && !loading ? 'mb-12' : 'mb-10'
        }`}>
          <h1 className={`font-semibold tracking-tight transition-all duration-500 ${
            !result && !loading ? 'text-5xl' : 'text-3xl'
          }`}>
            Checkmate
          </h1>
          <p className={`text-muted-foreground transition-all duration-500 ${
            !result && !loading ? 'text-base' : 'text-sm'
          }`}>
            Verify text, tweets, or TikToks for bias and accuracy
          </p>
        </div>

        {/* Input */}
        <div className="mb-8">
          <PromptInput
            onSubmit={handleSubmit}
            className="rounded-xl border-border/50"
          >
            <PromptInputTextarea 
              placeholder="Paste text, X.com link, or TikTok link..."
              className="min-h-24"
              disabled={loading}
            />
            <PromptInputFooter>
              <span className="text-xs text-muted-foreground">
                {loading && 'Investigating...'}
              </span>
              <PromptInputSubmit disabled={loading}>
                {loading ? <Loader className="size-4" /> : null}
              </PromptInputSubmit>
            </PromptInputFooter>
          </PromptInput>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 rounded-lg border border-destructive/50 bg-destructive/5 flex items-center gap-3">
            <AlertCircle className="size-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            {/* Analysis message */}
            <div className="text-center space-y-3 py-8">
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-2">
                <Loader className="size-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Analyzing Content</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Our AI is investigating claims, checking sources, and analyzing bias patterns...
              </p>
            </div>

            {/* Skeleton cards */}
            <div className="space-y-4">
              {/* Score skeleton */}
              <Card className="overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-8">
                    <div className="relative size-28 shrink-0 rounded-full bg-muted/50 animate-pulse" />
                    <div className="flex-1 space-y-3">
                      <div className="h-6 w-32 bg-muted/50 rounded animate-pulse" />
                      <div className="h-4 w-full bg-muted/30 rounded animate-pulse" />
                      <div className="h-4 w-3/4 bg-muted/30 rounded animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Metrics skeleton */}
              <Card className="overflow-hidden">
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <div className="h-3 w-24 bg-muted/50 rounded animate-pulse" />
                      <div className="h-3 w-20 bg-muted/50 rounded animate-pulse" />
                    </div>
                    <div className="h-3 bg-muted/30 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <div className="h-3 w-24 bg-muted/50 rounded animate-pulse" />
                      <div className="h-3 w-20 bg-muted/50 rounded animate-pulse" />
                    </div>
                    <div className="h-3 bg-muted/30 rounded-full animate-pulse" />
                  </div>
                </CardContent>
              </Card>

              {/* Summary skeleton */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="h-4 w-24 bg-muted/50 rounded animate-pulse" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-4 w-full bg-muted/30 rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted/30 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-muted/30 rounded animate-pulse" />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            {/* Source Attribution */}
            {(result.metadata.sourceUrl || result.metadata.sourceAuthor || result.metadata.sourcePlatform) && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 size-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Link2 className="size-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                          Analyzing Content From
                        </span>
                        {result.metadata.sourcePlatform && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {result.metadata.sourcePlatform}
                          </Badge>
                        )}
                      </div>
                      
                      {result.metadata.sourceAuthor && (
                        <div className="flex items-center gap-2">
                          <User className="size-4 text-muted-foreground" />
                          <span className="font-semibold">@{result.metadata.sourceAuthor}</span>
                        </div>
                      )}
                      
                      {result.metadata.sourceUrl && (
                        <a
                          href={result.metadata.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-primary hover:underline group"
                        >
                          <span className="truncate max-w-md">{result.metadata.sourceUrl}</span>
                          <ExternalLink className="size-3.5 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Score */}
             <Card>
               <CardContent className="pt-6">
                 <div className="flex items-center gap-8">
                   <div className="relative size-28 shrink-0">
                     <svg className="size-28 -rotate-90" viewBox="0 0 120 120">
                       <circle
                         cx="60" cy="60" r="50"
                         fill="none" stroke="currentColor" strokeWidth="10"
                         className="text-muted/20"
                       />
                       <circle
                         cx="60" cy="60" r="50"
                         fill="none" stroke="currentColor" strokeWidth="10"
                         strokeDasharray={`${2 * Math.PI * 50}`}
                         strokeDashoffset={`${2 * Math.PI * 50 * (1 - result.data.checkmateVerification.score / 100)}`}
                         className={
                           result.data.checkmateVerification.score >= 70
                             ? 'text-green-500'
                             : result.data.checkmateVerification.score >= 40
                             ? 'text-yellow-500'
                             : 'text-red-500'
                         }
                         strokeLinecap="round"
                       />
                     </svg>
                     <div className="absolute inset-0 flex items-center justify-center flex-col">
                       <span className="text-3xl font-bold tracking-tight">
                         {result.data.checkmateVerification.score}
                       </span>
                       <span className="text-[10px] text-muted-foreground font-medium">SCORE</span>
                     </div>
                   </div>

                   <div className="flex-1 space-y-3">
                     <div>
                       <Badge 
                         variant="outline" 
                         className={`${getVerdictColor(result.data.checkmateVerification.verdict)} gap-1.5 text-sm px-3 py-1`}
                       >
                         {getVerdictIcon(result.data.checkmateVerification.verdict)}
                         <span className="font-semibold uppercase tracking-wide">
                           {result.data.checkmateVerification.verdict}
                         </span>
                       </Badge>
                     </div>
                     <p className="text-sm text-muted-foreground leading-relaxed">
                       {result.data.checkmateVerification.reasoning}
                     </p>
                     <p className="text-xs text-muted-foreground/70">
                       Confidence: <span className="font-semibold capitalize text-foreground/80">{result.data.checkmateVerification.confidence}</span>
                     </p>
                   </div>
                 </div>
               </CardContent>
             </Card>

             {/* Bias & Sentiment */}
             <Card>
               <CardContent className="pt-6 space-y-6">
                 <div className="space-y-3">
                   <div className="flex justify-between items-baseline">
                     <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Political Bias</span>
                     <span className="text-base font-semibold capitalize">{result.data.overallBias}</span>
                   </div>
                   <div className="relative h-3 bg-gradient-to-r from-blue-500 via-gray-400 to-red-500 rounded-full">
                     <div 
                       className="absolute top-1/2 -translate-y-1/2 size-4 bg-foreground rounded-full border-2 border-background shadow-lg"
                       style={{ left: `${getBiasPosition(result.data.biasScore)}%` }}
                     />
                   </div>
                   <div className="flex justify-between text-[10px] text-muted-foreground/60 font-medium">
                     <span>LEFT</span>
                     <span>CENTER</span>
                     <span>RIGHT</span>
                   </div>
                 </div>

                 <div className="space-y-3">
                   <div className="flex justify-between items-baseline">
                     <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Sentiment</span>
                     <span className="text-base font-semibold capitalize">{result.data.sentiment}</span>
                   </div>
                   <Progress value={((result.data.sentimentScore + 1) / 2) * 100} className="h-3" />
                   <div className="flex justify-between text-[10px] text-muted-foreground/60 font-medium">
                     <span>NEGATIVE</span>
                     <span>NEUTRAL</span>
                     <span>POSITIVE</span>
                   </div>
                 </div>

                 {result.data.emotionalLanguage.length > 0 && (
                   <div className="pt-2 space-y-2">
                     <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Emotional Phrases</span>
                     <div className="flex flex-wrap gap-1.5">
                       {result.data.emotionalLanguage.slice(0, 4).map((phrase, idx) => (
                         <Badge key={idx} variant="secondary" className="text-xs font-normal">
                           {phrase}
                         </Badge>
                       ))}
                       {result.data.emotionalLanguage.length > 4 && (
                         <Badge variant="secondary" className="text-xs font-medium">
                           +{result.data.emotionalLanguage.length - 4}
                         </Badge>
                       )}
                     </div>
                   </div>
                 )}
               </CardContent>
             </Card>

             {/* Summary */}
             <Card>
               <CardHeader className="pb-3">
                 <CardTitle className="text-base font-semibold uppercase tracking-wide text-muted-foreground">Summary</CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-[15px] leading-relaxed font-medium">
                   {result.data.summary}
                 </p>
               </CardContent>
             </Card>

             {/* Claims */}
             {result.data.factualClaims.length > 0 && (
               <Card>
                 <CardHeader className="pb-3">
                   <CardTitle className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
                     Claims Analysis ({result.data.factualClaims.length})
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   {result.data.factualClaims.map((claim, idx) => (
                     <div 
                       key={idx} 
                       className={`border border-border/50 rounded-lg overflow-hidden ${getAssessmentBorderClass(claim.assessment)}`}
                     >
                       <button
                         onClick={() => {
                           setCollapsedClaims(prev => {
                             const next = new Set(prev);
                             if (next.has(idx)) {
                               next.delete(idx);
                             } else {
                               next.add(idx);
                             }
                             return next;
                           });
                         }}
                         className="w-full px-4 py-4 flex items-start gap-4 hover:bg-accent/30 transition-colors text-left group"
                       >
                         <div className={`shrink-0 ${getAssessmentColor(claim.assessment)} rounded-lg p-2`}>
                           {getAssessmentIcon(claim.assessment)}
                         </div>
                         
                         <div className="flex-1 min-w-0 space-y-2">
                           <div className="flex items-start gap-2">
                             <Badge 
                               variant="outline" 
                               className={`${getAssessmentColor(claim.assessment)} text-xs capitalize shrink-0 font-bold px-2.5 py-0.5`}
                             >
                               {claim.assessment}
                             </Badge>
                           </div>
                           <p className="text-sm font-medium leading-relaxed">{claim.claim}</p>
                         </div>

                         <ChevronRight 
                           className={`size-5 text-muted-foreground transition-transform shrink-0 mt-1 group-hover:text-primary ${
                             !collapsedClaims.has(idx) ? 'rotate-90' : ''
                           }`}
                         />
                       </button>

                       {!collapsedClaims.has(idx) && (
                         <div className="px-4 py-4 border-t border-border/50 bg-muted/20 space-y-4">
                           <div className="space-y-2">
                             <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                               Analysis
                             </p>
                             <p className="text-sm leading-relaxed">{claim.reasoning}</p>
                           </div>
                           
                           {claim.sources.length > 0 && (
                             <div className="space-y-2">
                               <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                                 Sources ({claim.sources.length})
                               </p>
                               <div className="space-y-2">
                                 {claim.sources.map((source, sourceIdx) => (
                                   <a
                                     key={sourceIdx}
                                     href={source.url}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-accent/40 transition-all group/source"
                                   >
                                     <div className="shrink-0 size-8 rounded-md bg-primary/10 flex items-center justify-center group-hover/source:bg-primary/20 transition-colors">
                                       <ExternalLink className="size-4 text-primary" />
                                     </div>
                                     <div className="flex-1 min-w-0 space-y-1">
                                       <p className="font-medium text-sm group-hover/source:text-primary transition-colors line-clamp-1">
                                         {source.title}
                                       </p>
                                       <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                         {source.excerpt}
                                       </p>
                                     </div>
                                   </a>
                                 ))}
                               </div>
                             </div>
                           )}
                         </div>
                       )}
                     </div>
                   ))}
                 </CardContent>
               </Card>
             )}

             {/* Recommendations */}
             {result.data.recommendations.length > 0 && (
               <Card>
                 <CardHeader className="pb-3">
                   <CardTitle className="text-base font-semibold uppercase tracking-wide text-muted-foreground">Recommendations</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <ul className="space-y-2">
                     {result.data.recommendations.map((rec, idx) => (
                       <li key={idx} className="flex items-start gap-2.5 text-sm">
                         <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                         <span className="leading-relaxed">{rec}</span>
                       </li>
                     ))}
                   </ul>
                 </CardContent>
               </Card>
             )}
          </div>
        )}

        {/* Example prompts when no result */}
        {!result && !loading && (
          <div className="mt-12 text-center">
            <p className="text-xs text-muted-foreground mb-4">Try something like:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="cursor-default text-xs font-normal">
                The earth is flat
              </Badge>
              <Badge variant="outline" className="cursor-default text-xs font-normal">
                tiktok.com/@user/video/123
              </Badge>
              <Badge variant="outline" className="cursor-default text-xs font-normal">
                x.com/user/status/123
              </Badge>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
