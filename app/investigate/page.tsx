'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { ToolUIPart } from 'ai';
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  PromptInput,
  PromptInputProvider,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  type PromptInputMessage,
  usePromptInputController,
} from '@/components/ai-elements/prompt-input';
import { Loader } from '@/components/ai-elements/loader';
import {
  LinkPreview,
  LinkPreviewLoading,
  LinkPreviewError,
  type LinkPreviewData,
} from '@/components/link-preview';
import { LinkChip } from '@/components/link-chip';
import { ToolOutput } from '@/components/ai-elements/tool';
import { AI_CONFIG } from '@/lib/ai/config';
import { detectInputType } from '@/lib/ai/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  SearchIcon,
  Radar,
  ClipboardList,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Layers,
  CircleDot,
  AlertTriangle,
  BarChart3,
  Shield,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

type TimelineEntry = {
  id: string;
  kind: 'user' | 'assistant' | 'tool';
  title: string;
  body: string;
  snippet?: string | null;
  toolName?: string;
  state?: ToolUIPart['state'];
  toolPart?: ToolUIPart;
};

type InvestigationResult = {
  id: string;
  title: string;
  summary: string;
  visual?: {
    initialContent?: Record<string, unknown> | null;
    exaResults?: Record<string, unknown> | null;
    comparison?: Record<string, unknown> | null;
  };
  citations?: Array<Record<string, unknown>>;
};

function InvestigatePageContent() {
  const [selectedModel, setSelectedModel] = useState<string>(
    AI_CONFIG.defaultModel,
  );
  const [linkPreview, setLinkPreview] = useState<LinkPreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [detectedLinks, setDetectedLinks] = useState<string[]>([]);
  const [hoveredUrl, setHoveredUrl] = useState<string | null>(null);
  const [expandedToolIds, setExpandedToolIds] = useState<Record<string, boolean>>(
    {},
  );

  const selectedModelRef = useRef(selectedModel);
  selectedModelRef.current = selectedModel;

  const { textInput } = usePromptInputController();
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hidePreviewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { messages, status, sendMessage, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/investigate',
      body: () => ({
        model: selectedModelRef.current,
      }),
    }),
  });

  const timelineEntries = useMemo(
    () => buildTimelineEntries(messages),
    [messages],
  );
  const investigationResults = useMemo(
    () => buildInvestigationResults(messages),
    [messages],
  );
  const currentModel =
    AI_CONFIG.availableModels.find((model) => model.value === selectedModel) ??
    AI_CONFIG.availableModels[0];

  const fetchPreview = useCallback(async (url: string) => {
    setPreviewLoading(true);
    setPreviewError(null);

    try {
      const response = await fetch('/api/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch preview');
      }

      const data = await response.json();
      setLinkPreview(data);
    } catch (err) {
      setPreviewError(
        err instanceof Error ? err.message : 'Failed to load preview',
      );
      setLinkPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const handleLinkHover = useCallback(
    (url: string) => {
      setHoveredUrl(url);
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
      if (hidePreviewTimeoutRef.current) {
        clearTimeout(hidePreviewTimeoutRef.current);
      }
      previewTimeoutRef.current = setTimeout(() => {
        fetchPreview(url);
      }, 300);
    },
    [fetchPreview],
  );

  const handleLinkLeave = useCallback(() => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    if (hidePreviewTimeoutRef.current) {
      clearTimeout(hidePreviewTimeoutRef.current);
    }
    hidePreviewTimeoutRef.current = setTimeout(() => {
      setHoveredUrl(null);
      setLinkPreview(null);
      setPreviewError(null);
    }, 200);
  }, []);

  useEffect(() => {
    const text = textInput.value.trim();

    if (!text) {
      setDetectedLinks([]);
      if (!hoveredUrl) {
        setLinkPreview(null);
        setPreviewError(null);
      }
      return;
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);

    if (matches && matches.length > 0) {
      const supportedLinks = matches.filter((url) => {
        const detection = detectInputType(url);
        return detection.type === 'twitter' || detection.type === 'tiktok';
      });

      setDetectedLinks(supportedLinks);
    } else {
      setDetectedLinks([]);
      if (!hoveredUrl) {
        setLinkPreview(null);
        setPreviewError(null);
      }
    }
  }, [textInput.value, hoveredUrl]);

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text?.trim()) {
      return;
    }

    setLinkPreview(null);
    setPreviewError(null);
    setHoveredUrl(null);
    setDetectedLinks([]);

    sendMessage({
      text: message.text,
    });
  };

  const toggleToolEntry = useCallback((id: string) => {
    setExpandedToolIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const isInvestigating = status === 'streaming';

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Badge variant="secondary" className="gap-1">
              <Radar className="size-3.5" />
              Active Investigation
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Investigation Dashboard
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Monitor investigation progress, review tool execution, and analyze results.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 rounded-2xl border bg-card/80 p-4 shadow-sm md:w-auto">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge
                variant={isInvestigating ? 'default' : 'outline'}
                className="gap-2"
              >
                {isInvestigating ? (
                  <Loader size={12} />
                ) : (
                  <CircleDot className="size-3" />
                )}
                {isInvestigating ? 'Investigating' : 'Standing by'}
              </Badge>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Model</p>
              <p className="text-base font-medium">{currentModel.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <Card className="border-border/70 bg-card/80">
            <CardHeader>
              <div>
                <CardTitle>Investigation Timeline</CardTitle>
                <CardDescription>
                  Step-by-step tracking of investigation progress and tool execution.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {timelineEntries.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-10 text-center text-sm text-muted-foreground">
                  <SearchIcon className="size-6 text-muted-foreground/70" />
                  <p>
                    Provide initial context to start the investigation workflow.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {timelineEntries.map((entry, index) => {
                    const isLast = index === timelineEntries.length - 1;
                    const expanded =
                      entry.kind === 'tool' && expandedToolIds[entry.id];
                    return (
                      <TimelineCard
                        key={entry.id}
                        entry={entry}
                        index={index}
                        isLast={isLast}
                        expanded={!!expanded}
                        onToggle={() => {
                          if (entry.kind === 'tool') {
                            toggleToolEntry(entry.id);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="border-border/70 bg-card/80">
              <CardHeader>
                <CardTitle>Investigation Controls</CardTitle>
                <CardDescription>
                  Enter queries, select models, and preview detected links.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {detectedLinks.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-border/80 bg-muted/20 p-3">
                    {detectedLinks.map((url, index) => (
                      <LinkChip
                        key={`${url}-${index}`}
                        url={url}
                        onHover={handleLinkHover}
                        onLeave={handleLinkLeave}
                      />
                    ))}
                  </div>
                )}

                {hoveredUrl && (
                  <div
                    className="rounded-2xl border border-border/70 bg-background/90 p-4"
                    onMouseEnter={() => {
                      if (hidePreviewTimeoutRef.current) {
                        clearTimeout(hidePreviewTimeoutRef.current);
                      }
                    }}
                    onMouseLeave={handleLinkLeave}
                  >
                    {previewLoading && <LinkPreviewLoading />}
                    {previewError && (
                      <LinkPreviewError
                        error={previewError}
                        onClose={() => {
                          setPreviewError(null);
                          setLinkPreview(null);
                          setHoveredUrl(null);
                        }}
                      />
                    )}
                    {linkPreview && !previewLoading && (
                      <LinkPreview
                        data={linkPreview}
                        onClose={() => {
                          setLinkPreview(null);
                          setPreviewError(null);
                          setHoveredUrl(null);
                        }}
                      />
                    )}
                  </div>
                )}

                <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                  <PromptInput onSubmit={handleSubmit}>
                    <PromptInputTextarea
                      placeholder="Outline the objective, targets, and signals to trace..."
                      className="min-h-[72px]"
                    />
                    <PromptInputFooter>
                      <PromptInputTools>
                        <PromptInputSelect
                          value={selectedModel}
                          onValueChange={setSelectedModel}
                        >
                          <PromptInputSelectTrigger className="w-48">
                            <PromptInputSelectValue />
                          </PromptInputSelectTrigger>
                          <PromptInputSelectContent>
                            {AI_CONFIG.availableModels.map((model) => (
                              <PromptInputSelectItem
                                key={model.value}
                                value={model.value}
                              >
                                {model.name}
                              </PromptInputSelectItem>
                            ))}
                          </PromptInputSelectContent>
                        </PromptInputSelect>
                      </PromptInputTools>
                      <PromptInputSubmit status={status} />
                    </PromptInputFooter>
                  </PromptInput>
                  {error && (
                    <div className="mt-2 text-sm text-destructive">
                      {error.message || 'An error occurred'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {isInvestigating && (
              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                <Loader size={14} />
                Investigation in progress. Results will appear below as they become available.
              </div>
            )}
          </div>
        </div>

        <Card className="border-border/70 bg-card/80">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Investigation Results</CardTitle>
                <CardDescription>
                  Analysis results and insights from the investigation.
                </CardDescription>
              </div>
              <Badge variant="outline" className="gap-1 text-xs">
                <Layers className="size-3.5" />
                {investigationResults.length} insight
                {investigationResults.length === 1 ? '' : 's'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {investigationResults.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-10 text-center text-sm text-muted-foreground">
                <Sparkles className="size-6 text-muted-foreground/70" />
                <p>
                  Results will appear here as the investigation progresses.
                </p>
              </div>
            ) : (
              <InvestigationInsights results={investigationResults} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function TimelineCard({
  entry,
  index,
  isLast,
  expanded,
  onToggle,
}: {
  entry: TimelineEntry;
  index: number;
  isLast: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const badgeConfig =
    entry.kind === 'tool'
      ? {
          label: 'Tool execution',
          variant: 'default' as const,
        }
      : entry.kind === 'user'
        ? {
            label: 'User query',
            variant: 'outline' as const,
          }
        : {
            label: 'System response',
            variant: 'secondary' as const,
          };

  const stateLabel = entry.state
    ? formatToolState(entry.state)
    : entry.kind === 'tool'
      ? 'In queue'
      : null;

  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'mt-1 size-3 rounded-full border-2',
            entry.kind === 'tool'
              ? 'border-primary bg-primary/20'
              : entry.kind === 'assistant'
                ? 'border-blue-500/60 bg-blue-500/10'
                : 'border-muted-foreground bg-muted/60',
          )}
        />
        {!isLast && <div className="mt-1 h-full w-px bg-border" />}
      </div>
      <div className="flex-1 rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase text-muted-foreground">
              Step {String(index + 1).padStart(2, '0')}
            </p>
            <p className="text-base font-semibold capitalize tracking-tight">
              {entry.title}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <Badge variant={badgeConfig.variant}>{badgeConfig.label}</Badge>
            {stateLabel && (
              <span className="text-xs text-muted-foreground">{stateLabel}</span>
            )}
          </div>
        </div>
        {entry.body && (
          <p className="mt-3 text-sm text-muted-foreground">{entry.body}</p>
        )}
        {entry.kind === 'tool' && (
          <div className="mt-4 space-y-3 text-sm">
            {entry.snippet && (
              <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-3 text-muted-foreground">
                <span className="font-medium text-foreground">Content snippet:</span>{' '}
                {entry.snippet}
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Output access
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={onToggle}
              >
                {expanded ? (
                  <>
                    <ChevronDown className="size-4" />
                    Hide output
                  </>
                ) : (
                  <>
                    <ChevronRight className="size-4" />
                    Reveal output
                  </>
                )}
              </Button>
            </div>
            {expanded && entry.toolPart && (
              <div className="rounded-xl border border-border/80 bg-muted/30 p-4">
                <ToolOutput
                  output={entry.toolPart.output}
                  errorText={entry.toolPart.errorText}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InvestigationInsights({
  results,
}: {
  results: InvestigationResult[];
}) {
  // Find the visualization result
  const visualizationResult = results.find((r) => r.visual);
  const visual = visualizationResult?.visual;

  if (!visual) {
    // Fallback to simple grid if no visualization
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {results.map((result) => (
          <div
            key={result.id}
            className="flex h-full flex-col justify-between rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <ClipboardList className="size-3.5" />
                {result.title}
              </div>
              <p className="text-base font-medium leading-relaxed text-foreground">
                {result.summary}
              </p>
            </div>
            {result.citations && result.citations.length > 0 && (
              <div className="mt-4 text-xs text-muted-foreground">
                Sources:{' '}
                {result.citations
                  .slice(0, 3)
                  .map((citation) => {
                    const title =
                      (citation?.title as string | undefined)?.trim();
                    const url =
                      (citation?.url as string | undefined)?.replace(
                        /^https?:\/\//,
                        '',
                      );
                    return title || url || 'External source';
                  })
                  .join(', ')}
                {result.citations.length > 3
                  ? ` +${result.citations.length - 3}`
                  : ''}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Extract data from visualization
  const initialSentiment = visual.initialContent?.sentiment as
    | { classification?: string; confidence?: number; reasoning?: string }
    | undefined;
  const exaSentiment = visual.exaResults?.sentiment as
    | { classification?: string; confidence?: number; reasoning?: string }
    | undefined;
  const initialPolitical = visual.initialContent?.politicalLeaning as
    | { classification?: string; confidence?: number; reasoning?: string }
    | undefined;
  const exaPolitical = visual.exaResults?.politicalLeaning as
    | { classification?: string; confidence?: number; reasoning?: string }
    | undefined;
  const comparison = visual.comparison as
    | {
        sentimentDiff?: { match?: boolean };
        politicalDiff?: { match?: boolean };
      }
    | undefined;
  const citations = visualizationResult?.citations || [];
  const summary = (visual.exaResults as { summary?: string })?.summary || '';

  // Calculate confidence (average of sentiment confidences)
  const confidence =
    initialSentiment?.confidence && exaSentiment?.confidence
      ? Math.round(
          ((initialSentiment.confidence + exaSentiment.confidence) / 2) * 100,
        )
      : initialSentiment?.confidence
        ? Math.round(initialSentiment.confidence * 100)
        : exaSentiment?.confidence
          ? Math.round(exaSentiment.confidence * 100)
          : 80;

  // Determine verification status
  const sentimentMatch = comparison?.sentimentDiff?.match ?? false;
  const politicalMatch = comparison?.politicalDiff?.match ?? false;
  const verificationStatus = sentimentMatch && politicalMatch ? 'verified' : 'exaggerated';
  const statusMeaning =
    verificationStatus === 'verified'
      ? 'Content aligns with verified sources and evidence.'
      : 'Based on some truth, but overstates or sensationalizes the facts beyond what evidence supports.';
  const reasoning =
    initialSentiment?.reasoning ||
    exaSentiment?.reasoning ||
    'Analysis based on sentiment and political leaning comparison.';

  // Calculate sentiment percentages based on confidence scores
  const sentimentClassification = exaSentiment?.classification || 'neutral';
  const sentimentConfidence = exaSentiment?.confidence || 0.5;
  
  // Calculate percentages - use confidence for primary sentiment, distribute remainder
  const primaryPercent = Math.round(sentimentConfidence * 100);
  const remainder = 100 - primaryPercent;
  
  const sentimentPercentages = {
    positive: sentimentClassification === 'positive' ? primaryPercent : sentimentClassification === 'neutral' ? Math.floor(remainder / 2) : 0,
    negative: sentimentClassification === 'negative' ? primaryPercent : sentimentClassification === 'neutral' ? Math.floor(remainder / 2) : 0,
    neutral: sentimentClassification === 'neutral' ? primaryPercent : Math.floor(remainder / 2),
    mixed: 0,
  };
  
  // Ensure total is 100%
  const total = sentimentPercentages.positive + sentimentPercentages.negative + sentimentPercentages.neutral + sentimentPercentages.mixed;
  if (total !== 100) {
    const diff = 100 - total;
    if (sentimentClassification === 'positive') {
      sentimentPercentages.positive += diff;
    } else if (sentimentClassification === 'negative') {
      sentimentPercentages.negative += diff;
    } else {
      sentimentPercentages.neutral += diff;
    }
  }

  // Political bias
  const politicalClassification = exaPolitical?.classification || 'center';
  const politicalPosition =
    politicalClassification === 'left'
      ? 'Opposition'
      : politicalClassification === 'right'
        ? 'Pro-Government'
        : 'Neutral';

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Verification Status Card */}
      <VerificationStatusCard
        status={verificationStatus}
        statusMeaning={statusMeaning}
        reasoning={reasoning}
        confidence={confidence}
      />

      {/* Analysis Metrics Card */}
      <AnalysisMetricsCard confidence={confidence} sources={citations.length} />

      {/* Sentiment-Verdict Consistency Card */}
      <SentimentVerdictCard
        sentiment={sentimentClassification}
        percentages={sentimentPercentages}
        match={sentimentMatch}
      />

      {/* Political Bias Analysis Card */}
      <PoliticalBiasCard
        classification={politicalClassification}
        position={politicalPosition}
        match={politicalMatch}
      />
    </div>
  );
}

function VerificationStatusCard({
  status,
  statusMeaning,
  reasoning,
  confidence,
}: {
  status: string;
  statusMeaning: string;
  reasoning: string;
  confidence: number;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-amber-500" />
          <h3 className="text-sm font-semibold">Verification Status</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {status === 'exaggerated' ? '▲ Exaggerated Claims' : '✓ Verified'}
        </Badge>
      </div>
      <div className="space-y-3 text-sm">
        <div>
          <p className="font-medium text-foreground mb-1">Status Meaning:</p>
          <p className="text-muted-foreground">{statusMeaning}</p>
        </div>
        <div>
          <p className="font-medium text-foreground mb-1">Reasoning:</p>
          <p className="text-muted-foreground">{reasoning}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Confidence</span>
            <span className="font-medium">{confidence}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisMetricsCard({
  confidence,
  sources,
}: {
  confidence: number;
  sources: number;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm cursor-pointer hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Analysis Metrics</h3>
        </div>
        <ArrowRight className="size-4 text-muted-foreground" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-muted/50 p-2">
            <TrendingUp className="size-4" />
          </div>
          <div>
            <p className="text-2xl font-semibold">{confidence}%</p>
            <p className="text-xs text-muted-foreground">Confidence</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-muted/50 p-2">
            <Shield className="size-4" />
          </div>
          <div>
            <p className="text-2xl font-semibold">{sources}</p>
            <p className="text-xs text-muted-foreground">Sources</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Click to view detailed metrics and source credibility
        </p>
      </div>
    </div>
  );
}

function SentimentVerdictCard({
  sentiment,
  percentages,
  match,
}: {
  sentiment: string;
  percentages: { positive: number; negative: number; neutral: number; mixed: number };
  match: boolean;
}) {
  const intensity = percentages.negative > 50 ? 'High intensity' : 'Low intensity';
  const sentimentLabel =
    sentiment === 'positive'
      ? 'Positive'
      : sentiment === 'negative'
        ? 'Negative'
        : 'Neutral';
  const matchPercent = match ? 63 : 37;

  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm cursor-pointer hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Sentiment-Verdict Consistency</h3>
        </div>
        <ArrowRight className="size-4 text-muted-foreground" />
      </div>
      <div className="space-y-4 text-sm">
        <div>
          <p className="text-muted-foreground mb-1">
            {sentimentLabel} ({percentages.negative || percentages.positive || percentages.neutral}%) • {intensity} • High {sentiment === 'negative' ? 'negative' : sentiment === 'positive' ? 'positive' : 'neutral'} sentiment
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Pattern Match</span>
            <span className="text-xs font-medium">{matchPercent}%</span>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Sentiment Breakdown</p>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs">Positive</span>
                <span className="text-xs">{percentages.positive}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${percentages.positive}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs">Negative</span>
                <span className="text-xs">{percentages.negative}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-red-500"
                  style={{ width: `${percentages.negative}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs">Neutral</span>
                <span className="text-xs">{percentages.neutral}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gray-400"
                  style={{ width: `${percentages.neutral}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs">Mixed</span>
                <span className="text-xs">{percentages.mixed}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${percentages.mixed}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PoliticalBiasCard({
  classification,
  position,
  match,
}: {
  classification: string;
  position: string;
  match: boolean;
}) {
  // Calculate position on meter (0-100)
  const meterPosition =
    classification === 'left'
      ? 20
      : classification === 'right'
        ? 80
        : 50;

  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm cursor-pointer hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Political Bias Analysis</h3>
        </div>
        <ArrowRight className="size-4 text-muted-foreground" />
      </div>
      <div className="space-y-4 text-sm">
        <p className="text-muted-foreground">Analysis of political leaning in all news</p>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Assessment</p>
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              position === 'Pro-Government' && 'text-green-600 border-green-600',
            )}
          >
            {position}
          </Badge>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2">Political Bias Meter</p>
          <div className="relative">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${meterPosition}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
              <span>Opposition</span>
              <span>Neutral</span>
              <span>Pro-Government</span>
            </div>
            <div
              className="absolute top-0 h-2 w-1 bg-foreground -translate-x-1/2"
              style={{ left: `${meterPosition}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InvestigatePage() {
  return (
    <PromptInputProvider>
      <InvestigatePageContent />
    </PromptInputProvider>
  );
}

export default InvestigatePage;

function buildTimelineEntries(messages: Array<any>): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  messages
    .filter((message) => message.role !== 'system')
    .forEach((message, messageIndex) => {
      const parts = extractMessageParts(message);

      if (parts.length === 0) {
        return;
      }

      parts.forEach((part: { type: string; text?: string } | ToolUIPart, partIndex: number) => {
        if (part.type === 'text' && 'text' in part && part.text?.trim()) {
          entries.push({
            id: `${message.id ?? messageIndex}-text-${partIndex}`,
            kind: message.role === 'user' ? 'user' : 'assistant',
            title: message.role === 'user' ? 'User query' : 'System response',
            body: summarizeText(part.text),
          });
          return;
        }

        if (typeof part.type === 'string' && part.type.startsWith('tool-')) {
          const toolPart = part as ToolUIPart;
          const toolName = part.type.replace('tool-', '');
          entries.push({
            id: `${message.id ?? messageIndex}-${toolName}-${partIndex}`,
            kind: 'tool',
            title: toolName.replace(/_/g, ' '),
            body: summarizeToolInput(toolPart.input),
            snippet: summarizeToolSnippet(toolPart.input),
            toolName,
            state: toolPart.state,
            toolPart,
          });
        }
      });
    });

  return entries;
}

function buildInvestigationResults(messages: Array<any>): InvestigationResult[] {
  const results: InvestigationResult[] = [];
  let insightCounter = 1;

  messages
    .filter((message) => message.role === 'assistant')
    .forEach((message, messageIndex) => {
      const parts = extractMessageParts(message);
      parts.forEach((part: { type: string; text?: string } | ToolUIPart, partIndex: number) => {
        if (part.type === 'text' && 'text' in part && part.text?.trim()) {
          results.push({
            id: `${message.id ?? messageIndex}-insight-${partIndex}`,
            title: `Insight ${insightCounter++}`,
            summary: summarizeText(part.text, 360),
          });
          return;
        }

        if (typeof part.type === 'string' && part.type.startsWith('tool-')) {
          const parsed = parseToolOutputForResult(part as ToolUIPart, insightCounter);
          if (parsed) {
            results.push(parsed);
            insightCounter++;
          }
        }
      });
    });

  return results;
}

function parseToolOutputForResult(
  toolPart: ToolUIPart,
  insightIndex: number,
): InvestigationResult | null {
  if (!toolPart.output) {
    return null;
  }

  const id = `${(toolPart as any).call_id ?? (toolPart as any).toolCallId ?? toolPart.type ?? 'tool'}-result-${insightIndex}`;
  const parsed = safeParseJSON(toolPart.output);

  if (parsed && typeof parsed === 'object') {
    if ((parsed as { type?: string }).type === 'investigation_visualization') {
      const visualization = parsed as {
        title?: string;
        summary?: string;
        initialContent?: Record<string, unknown>;
        exaResults?: Record<string, unknown> & { summary?: string; citations?: Array<Record<string, unknown>> };
        comparison?: Record<string, unknown>;
      };
      return {
        id,
        title: visualization.title ?? `Visualization ${insightIndex}`,
        summary:
          visualization.exaResults?.summary ??
          visualization.summary ??
          'Comparative visualization ready for review.',
        visual: {
          initialContent: visualization.initialContent,
          exaResults: visualization.exaResults,
          comparison: visualization.comparison,
        },
        citations: visualization.exaResults?.citations,
      };
    }

    const descriptiveText =
      (parsed as { summary?: string }).summary ||
      (parsed as { result?: string }).result ||
      (parsed as { insight?: string }).insight ||
      (parsed as { description?: string }).description;

    if (descriptiveText) {
      return {
        id,
        title: (parsed as { title?: string }).title ?? `Insight ${insightIndex}`,
        summary: summarizeText(descriptiveText, 360),
      };
    }
  }

  if (typeof toolPart.output === 'string') {
    return {
      id,
      title: `Insight ${insightIndex}`,
      summary: summarizeText(toolPart.output, 360),
    };
  }

  return null;
}

function summarizeText(text: string, maxLength = 240) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return '';
  }
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  let summary = '';
  for (const sentence of sentences) {
    if (!sentence) continue;
    const tentative = summary ? `${summary} ${sentence}` : sentence;
    if (tentative.length > maxLength) {
      break;
    }
    summary = tentative;
  }
  if (!summary) {
    summary = cleaned.slice(0, maxLength);
  }
  return `${summary.trim()}…`;
}

function summarizeToolInput(input: ToolUIPart['input']) {
  if (!input) {
    return 'Awaiting structured context.';
  }
  if (typeof input === 'string') {
    return createSnippet(input, 220);
  }
  if (typeof input === 'object') {
    const segments = Object.entries(input)
      .slice(0, 3)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}: ${createSnippet(value, 90)}`;
        }
        if (typeof value === 'number') {
          return `${key}: ${value}`;
        }
        return `${key}: structured data`;
      });
    return segments.join(' • ') || 'Structured input received.';
  }
  return 'Structured input received.';
}

function summarizeToolSnippet(input: ToolUIPart['input']) {
  if (!input) {
    return null;
  }
  if (typeof input === 'string') {
    return createSnippet(input, 140);
  }
  if (typeof input === 'object') {
    const firstText = Object.values(input).find(
      (value) => typeof value === 'string' && value.trim().length > 0,
    );
    if (typeof firstText === 'string') {
      return createSnippet(firstText, 140);
    }
  }
  return null;
}

function createSnippet(text: string, maxLength: number) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return '';
  }
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return `${cleaned.slice(0, maxLength)}…`;
}

function extractMessageParts(message: any) {
  if (Array.isArray(message.parts)) {
    return message.parts;
  }
  if (typeof message.content === 'string' && message.content.trim()) {
    return [{ type: 'text', text: message.content }];
  }
  return [];
}

function safeParseJSON(payload: unknown) {
  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    if (!trimmed) {
      return null;
    }
    try {
      return JSON.parse(trimmed);
    } catch {
      return null;
    }
  }
  if (typeof payload === 'object' && payload !== null) {
    return payload;
  }
  return null;
}

function formatToolState(state: ToolUIPart['state']) {
  switch (state) {
    case 'input-streaming':
      return 'Processing';
    case 'input-available':
      return 'Running';
    case 'output-available':
      return 'Ready for review';
    case 'output-error':
      return 'Errored';
    default:
      return 'Processing';
  }
}
