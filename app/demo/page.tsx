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
  PromptInputAttachments,
  PromptInputAttachment,
  usePromptInputAttachments,
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
  BookOpen,
  FileText,
  Database,
  Scale,
  Clock,
  TrendingUp,
  Newspaper,
  ImageIcon,
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

interface RelatedArticle {
  url: string;
  title: string;
  source: string;
  relevance: string;
}

interface PrimarySource {
  url: string;
  title: string;
  type: string;
  description: string;
}

interface FurtherReading {
  relatedArticles: RelatedArticle[];
  primarySources: PrimarySource[];
}

interface SourceReport {
  source: string;
  url: string;
  reportedAs: string;
  agreesWithOriginal: boolean;
}

interface FactComparison {
  fact: string;
  sourceReports: SourceReport[];
  consensusLevel: string;
}

interface SourceConsistency {
  overallConsistency: string;
  consistencyScore: number;
  factComparisons: FactComparison[];
  summary: string;
}

interface TimelineEvent {
  date: string;
  event: string;
  source: string;
  url: string;
  significance: string;
}

interface StoryEvolution {
  timeline: TimelineEvent[];
  originDate: string;
  latestUpdate: string;
  evolutionSummary: string;
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
  furtherReading?: FurtherReading;
  sourceConsistency?: SourceConsistency;
  storyEvolution?: StoryEvolution;
}

interface ApiResponse {
  success: boolean;
  data: ApiData;
  metadata: {
    model: string;
    articleLength: number;
    claimsAnalyzed: number;
    sourcesFound: number;
    furtherReadingSourcesFound?: number;
    consistencyScore?: number;
    timelineSpan?: string;
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

// Image upload button component that uses PromptInput's attachment system
function ImageUploadButton({ disabled }: { disabled?: boolean }) {
  const attachments = usePromptInputAttachments();
  const hasImage = attachments.files.some(f => f.mediaType?.startsWith('image/'));
  
  return (
    <button
      type="button"
      onClick={() => attachments.openFileDialog()}
      disabled={disabled}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors disabled:opacity-50"
    >
      <ImageIcon className="size-4" />
      <span>{hasImage ? 'Change' : 'Image'}</span>
    </button>
  );
}

export default function DemoPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [collapsedClaims, setCollapsedClaims] = useState<Set<number>>(new Set());

  const handleSubmit = async ({ text, files }: { text: string; files?: Array<{ url?: string; mediaType?: string }> }) => {
    // Check for image files from PromptInput's built-in attachment system
    const imageFile = files?.find(f => f.mediaType?.startsWith('image/') && f.url);
    
    // Allow submission with just image, just text, or both
    if (!text.trim() && !imageFile) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const requestBody: { content?: string; imageBase64?: string; imageCaption?: string } = {};
      
      if (text.trim()) {
        requestBody.content = text;
      }
      
      // Use image from PromptInput's attachment system (already converted to data URL)
      if (imageFile?.url) {
        requestBody.imageBase64 = imageFile.url;
        if (text.trim()) {
          requestBody.imageCaption = text;
        }
      }
      
      const response = await fetch('/api/investigate-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Analysis failed. Please try again.');
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

  const getConsistencyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
      case 'unanimous':
        return 'text-green-500 border-green-500/50 bg-green-500/10';
      case 'medium':
      case 'majority':
        return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
      default:
        return 'text-red-500 border-red-500/50 bg-red-500/10';
    }
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance.toLowerCase()) {
      case 'breaking':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'development':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'update':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'follow_up':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSourceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'government_doc':
        return <FileText className="size-4" />;
      case 'data_source':
        return <Database className="size-4" />;
      default:
        return <BookOpen className="size-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
            Verify text, tweets, TikToks, or images for bias and accuracy
          </p>
        </div>

        {/* Input */}
        <div className="mb-8">
          <PromptInput
            onSubmit={handleSubmit}
            className="rounded-xl border-border/50"
            accept="image/*"
          >
            {/* Show attached images */}
            <PromptInputAttachments className="px-3 pt-3">
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            
            <PromptInputTextarea 
              placeholder="Paste text, X.com link, TikTok link, or upload an image..."
              className="min-h-24"
              disabled={loading}
            />
            <PromptInputFooter>
              <div className="flex items-center gap-2">
                {/* Image upload button using PromptInput's attachment system */}
                <ImageUploadButton disabled={loading} />
                <span className="text-xs text-muted-foreground">
                  {loading && 'Investigating...'}
                </span>
              </div>
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
            {(result.metadata.sourceUrl || result.metadata.sourceAuthor || result.metadata.sourcePlatform || result.metadata.inputType === 'image') && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 size-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      {result.metadata.inputType === 'image' ? (
                        <ImageIcon className="size-5 text-primary" />
                      ) : (
                        <Link2 className="size-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                          {result.metadata.inputType === 'image' ? 'Analyzing Image' : 'Analyzing Content From'}
                        </span>
                        {result.metadata.sourcePlatform && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {result.metadata.sourcePlatform}
                          </Badge>
                        )}
                        {result.metadata.inputType && (
                          <Badge variant="outline" className="text-xs capitalize bg-primary/10">
                            {result.metadata.inputType}
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
                        result.metadata.inputType === 'image' ? (
                          <a
                            href={result.metadata.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img 
                              src={result.metadata.sourceUrl} 
                              alt="Analyzed image" 
                              className="max-h-48 rounded-lg border border-border/50 object-contain hover:opacity-90 transition-opacity"
                            />
                          </a>
                        ) : (
                          <a
                            href={result.metadata.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline group"
                          >
                            <span className="truncate max-w-md">{result.metadata.sourceUrl}</span>
                            <ExternalLink className="size-3.5 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </a>
                        )
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

            {/* Source Consistency */}
            {result.data.sourceConsistency && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Scale className="size-4" />
                      Source Consistency
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className={`${getConsistencyColor(result.data.sourceConsistency.overallConsistency)} text-xs font-bold`}
                    >
                      {result.data.sourceConsistency.consistencyScore}% Consistent
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result.data.sourceConsistency.summary}
                  </p>
                  
                  {result.data.sourceConsistency.factComparisons.length > 0 && (
                    <div className="space-y-3">
                      {result.data.sourceConsistency.factComparisons.map((comparison, idx) => (
                        <div key={idx} className="border border-border/50 rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium flex-1">{comparison.fact}</p>
                            <Badge 
                              variant="outline" 
                              className={`${getConsistencyColor(comparison.consensusLevel)} text-xs capitalize shrink-0`}
                            >
                              {comparison.consensusLevel}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            {comparison.sourceReports.map((report, reportIdx) => (
                              <a
                                key={reportIdx}
                                href={report.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-3 p-2.5 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors group"
                              >
                                <div className={`shrink-0 size-6 rounded-full flex items-center justify-center ${
                                  report.agreesWithOriginal 
                                    ? 'bg-green-500/20 text-green-500' 
                                    : 'bg-red-500/20 text-red-500'
                                }`}>
                                  {report.agreesWithOriginal ? (
                                    <CheckCircle2 className="size-3.5" />
                                  ) : (
                                    <XCircle className="size-3.5" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                                    {report.source}
                                  </p>
                                  <p className="text-sm leading-relaxed line-clamp-2">
                                    {report.reportedAs}
                                  </p>
                                </div>
                                <ExternalLink className="size-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Story Evolution Diagram */}
            {result.data.storyEvolution && result.data.storyEvolution.timeline.length > 0 && (
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Clock className="size-4" />
                      Story Evolution
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      {/* Legend */}
                      <div className="hidden sm:flex items-center gap-2 text-[10px]">
                        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-red-500" /> Breaking</span>
                        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-blue-500" /> Development</span>
                        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-yellow-500" /> Update</span>
                        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-purple-500" /> Follow-up</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result.data.storyEvolution.evolutionSummary}
                  </p>
                  
                  {/* Horizontal Timeline Diagram */}
                  <div className="relative pt-2 pb-4">
                    {/* Main horizontal line */}
                    <div className="absolute left-0 right-0 top-[42px] h-1 bg-gradient-to-r from-muted via-border to-muted rounded-full" />
                    
                    {/* Timeline nodes */}
                    <div className="relative flex justify-between items-start gap-2 overflow-x-auto pb-2">
                      {result.data.storyEvolution.timeline.map((event, idx) => {
                        const isFirst = idx === 0;
                        const isLast = idx === result.data.storyEvolution!.timeline.length - 1;
                        const significanceColor = event.significance === 'breaking' 
                          ? 'bg-red-500 shadow-red-500/40' 
                          : event.significance === 'development'
                          ? 'bg-blue-500 shadow-blue-500/40'
                          : event.significance === 'update'
                          ? 'bg-yellow-500 shadow-yellow-500/40'
                          : 'bg-purple-500 shadow-purple-500/40';
                        
                        return (
                          <div 
                            key={idx} 
                            className={`flex flex-col items-center min-w-[120px] flex-1 ${
                              isFirst ? 'items-start' : isLast ? 'items-end' : 'items-center'
                            }`}
                          >
                            {/* Date label */}
                            <span className="text-[10px] font-mono text-muted-foreground mb-2 whitespace-nowrap">
                              {formatDate(event.date)}
                            </span>
                            
                            {/* Node */}
                            <a
                              href={event.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative"
                            >
                              <div className={`size-5 rounded-full ${significanceColor} shadow-lg ring-4 ring-background transition-transform group-hover:scale-125`} />
                              
                              {/* Connector line down */}
                              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-border" />
                            </a>
                            
                            {/* Event card */}
                            <a
                              href={event.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`mt-6 p-3 rounded-lg border border-border/50 bg-card hover:border-primary/50 hover:bg-accent/50 transition-all group max-w-[160px] ${
                                isFirst ? 'text-left' : isLast ? 'text-right' : 'text-center'
                              }`}
                            >
                              <Badge 
                                variant="outline" 
                                className={`${getSignificanceColor(event.significance)} text-[9px] uppercase tracking-wider mb-2`}
                              >
                                {event.significance.replace('_', ' ')}
                              </Badge>
                              <p className="text-xs font-medium leading-snug line-clamp-3 group-hover:text-primary transition-colors">
                                {event.event}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1 justify-center">
                                <span>{event.source}</span>
                                <ExternalLink className="size-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </p>
                            </a>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Start/End markers */}
                    <div className="flex justify-between mt-2 text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <div className="size-1.5 rounded-full bg-muted-foreground/40" />
                        Origin
                      </span>
                      <span className="flex items-center gap-1">
                        Latest
                        <div className="size-1.5 rounded-full bg-primary" />
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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

            {/* Further Reading */}
            {result.data.furtherReading && (
              (result.data.furtherReading.relatedArticles.length > 0 || 
               result.data.furtherReading.primarySources.length > 0) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                    <BookOpen className="size-4" />
                    Further Reading
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Related Articles */}
                  {result.data.furtherReading.relatedArticles.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Newspaper className="size-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                          Related Articles
                        </span>
                      </div>
                      <div className="grid gap-2">
                        {result.data.furtherReading.relatedArticles.map((article, idx) => (
                          <a
                            key={idx}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-accent/40 transition-all group"
                          >
                            <div className="shrink-0 size-9 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <ExternalLink className="size-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <p className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                                {article.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-medium">{article.source}</span>
                                <span className="text-muted-foreground/50">•</span>
                                <span className="line-clamp-1">{article.relevance}</span>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Primary Sources */}
                  {result.data.furtherReading.primarySources.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                          Primary Sources
                        </span>
                      </div>
                      <div className="grid gap-2">
                        {result.data.furtherReading.primarySources.map((source, idx) => (
                          <a
                            key={idx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group"
                          >
                            <div className="shrink-0 size-9 rounded-md bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors text-blue-500">
                              {getSourceTypeIcon(source.type)}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm group-hover:text-blue-500 transition-colors line-clamp-1">
                                  {source.title}
                                </p>
                                <Badge variant="outline" className="text-[10px] uppercase tracking-wider shrink-0">
                                  {source.type.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {source.description}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

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
              <Badge variant="outline" className="cursor-default text-xs font-normal flex items-center gap-1">
                <ImageIcon className="size-3" />
                Upload an image
              </Badge>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
