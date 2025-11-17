'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { ToolUIPart } from 'ai';
import { useState, useRef, useMemo } from 'react';
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
} from '@/components/ai-elements/prompt-input';
import { Loader } from '@/components/ai-elements/loader';
import { ToolOutput } from '@/components/ai-elements/tool';
import { Visualization } from '@/components/ai-elements/visualization';
import { AI_CONFIG } from '@/lib/ai/config';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchIcon, Sparkles, ChevronRight, ChevronDown, ExternalLink, Building2 } from 'lucide-react';

type TimelineEntry = {
  id: string;
  kind: 'user' | 'assistant' | 'tool';
  title: string;
  body: string;
  toolName?: string;
  state?: ToolUIPart['state'];
  toolPart?: ToolUIPart;
};

type InvestigationResult = {
  id: string;
  title: string;
  summary: string;
  visual?: Record<string, unknown> | null;
  structuredData?: Record<string, unknown> | null;
};

function InvestigatePageContent() {
  const [selectedModel, setSelectedModel] = useState<string>(
    AI_CONFIG.defaultModel,
  );
  const [expandedToolIds, setExpandedToolIds] = useState<Record<string, boolean>>({});
  const [mockMode, setMockMode] = useState(false);
  const [mockMessages, setMockMessages] = useState<any[]>([]);

  const selectedModelRef = useRef(selectedModel);
  selectedModelRef.current = selectedModel;

  const { messages, status, sendMessage, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/investigate',
      body: () => ({
        model: selectedModelRef.current,
      }),
    }),
  });

  const activeMessages = mockMode ? mockMessages : messages;
  const timelineEntries = useMemo(() => buildTimelineEntries(activeMessages), [activeMessages]);
  const investigationResults = useMemo(() => buildInvestigationResults(activeMessages), [activeMessages]);

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text?.trim()) return;
    if (mockMode) {
      generateMockData(message.text);
    } else {
      sendMessage({ text: message.text });
    }
  };

  const generateMockData = (query: string) => {
    const mockData = createMockInvestigationData(query);
    setMockMessages(mockData);
  };

  const toggleToolEntry = (id: string) => {
    setExpandedToolIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isInvestigating = mockMode ? false : status === 'streaming';

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
          <h1 className="text-2xl font-semibold">Investigation Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor investigation progress and analyze results.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Investigation progress and tool execution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {timelineEntries.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  <SearchIcon className="size-5" />
                  <p>Provide initial context to start the investigation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {timelineEntries.map((entry, index) => (
                      <TimelineCard
                        key={entry.id}
                        entry={entry}
                        index={index}
                      expanded={entry.kind === 'tool' && !!expandedToolIds[entry.id]}
                      onToggle={() => entry.kind === 'tool' && toggleToolEntry(entry.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
              <CardHeader>
              <CardTitle>Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Badge variant={mockMode ? 'default' : 'outline'} className="text-xs">
                  {mockMode ? 'Mock Mode' : 'Live Mode'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMockMode(!mockMode);
                    if (mockMode) {
                      setMockMessages([]);
                    }
                  }}
                >
                  {mockMode ? 'Switch to Live' : 'Use Mock Data'}
                </Button>
                  </div>
                  <PromptInput onSubmit={handleSubmit}>
                <PromptInputTextarea placeholder="Enter your investigation query..." />
                    <PromptInputFooter>
                      <PromptInputTools>
                    <PromptInputSelect value={selectedModel} onValueChange={setSelectedModel}>
                          <PromptInputSelectTrigger className="w-48">
                            <PromptInputSelectValue />
                          </PromptInputSelectTrigger>
                          <PromptInputSelectContent>
                            {AI_CONFIG.availableModels.map((model) => (
                          <PromptInputSelectItem key={model.value} value={model.value}>
                                {model.name}
                              </PromptInputSelectItem>
                            ))}
                          </PromptInputSelectContent>
                        </PromptInputSelect>
                      </PromptInputTools>
                  <PromptInputSubmit status={mockMode ? undefined : status} />
                    </PromptInputFooter>
                  </PromptInput>
              {error && !mockMode && (
                <div className="text-sm text-destructive">{error.message || 'An error occurred'}</div>
              )}
            {isInvestigating && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader size={14} />
                  Investigation in progress...
              </div>
            )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Analysis results and insights</CardDescription>
          </CardHeader>
          <CardContent>
            {investigationResults.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                <Sparkles className="size-5" />
                <p>Results will appear here as the investigation progresses</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {investigationResults.map((result) => (
                  <div
                    key={result.id}
                    className={`rounded-lg border p-4 ${
                      result.visual || result.structuredData ? 'md:col-span-2' : ''
                    }`}
                  >
                    <h3 className="font-medium mb-2">{result.title}</h3>
                    {result.summary && (
                      <p className="text-sm text-muted-foreground mb-3">{result.summary}</p>
                    )}
                    {result.visual && (
                      <Visualization data={result.visual} />
                    )}
                    {result.structuredData && (
                      <StructuredDataDisplay data={result.structuredData} />
                    )}
              </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StructuredDataDisplay({ data }: { data: Record<string, unknown> }) {
  // Handle company research results
  if (data.companyName && Array.isArray(data.results)) {
    const results = data.results as Array<{
      title?: string;
      url?: string;
      text?: string;
      publishedDate?: string | null;
    }>;
    
    return (
      <div className="space-y-4 mt-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Building2 className="size-4 text-muted-foreground" />
          <h4 className="font-semibold text-sm">{data.companyName as string}</h4>
              </div>
        <div className="space-y-3">
          {results.map((result, index) => (
            <div key={index} className="rounded-lg border p-3 bg-muted/30">
              {result.title && (
                <h5 className="font-medium text-sm mb-1">{result.title}</h5>
              )}
              {result.url && (
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1 mb-2"
                >
                  <ExternalLink className="size-3" />
                  {result.url.replace(/^https?:\/\//, '').split('/')[0]}
                </a>
              )}
              {result.text && (
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {result.text.replace(/\[.*?\]\(.*?\)/g, '').trim()}
                </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

  // Handle other structured data - render as formatted JSON
  return (
    <div className="mt-4 rounded-lg border p-4 bg-muted/30">
      <pre className="text-xs overflow-auto max-h-96">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function TimelineCard({
  entry,
  index,
  expanded,
  onToggle,
}: {
  entry: TimelineEntry;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
          <div>
          <Badge variant={entry.kind === 'tool' ? 'default' : 'outline'} className="text-xs">
            {entry.kind === 'tool' ? 'Tool' : entry.kind === 'user' ? 'User' : 'Assistant'}
          </Badge>
          <h4 className="font-medium mt-2">{entry.title}</h4>
          </div>
        <span className="text-xs text-muted-foreground">#{index + 1}</span>
        </div>
      {entry.body && <p className="text-sm text-muted-foreground mb-3">{entry.body}</p>}
      {entry.kind === 'tool' && (
          <div>
          <Button variant="ghost" size="sm" onClick={onToggle} className="gap-1">
            {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            {expanded ? 'Hide' : 'Show'} output
          </Button>
          {expanded && entry.toolPart && (
            <div className="mt-3 rounded border p-3 bg-muted/30">
              <ToolOutput output={entry.toolPart.output} errorText={entry.toolPart.errorText} />
          </div>
          )}
        </div>
      )}
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
      if (parts.length === 0) return;

      parts.forEach((part: { type: string; text?: string } | ToolUIPart, partIndex: number) => {
        if (part.type === 'text' && 'text' in part && part.text?.trim()) {
          entries.push({
            id: `${message.id ?? messageIndex}-text-${partIndex}`,
            kind: message.role === 'user' ? 'user' : 'assistant',
            title: message.role === 'user' ? 'User query' : 'Response',
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
  if (!toolPart.output) return null;

  const id = `${(toolPart as any).call_id ?? (toolPart as any).toolCallId ?? toolPart.type ?? 'tool'}-result-${insightIndex}`;
  const parsed = safeParseJSON(toolPart.output);

  if (parsed && typeof parsed === 'object') {
    // Check if this is a visualization result
    if ((parsed as { type?: string }).type === 'investigation_visualization') {
      const visualization = parsed as {
        title?: string;
        summary?: string;
        initialContent?: Record<string, unknown>;
        exaResults?: Record<string, unknown> & { summary?: string };
        comparison?: Record<string, unknown>;
      };
      return {
        id,
        title: visualization.title ?? `Visualization ${insightIndex}`,
        summary: visualization.exaResults?.summary || visualization.summary || '',
        visual: parsed as Record<string, unknown>,
      };
    }

    // Check if this is structured research data (e.g., company research)
    if ((parsed as { companyName?: string }).companyName && Array.isArray((parsed as { results?: unknown }).results)) {
      return {
        id,
        title: `Research: ${(parsed as { companyName: string }).companyName}`,
        summary: `Found ${((parsed as { results: unknown[] }).results || []).length} result(s)`,
        structuredData: parsed as Record<string, unknown>,
      };
    }

    // Check for other structured data patterns
    if (Array.isArray((parsed as { results?: unknown }).results) || 
        (parsed as { data?: unknown }).data ||
        (parsed as { items?: unknown }).items) {
      const title = (parsed as { title?: string }).title || 
                    (parsed as { name?: string }).name ||
                    `Insight ${insightIndex}`;
      const summary = (parsed as { summary?: string }).summary ||
                      (parsed as { description?: string }).description ||
                      'Structured research data';
      return {
        id,
        title,
        summary: summarizeText(summary, 200),
        structuredData: parsed as Record<string, unknown>,
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
  if (!input) return 'Awaiting context';
  if (typeof input === 'string') return createSnippet(input, 200);
  if (typeof input === 'object') {
    const segments = Object.entries(input)
      .slice(0, 2)
      .map(([key, value]) => {
        if (typeof value === 'string') return `${key}: ${createSnippet(value, 80)}`;
        if (typeof value === 'number') return `${key}: ${value}`;
        return `${key}: data`;
      });
    return segments.join(' • ') || 'Structured input';
  }
  return 'Structured input';
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

function createMockInvestigationData(query: string): any[] {
  const timestamp = Date.now();
  
  return [
    {
      id: `mock-user-${timestamp}`,
      role: 'user',
      content: query,
      parts: [{ type: 'text', text: query }],
    },
    {
      id: `mock-assistant-${timestamp}`,
      role: 'assistant',
      content: 'Starting investigation...',
      parts: [
        {
          type: 'text',
          text: 'I\'ve analyzed the provided content and conducted research. Here are my findings:',
        },
        {
          type: 'tool-get_company_info',
          toolCallId: `mock-tool-1-${timestamp}`,
          state: 'output-available',
          input: { companyName: 'Cursor AI' },
          output: JSON.stringify({
            companyName: 'Cursor AI',
            results: [
              {
                title: 'AI startup Cursor raises $2.3 billion round at $29.3 billion valuation',
                url: 'https://www.cnbc.com/2025/11/13/cursor-ai-startup-funding-round-valuation.html',
                text: 'Cursor AI, an AI-powered code editor startup, has raised a massive $2.3 billion funding round, valuing the company at $29.3 billion. The round was led by major venture capital firms...',
              },
              {
                title: 'Cursor AI: The Future of AI-Assisted Development',
                url: 'https://techcrunch.com/cursor-ai-development',
                text: 'Cursor AI is revolutionizing software development with its AI-powered coding assistant. The platform helps developers write code faster and more efficiently...',
              },
            ],
          }),
        },
        {
          type: 'tool-analyze_sentiment_political',
          toolCallId: `mock-tool-2-${timestamp}`,
          state: 'output-available',
          input: { text: query },
          output: JSON.stringify({
            sentiment: {
              classification: 'positive',
              confidence: 0.85,
              reasoning: 'The content shows positive sentiment towards technological advancement.',
            },
            politicalLeaning: {
              classification: 'center',
              confidence: 0.72,
              reasoning: 'Neutral political stance, focused on business and technology.',
            },
          }),
        },
        {
          type: 'tool-generate_visualization',
          toolCallId: `mock-tool-3-${timestamp}`,
          state: 'output-available',
          input: {},
          output: JSON.stringify({
            type: 'investigation_visualization',
            initialContent: {
              sentiment: {
                classification: 'positive',
                confidence: 0.85,
              },
              politicalLeaning: {
                classification: 'center',
                confidence: 0.72,
              },
            },
            exaResults: {
              sentiment: {
                classification: 'positive',
                confidence: 0.88,
              },
              politicalLeaning: {
                classification: 'center',
                confidence: 0.75,
              },
              summary: 'Analysis shows consistent positive sentiment across sources.',
              citations: [
                {
                  title: 'CNBC Article',
                  url: 'https://www.cnbc.com/example',
                },
              ],
            },
            comparison: {
              sentimentDiff: {
                match: true,
              },
              politicalDiff: {
                match: true,
              },
            },
          }),
        },
        {
          type: 'text',
          text: 'Investigation complete. All analyses have been performed and results are available above.',
        },
      ],
    },
  ];
}

