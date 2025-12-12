'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { ToolUIPart } from 'ai';
import { useState, useRef, useMemo, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
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
import { Textarea } from '@/components/ui/textarea';
import { EvolutionGraph } from '@/components/ai-elements/evolution-graph';
import { SourceComparison, CredibilityBadge } from '@/components/ai-elements/investigation-ui';
import { AI_CONFIG } from '@/lib/ai/config';
import { Loader } from '@/components/ai-elements/loader';
import { ToolOutput, getToolDisplayName, getToolIcon } from '@/components/ai-elements/tool';
import { Visualization } from '@/components/ai-elements/visualization';
import { MessageResponse } from '@/components/ai-elements/message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  ExternalLink, 
  LayoutTemplate,
  PanelRightClose,
  PanelRightOpen,
  Settings2,
  PieChart,
  FileText,
  Layers,
  Check,
  Loader2,
  Bot,
  Link as LinkIcon,
  Search,
  RefreshCw,
  Info,
  CircleDashed
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LinkPreview } from '@/components/link-preview';
import { analyzeSourceAction } from '@/app/actions';

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
  graphData?: { nodes: any[]; edges: any[] } | null;
  comparisonData?: any | null;
  credibilityData?: any | null;
  citations?: any[] | null;
  timestamp: number;
};

function InvestigatePageContent() {
  const [selectedModel, setSelectedModel] = useState<string>(
    AI_CONFIG.defaultModel,
  );
  const [expandedToolIds, setExpandedToolIds] = useState<Record<string, boolean>>({});
  const [mockMode, setMockMode] = useState(false);
  const [mockMessages, setMockMessages] = useState<any[]>([]);
  const [personalSource, setPersonalSource] = useState('');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number>(0);
  const [previewMetadata, setPreviewMetadata] = useState<{
    type: 'twitter' | 'tiktok' | null;
    url: string;
    content: string;
    metadata: Record<string, any>;
  } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const fetchedUrlRef = useRef<string | null>(null);

  const saveInvestigation = useMutation(api.investigations.save);

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

  const hasStarted = activeMessages.length > 0;

  // Aggregate all citations from all results
  const allCitations = useMemo(() => {
    const citationMap = new Map();
    investigationResults.forEach(result => {
      if (result.citations && Array.isArray(result.citations)) {
        result.citations.forEach(citation => {
          if (citation.url && !citationMap.has(citation.url)) {
             citationMap.set(citation.url, citation);
          }
        });
      }
      // Also extract from structured data results if they have urls
      if (result.structuredData && Array.isArray((result.structuredData as any).results)) {
         (result.structuredData as any).results.forEach((item: any) => {
            if (item.url && !citationMap.has(item.url)) {
              citationMap.set(item.url, {
                 title: item.title,
                 url: item.url,
                 text: item.text || item.snippet
              });
            }
         });
      }
    });
    return Array.from(citationMap.values());
  }, [investigationResults]);

  // Auto-save when investigation completes
  useEffect(() => {
    if (status !== 'streaming' && investigationResults.length > 0) {
      const latestTimestamp = Math.max(...investigationResults.map(r => r.timestamp));
      if (latestTimestamp > lastSavedTimestamp) {
        // Find all relevant results
        const latestResult = investigationResults[0]; // Most recent
        const crossCheckResult = investigationResults.find(r => r.comparisonData);
        const visualResult = investigationResults.find(r => r.visual);
        const graphResult = investigationResults.find(r => r.graphData);
        
        // Find user query
        const userQuery = activeMessages.find(m => m.role === 'user')?.content || 'Investigation';
        
        // Extract text report from assistant messages
        const assistantMessages = activeMessages
          .filter(m => m.role === 'assistant')
          .map(m => {
            let text = '';
            if (m.parts) {
              const textPart = m.parts.find((p: any) => p.type === 'text' && p.text);
              text = textPart?.text || '';
            } else if (typeof m.content === 'string') {
              text = m.content;
            }
            return { text, length: text.trim().length };
          })
          .filter(m => m.length > 100)
          .sort((a, b) => b.length - a.length);
        
        const textReport = assistantMessages.length > 0 ? assistantMessages[0].text.trim() : null;

        // Build comprehensive results object with all data
        const comprehensiveResults = {
          ...latestResult,
          // Ensure comparisonData is included if it exists in any result
          comparisonData: crossCheckResult?.comparisonData || latestResult.comparisonData || null,
          // Ensure visual is included
          visual: visualResult?.visual || latestResult.visual || null,
          // Ensure graphData is included
          graphData: graphResult?.graphData || latestResult.graphData || null,
          // Include text report
          summary: textReport || latestResult.summary || 'Investigation completed',
          // Include citations from all results
          citations: latestResult.citations || [],
        };

        console.log('[CROSS-CHECK] Saving investigation to database');
        console.log('[CROSS-CHECK] Comprehensive results structure:', {
          hasComparisonData: !!comprehensiveResults.comparisonData,
          comparisonDataKeys: comprehensiveResults.comparisonData ? Object.keys(comprehensiveResults.comparisonData) : [],
          hasVisual: !!comprehensiveResults.visual,
          hasGraphData: !!comprehensiveResults.graphData,
          hasSummary: !!comprehensiveResults.summary,
          citationsCount: comprehensiveResults.citations?.length || 0,
        });
        
        if (comprehensiveResults.comparisonData) {
          console.log('[CROSS-CHECK] Comparison data being saved:', JSON.stringify(comprehensiveResults.comparisonData, null, 2));
        }

        const saveData = async () => {
          try {
            await saveInvestigation({
              userQuery: userQuery.slice(0, 1000), // Limit length
              userSourceContent: personalSource || undefined,
              results: comprehensiveResults, // Save comprehensive results with all data
              graphData: comprehensiveResults.graphData || undefined,
              timestamp: Date.now(),
            });
            setLastSavedTimestamp(Date.now());
            console.log('[CROSS-CHECK] Investigation saved successfully');
          } catch (err) {
            console.error('[CROSS-CHECK] Failed to save investigation:', err);
          }
        };
        
        saveData();
      }
    }
  }, [status, investigationResults, lastSavedTimestamp, activeMessages, personalSource, saveInvestigation]);

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text?.trim()) return;
    
    let fullQuery = message.text;
    if (personalSource.trim()) {
      fullQuery = `Personal Source Context:\n${personalSource}\n\nInvestigation Query:\n${message.text}`;
    }

    if (mockMode) {
      generateMockData(fullQuery);
    } else {
      sendMessage({ text: fullQuery });
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

  // Extract URL from user input and fetch preview metadata (only once per URL)
  // Use useMemo to extract URL once, then useEffect to fetch only when URL changes
  const extractedUrl = useMemo(() => {
    // Skip if we have personalSource (it's text, not a URL)
    if (personalSource.trim()) {
      return null;
    }

    // Extract URL from first user message only
    const firstUserMessage = activeMessages.find(m => m.role === 'user');
    if (!firstUserMessage) {
      return null;
    }

    const userText = firstUserMessage.parts?.find((p: any) => p.type === 'text')?.text || 
                     (typeof firstUserMessage.content === 'string' ? firstUserMessage.content : '');
    
    if (!userText || userText.includes('Personal Source Context:')) {
      return null;
    }

    // Extract clean query
    const cleanQuery = userText.split('Investigation Query:')[1]?.trim() || userText;
    
    // Check if it's a URL (Twitter or TikTok)
    const urlPattern = /(https?:\/\/[^\s]+)/;
    const urlMatch = cleanQuery.match(urlPattern);
    
    if (urlMatch) {
      const url = urlMatch[1];
      // Check if it's Twitter or TikTok
      if (url.includes('twitter.com') || url.includes('x.com') || url.includes('tiktok.com')) {
        return url;
      }
    }
    
    return null;
  }, [
    // Only recompute when first user message changes (by ID) or personalSource changes
    activeMessages.find(m => m.role === 'user')?.id,
    personalSource
  ]);

  // Fetch preview metadata only when extractedUrl changes
  useEffect(() => {
    // Skip if we've already fetched metadata for this URL
    if (extractedUrl === fetchedUrlRef.current) {
      return;
    }

    // Clear metadata if no URL
    if (!extractedUrl) {
      if (fetchedUrlRef.current !== null) {
        fetchedUrlRef.current = null;
        setPreviewMetadata(null);
      }
      return;
    }

    // Fetch metadata for new URL
    const fetchPreviewMetadata = async () => {
      fetchedUrlRef.current = extractedUrl;
      setIsLoadingPreview(true);
      try {
        const response = await fetch('/api/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: extractedUrl }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.error) {
            console.error('Preview API error:', data.error);
            setPreviewMetadata(null);
            fetchedUrlRef.current = null;
          } else {
            setPreviewMetadata(data);
          }
        } else {
          setPreviewMetadata(null);
          fetchedUrlRef.current = null;
        }
      } catch (error) {
        console.error('Failed to fetch preview metadata:', error);
        setPreviewMetadata(null);
        fetchedUrlRef.current = null;
      } finally {
        setIsLoadingPreview(false);
      }
    };

    fetchPreviewMetadata();
  }, [extractedUrl]); // Only depend on extractedUrl

  // Extract extracted content from server (for Source & Preview)
  // The content is included in the system prompt, so we need to extract it from the first message
  // For now, we'll extract it from the user's input by detecting if it's a URL or use personalSource
  const extractedSourceContent = useMemo(() => {
    // If we have preview metadata, use that
    if (previewMetadata) {
      return {
        content: previewMetadata.content,
        sourceType: previewMetadata.type || 'text',
        metadata: previewMetadata.metadata,
        url: previewMetadata.url,
      };
    }

    // If we have personalSource, use that as the extracted content
    if (personalSource.trim()) {
      return {
        content: personalSource,
        sourceType: 'text',
        metadata: {},
      };
    }
    
    // Otherwise, try to extract from the first user message
    const firstUserMessage = activeMessages.find(m => m.role === 'user');
    if (firstUserMessage) {
      const userText = firstUserMessage.parts?.find((p: any) => p.type === 'text')?.text || 
                       (typeof firstUserMessage.content === 'string' ? firstUserMessage.content : '');
      // If it looks like a URL, we'd need to extract it, but for now just use the text
      // In a real implementation, you'd call an extraction API here
      if (userText && !userText.includes('Personal Source Context:')) {
        return {
          content: userText.split('Investigation Query:')[1]?.trim() || userText,
          sourceType: 'text',
          metadata: {},
        };
      }
    }
    return null;
  }, [activeMessages, personalSource, previewMetadata]);

  // Extract text report from the latest assistant message (must be before early return)
  // Look for the most comprehensive text response that explains all findings
  const textReport = useMemo(() => {
    // Find the last assistant message with significant text content
    // Prefer longer messages that look like comprehensive reports
    const assistantMessages = activeMessages
      .filter(m => m.role === 'assistant')
      .map(m => {
        let text = '';
        if (m.parts) {
          const textPart = m.parts.find((p: any) => p.type === 'text' && p.text);
          text = textPart?.text || '';
        } else if (typeof m.content === 'string') {
          text = m.content;
        }
        return { message: m, text, length: text.trim().length };
      })
      .filter(m => m.length > 100) // Only consider substantial messages
      .sort((a, b) => b.length - a.length); // Sort by length, longest first

    // Return the longest substantial message as the report
    if (assistantMessages.length > 0) {
      return assistantMessages[0].text.trim();
    }

    return null;
  }, [activeMessages]);

  // Extract key sections for the 1-6 order
  console.log('[CROSS-CHECK] Step 5: Extracting cross-check result from investigationResults');
  console.log('[CROSS-CHECK] Total investigation results:', investigationResults.length);
  console.log('[CROSS-CHECK] Investigation results:', investigationResults.map(r => ({
    id: r.id,
    title: r.title,
    hasComparisonData: !!r.comparisonData,
    comparisonDataType: r.comparisonData ? typeof r.comparisonData : 'none',
  })));
  
  const crossCheckResult = investigationResults.find(r => r.comparisonData);
  
  console.log('[CROSS-CHECK] Step 6: Found crossCheckResult:', crossCheckResult ? {
    id: crossCheckResult.id,
    title: crossCheckResult.title,
    hasComparisonData: !!crossCheckResult.comparisonData,
    comparisonDataKeys: crossCheckResult.comparisonData ? Object.keys(crossCheckResult.comparisonData) : [],
  } : 'NOT FOUND');
  
  if (crossCheckResult?.comparisonData) {
    console.log('[CROSS-CHECK] Step 7: Full comparisonData:', JSON.stringify(crossCheckResult.comparisonData, null, 2));
    console.log('[CROSS-CHECK] Step 8: Extracted fields:', {
      userContextComparison: crossCheckResult.comparisonData?.userContextComparison || crossCheckResult.comparisonData?.comparisonPoints,
      searchVsResearchComparison: crossCheckResult.comparisonData?.searchVsResearchComparison,
      userSourceContent: crossCheckResult.comparisonData?.userSourceContent,
      webSearchSummary: crossCheckResult.comparisonData?.webSearchSummary || crossCheckResult.comparisonData?.externalSourcesSummary,
      deepResearchSummary: crossCheckResult.comparisonData?.deepResearchSummary,
    });
  }
  
  const visualResult = investigationResults.find(r => r.visual);
  const graphResult = investigationResults.find(r => r.graphData);
  
  // User source or first query
  const userQueryMessage = activeMessages.find(m => m.role === 'user')?.content || '';
  // Try to extract clean query from prompt wrapper
  const cleanUserQuery = userQueryMessage.includes('Investigation Query:') 
    ? userQueryMessage.split('Investigation Query:')[1]?.trim() 
    : userQueryMessage;

  if (!hasStarted) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background p-4">
         <div className="max-w-2xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
               <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-4">
                  <Sparkles className="size-8" />
               </div>
               <h1 className="text-3xl font-bold tracking-tight">Start your investigation</h1>
               <p className="text-muted-foreground text-lg">
                 Enter a topic, entity, or question to begin gathering intelligence and verifying facts.
               </p>
            </div>

            <div className="bg-card border shadow-xl rounded-2xl p-1">
               {personalSource && (
                   <div className="px-4 pt-4 pb-0 animate-in slide-in-from-bottom-2 fade-in duration-200">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs text-primary font-medium flex items-center gap-1"><FileText className="size-3" /> Context Active</span>
                       <Button
                          variant="ghost" 
                          size="sm"
                          className="text-xs text-muted-foreground h-auto py-0 px-2 hover:text-foreground"
                          onClick={() => setPersonalSource('')}
                       >
                          Remove
                       </Button>
                    </div>
                    <Textarea
                         placeholder="Paste personal source content here (e.g. a rumor, internal note, or hypothesis)..."
                      value={personalSource}
                      onChange={(e) => setPersonalSource(e.target.value)}
                         className="min-h-[80px] text-sm resize-none bg-muted/20 focus:bg-background transition-colors border-none focus-visible:ring-0"
                    />
                    <Separator className="mt-4" />
                  </div>
                )}

               <PromptInput onSubmit={handleSubmit} className="bg-transparent border-none shadow-none">
                   <PromptInputTextarea 
                      placeholder="What do you want to investigate?" 
                      className="min-h-[60px] border-0 focus-visible:ring-0 resize-none py-4 px-4 text-base shadow-none"
                   />
                   <PromptInputFooter className="px-3 pb-3 pt-0">
                      <div className="flex items-center gap-2">
                        {!personalSource && (
                           <Button
                              variant="ghost" 
                              size="sm"
                              className="text-xs text-muted-foreground h-auto py-1.5 px-2 hover:bg-muted"
                              onClick={() => setPersonalSource(' ')}
                           >
                              <FileText className="size-3 mr-1.5" />
                              Add Context
                           </Button>
                        )}
                        <PromptInputTools>
                           <PromptInputSelect value={selectedModel} onValueChange={setSelectedModel}>
                              <PromptInputSelectTrigger className="h-8 text-xs gap-1 bg-muted/50 hover:bg-muted px-2 rounded-md border-transparent">
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
                      </div>
                      <PromptInputSubmit status={mockMode ? undefined : status} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-8 w-8 transition-transform active:scale-95" />
                    </PromptInputFooter>
               </PromptInput>
            </div>
            
            <div className="flex justify-center gap-4">
               <Badge variant={mockMode ? 'secondary' : 'outline'} className="cursor-pointer" onClick={() => setMockMode(!mockMode)}>
                  {mockMode ? 'Mock Mode Active' : 'Live Mode'}
               </Badge>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] md:h-screen overflow-hidden bg-background">
      {/* Header Toolbar */}
      <div className="border-b px-6 py-3 flex items-center justify-between bg-background/95 backdrop-blur z-10 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold text-lg flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Investigation
          </h1>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
             <Badge variant={mockMode ? 'secondary' : 'outline'} className="text-xs font-normal transition-colors">
                {mockMode ? 'Mock Mode' : 'Live Mode'}
             </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setMockMode(!mockMode);
              if (!mockMode) setMockMessages([]);
            }}
            className="text-xs hidden md:flex"
          >
            <Settings2 className="size-4 mr-2" />
            {mockMode ? 'Switch to Live' : 'Use Mock Data'}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
         {/* Left Panel: Evidence Board (Strict 6-Section Layout) */}
         <div className="flex-1 flex flex-col min-w-0 bg-muted/5 relative z-0 overflow-y-auto">
            <div className="p-6 max-w-5xl mx-auto w-full space-y-8 pb-20">
               <div className="flex items-center gap-2 mb-4">
                 <LayoutTemplate className="size-5 text-muted-foreground" />
                 <h2 className="font-semibold text-lg">Evidence Board</h2>
               </div>

               {/* 1. Source & Preview */}
               <section className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                     <span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                     Source & Preview
                  </h3>
                  <Card>
                     <CardContent className="p-4">
                        {isLoadingPreview ? (
                           <div className="flex items-center gap-3 py-4">
                              <Loader2 className="size-4 animate-spin text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Loading source metadata...</span>
                           </div>
                        ) : extractedSourceContent ? (
                           <div className="space-y-4">
                              <div>
                                 <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                    Source Content
                                    <Badge variant="outline" className="text-xs">
                                       {extractedSourceContent.sourceType}
                                    </Badge>
                                 </h4>
                                 <div className="bg-muted/30 p-3 rounded-md text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                                    {extractedSourceContent.content}
                                 </div>
                                 
                                 {/* Full Metadata Display */}
                                 {extractedSourceContent.metadata && Object.keys(extractedSourceContent.metadata).length > 0 && (
                                    <div className="mt-4 space-y-3">
                                       <h5 className="text-xs font-semibold text-muted-foreground uppercase">Full Metadata</h5>
                                       <div className="bg-muted/20 p-4 rounded-md border space-y-2">
                                          {/* URL */}
                                          {(extractedSourceContent as any).url && (
                                             <div className="flex items-start gap-2">
                                                <span className="text-xs font-medium text-muted-foreground min-w-[80px]">URL:</span>
                                                <a 
                                                   href={(extractedSourceContent as any).url} 
                                                   target="_blank" 
                                                   rel="noopener noreferrer" 
                                                   className="text-xs text-primary hover:underline flex items-center gap-1 break-all"
                                                >
                                                   <LinkIcon className="size-3 shrink-0" />
                                                   {(extractedSourceContent as any).url}
                                                </a>
                                             </div>
                                          )}
                                          
                                          {/* Twitter Metadata */}
                                          {extractedSourceContent.sourceType === 'twitter' && (() => {
                                             const meta = extractedSourceContent.metadata as Record<string, any>;
                                             return (
                                                <>
                                                   {meta.username && (
                                                      <div className="flex items-start gap-2">
                                                         <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Username:</span>
                                                         <span className="text-xs">@{meta.username}</span>
                                                      </div>
                                                   )}
                                                   {meta.author && (
                                                      <div className="flex items-start gap-2">
                                                         <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Author:</span>
                                                         <span className="text-xs">{meta.author}</span>
                                                      </div>
                                                   )}
                                                   {typeof meta.likes === 'number' && (
                                                      <div className="flex items-start gap-2">
                                                         <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Likes:</span>
                                                         <span className="text-xs">{meta.likes.toLocaleString()}</span>
                                                      </div>
                                                   )}
                                                   {typeof meta.retweets === 'number' && (
                                                      <div className="flex items-start gap-2">
                                                         <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Retweets:</span>
                                                         <span className="text-xs">{meta.retweets.toLocaleString()}</span>
                                                      </div>
                                                   )}
                                                   {typeof meta.replies === 'number' && (
                                                      <div className="flex items-start gap-2">
                                                         <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Replies:</span>
                                                         <span className="text-xs">{meta.replies.toLocaleString()}</span>
                                                      </div>
                                                   )}
                                                   {meta.createdAt && (
                                                      <div className="flex items-start gap-2">
                                                         <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Created:</span>
                                                         <span className="text-xs">{new Date(meta.createdAt).toLocaleString()}</span>
                                                      </div>
                                                   )}
                                                </>
                                             );
                                          })()}
                                          
                                          {/* TikTok Metadata */}
                                          {extractedSourceContent.sourceType === 'tiktok' && (() => {
                                             const meta = extractedSourceContent.metadata as Record<string, any>;
                                             return (
                                                <>
                                                   {meta.author && (
                                                      <div className="flex items-start gap-2">
                                                         <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Author:</span>
                                                         <span className="text-xs">{meta.author}</span>
                                                      </div>
                                                   )}
                                                   {meta.description && (
                                                      <div className="flex items-start gap-2">
                                                         <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Description:</span>
                                                         <span className="text-xs">{meta.description}</span>
                                                      </div>
                                                   )}
                                                   {typeof meta.likes === 'number' && (
                                                      <div className="flex items-start gap-2">
                                                         <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Likes:</span>
                                                         <span className="text-xs">{meta.likes.toLocaleString()}</span>
                                                      </div>
                                                   )}
                                                   {meta.duration && (
                                                      <div className="flex items-start gap-2">
                                                         <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Duration:</span>
                                                         <span className="text-xs">{Math.round(meta.duration)}s</span>
                                                      </div>
                                                   )}
                                                   {meta.videoUrl && (
                                                      <div className="flex items-start gap-2">
                                                         <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Video URL:</span>
                                                         <a 
                                                            href={meta.videoUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="text-xs text-primary hover:underline flex items-center gap-1 break-all"
                                                         >
                                                            <LinkIcon className="size-3 shrink-0" />
                                                            {meta.videoUrl}
                                                         </a>
                                                      </div>
                                                   )}
                                                </>
                                             );
                                          })()}
                                          
                                          {/* Raw JSON for any other metadata */}
                                          {extractedSourceContent.sourceType !== 'twitter' && extractedSourceContent.sourceType !== 'tiktok' && (
                                             <details className="mt-2">
                                                <summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground">
                                                   View Raw Metadata
                                                </summary>
                                                <pre className="mt-2 text-[10px] bg-background p-2 rounded border overflow-auto max-h-[200px]">
                                                   {JSON.stringify(extractedSourceContent.metadata, null, 2)}
                                                </pre>
                                             </details>
                                          )}
                                       </div>
                                    </div>
                                 )}
                              </div>
                              {personalSource && (
                                 <div>
                                    <h4 className="text-sm font-medium mb-2">Your Source Content</h4>
                                    <div className="bg-primary/10 p-3 rounded-md text-sm border-l-2 border-primary">
                                       {personalSource}
                                    </div>
                                 </div>
                              )}
                           </div>
                        ) : (
                           <>
                              <div className="mb-4">
                                 <h4 className="text-sm font-medium mb-2">Your Investigation Query</h4>
                                 <div className="bg-muted/30 p-3 rounded-md text-sm">
                                    {cleanUserQuery}
                                 </div>
                              </div>
                              {personalSource && (
                                 <div>
                                    <h4 className="text-sm font-medium mb-2">Your Source Content</h4>
                                    <div className="bg-primary/10 p-3 rounded-md text-sm border-l-2 border-primary">
                                       {personalSource}
                                    </div>
                                 </div>
                              )}
                           </>
                        )}
                     </CardContent>
                  </Card>
               </section>

               {/* 2. Cross-Check */}
               <section className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                     <span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                     Cross-Check
                  </h3>
                  {crossCheckResult ? (
                     (() => {
                        console.log('[CROSS-CHECK] Step 9: Rendering SourceComparison component');
                        
                        // Extract data with fallbacks
                        const userContextComparison = crossCheckResult.comparisonData?.userContextComparison || crossCheckResult.comparisonData?.comparisonPoints;
                        const searchVsResearchComparison = crossCheckResult.comparisonData?.searchVsResearchComparison;
                        const userSourceContent = crossCheckResult.comparisonData?.userSourceContent || personalSource || undefined;
                        const webSearchSummary = crossCheckResult.comparisonData?.webSearchSummary || crossCheckResult.comparisonData?.externalSourcesSummary;
                        const deepResearchSummary = crossCheckResult.comparisonData?.deepResearchSummary;
                        
                        console.log('[CROSS-CHECK] Props being passed:', {
                          userContextComparison,
                          userContextComparisonType: Array.isArray(userContextComparison) ? 'array' : typeof userContextComparison,
                          userContextComparisonLength: Array.isArray(userContextComparison) ? userContextComparison.length : 'not array',
                          searchVsResearchComparison,
                          searchVsResearchComparisonType: Array.isArray(searchVsResearchComparison) ? 'array' : typeof searchVsResearchComparison,
                          searchVsResearchComparisonLength: Array.isArray(searchVsResearchComparison) ? searchVsResearchComparison.length : 'not array',
                          userSourceContent,
                          userSourceContentLength: userSourceContent?.length || 0,
                          webSearchSummary,
                          webSearchSummaryLength: webSearchSummary?.length || 0,
                          deepResearchSummary,
                          deepResearchSummaryLength: deepResearchSummary?.length || 0,
                        });
                        
                        // Log the full comparisonData structure for debugging
                        console.log('[CROSS-CHECK] Full comparisonData object:', JSON.stringify(crossCheckResult.comparisonData, null, 2));
                        
                        return (
                           <SourceComparison 
                              userContextComparison={userContextComparison}
                              searchVsResearchComparison={searchVsResearchComparison}
                              userSourceContent={userSourceContent}
                              webSearchSummary={webSearchSummary}
                              deepResearchSummary={deepResearchSummary}
                           />
                        );
                     })()
                  ) : (
                     <EmptySection text="Comparing your source with web search results..." />
                  )}
               </section>

               {/* 3. DD Analysis (Visuals) */}
               <section className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                     <span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                     DD Analysis
                  </h3>
                  {visualResult && visualResult.visual ? (
                     <Card>
                        <CardContent className="p-4">
                           <Visualization data={visualResult.visual} />
                        </CardContent>
                     </Card>
                  ) : (
                     <EmptySection text="Analyzing content sentiment and political bias..." />
                  )}
               </section>

               {/* 4. Evolution Graph */}
               <section className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                     <span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                     Evolution Graph
                  </h3>
                  {graphResult && graphResult.graphData ? (
                     <Card className="overflow-hidden">
                        <div className="h-[500px] relative">
                           <EvolutionGraph nodes={graphResult.graphData.nodes} edges={graphResult.graphData.edges} />
                        </div>
                     </Card>
                  ) : (
                     <EmptySection text="Building event timeline and relationships..." />
                  )}
               </section>

               {/* 5. Text Report */}
               <section className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                     <span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                     Text Report
                  </h3>
                  {textReport ? (
                     <Card>
                        <CardContent className="p-6">
                           <MessageResponse>
                              {textReport}
                           </MessageResponse>
                        </CardContent>
                     </Card>
                  ) : (
                     <EmptySection text="Generating comprehensive investigation report..." />
                  )}
               </section>

               {/* 6. Citations */}
               <section className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                     <span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">6</span>
                     Citations
                  </h3>
                  {allCitations.length > 0 ? (
                     <CitationsBoard citations={allCitations} />
                  ) : (
                     <EmptySection text="Gathering source citations and references..." />
                  )}
               </section>

            </div>
         </div>

        {/* Right Panel: Chat & Timeline (Sidebar) */}
        <div className={cn(
            "w-[400px] lg:w-[450px] border-l bg-background flex flex-col shadow-xl z-10 transition-all duration-300 ease-in-out relative",
            !isRightPanelOpen && "w-0 opacity-0 overflow-hidden border-l-0"
        )}>
          {/* Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className="absolute -left-10 top-3 size-8 bg-background border shadow-sm rounded-r-none rounded-l-md z-20 flex items-center justify-center hover:bg-muted"
          >
            {isRightPanelOpen ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
          </Button>

          <div className="p-3 border-b flex items-center gap-2 font-medium text-sm">
             <Sparkles className="size-4 text-primary" />
             <span>Investigation Chat</span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth bg-muted/5">
            <div className="space-y-6 pb-4">
              {timelineEntries.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 text-sm">
                   Chat history will appear here.
                </div>
              ) : (
                timelineEntries.map((entry, index) => (
                   <TimelineItem
                        key={entry.id}
                        entry={entry}
                        index={index}
                        isLast={index === timelineEntries.length - 1}
                      expanded={entry.kind === 'tool' && !!expandedToolIds[entry.id]}
                      onToggle={() => entry.kind === 'tool' && toggleToolEntry(entry.id)}
                    />
                ))
              )}
              {isInvestigating && (
                 <div className="flex items-center gap-3 animate-pulse pl-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                       <Loader size={14} className="text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">Agent is thinking...</span>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-background z-20">
                <div className="mb-2 flex items-center justify-between">
                   <Button
                         variant="ghost" 
                     size="sm"
                         className="text-[10px] text-muted-foreground h-auto py-1 px-2 hover:text-foreground"
                         onClick={() => setPersonalSource(prev => prev ? '' : ' ')}
                      >
                         {personalSource ? '- Context' : '+ Context'}
                   </Button>
                   {personalSource && <span className="text-[10px] text-primary font-medium flex items-center gap-1"><FileText className="size-3" /> Active</span>}
                </div>
                  
                {personalSource && (
                   <div className="mb-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
                    <Textarea
                         placeholder="Personal source context..."
                      value={personalSource}
                      onChange={(e) => setPersonalSource(e.target.value)}
                         className="min-h-[60px] text-xs resize-none bg-muted/20 focus:bg-background transition-colors"
                    />
                  </div>
                )}

                <PromptInput onSubmit={handleSubmit} className="relative shadow-sm border rounded-xl overflow-hidden bg-background focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                   <PromptInputTextarea 
                      placeholder="Follow up question..." 
                      className="min-h-[44px] border-0 focus-visible:ring-0 resize-none py-3 px-3 text-sm"
                   />
                   <PromptInputFooter className="px-2 pb-2 pt-0">
                      <PromptInputTools>
                           {/* Minimal tools in sidebar */}
                      </PromptInputTools>
                      <PromptInputSubmit status={mockMode ? undefined : status} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-7 w-7 p-1.5 transition-transform active:scale-95" />
                    </PromptInputFooter>
                </PromptInput>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptySection({ text = "Pending..." }: { text?: string }) {
   return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-muted/5">
         <CircleDashed className="size-8 mb-3 opacity-20 animate-spin-slow" />
         <p className="text-sm opacity-70">{text}</p>
      </div>
   );
}

function CitationsBoard({ citations }: { citations: any[] }) {
   const [analyzing, setAnalyzing] = useState<string | null>(null);
   const [analyses, setAnalyses] = useState<Record<string, any>>({});

   const handleAnalyze = async (url: string, text: string, title: string) => {
      if (!text) return;
      
      setAnalyzing(url);
      try {
         const result = await analyzeSourceAction(text, title);
         if (result.success) {
            setAnalyses(prev => ({ ...prev, [url]: result.data }));
         }
      } catch (err) {
         console.error("Failed to analyze source:", err);
      } finally {
         setAnalyzing(null);
      }
   };

   return (
      <div className="grid gap-3">
         {citations.map((citation, idx) => {
            const analysis = analyses[citation.url];
            const isAnalyzing = analyzing === citation.url;

            return (
            <Card key={idx} className="overflow-hidden">
               <div className="p-3">
                  <div className="flex items-start justify-between gap-4 mb-2">
                     <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium leading-tight mb-1 truncate">
                           {citation.title || 'Untitled Source'}
                        </h4>
                        <a href={citation.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 truncate">
                           <LinkIcon className="size-3" />
                           {citation.url}
                        </a>
                     </div>
                     <Button 
                        variant={analysis ? "secondary" : "outline"} 
                        size="sm" 
                        className="h-7 text-xs gap-1"
                        onClick={() => !analysis && handleAnalyze(citation.url, citation.text, citation.title)}
                        disabled={isAnalyzing || !!analysis}
                     >
                        {isAnalyzing ? (
                           <Loader2 className="size-3 animate-spin" />
                        ) : analysis ? (
                           <Check className="size-3" />
                        ) : (
                           <Search className="size-3" />
                        )}
                        {analysis ? 'Analyzed' : 'Analyze Source'}
                     </Button>
                  </div>
                  
                  {/* Analysis Result Inline */}
                  {analysis && (
                     <div className="mt-3 bg-muted/50 rounded-md p-3 text-xs animate-in fade-in slide-in-from-top-1">
                        <div className="grid grid-cols-2 gap-4 mb-2">
                           <div>
                              <span className="text-muted-foreground block mb-1">Sentiment</span>
                              <Badge variant={analysis.sentiment === 'Positive' ? 'default' : analysis.sentiment === 'Negative' ? 'destructive' : 'secondary'}>
                                 {analysis.sentiment}
                              </Badge>
                           </div>
                           <div>
                              <span className="text-muted-foreground block mb-1">Political Bias</span>
                              <Badge variant="outline">
                                 {analysis.politicalBias}
                              </Badge>
                           </div>
                        </div>
                        <div>
                           <span className="text-muted-foreground block mb-1">Key Themes</span>
                           <div className="flex flex-wrap gap-1">
                              {analysis.themes.map((theme: string, i: number) => (
                                 <span key={i} className="bg-background border px-1.5 py-0.5 rounded text-[10px]">
                                    {theme}
                                 </span>
                              ))}
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </Card>
         );})}
      </div>
   );
}


function TimelineItem({
   entry,
   index,
   expanded,
   onToggle,
   isLast
 }: {
   entry: TimelineEntry;
   index: number;
   expanded: boolean;
   onToggle: () => void;
   isLast?: boolean;
 }) {
   const isUser = entry.kind === 'user';
   const isTool = entry.kind === 'tool';
   
   if (isUser) {
     return (
       <div className="flex flex-row-reverse gap-4 mb-8 animate-in slide-in-from-bottom-2">
         <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="size-4" />
         </div>
         <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-sm max-w-[85%] text-sm leading-relaxed">
            {entry.body}
         </div>
       </div>
     );
   }

   if (isTool && entry.toolPart) {
     const state = entry.toolPart.state;
     const isCompleted = state === 'output-available';
     const isRunning = state === 'input-streaming' || state === 'input-available';
     const isError = state === 'output-error';
     
     return (
       <div className="flex gap-4 relative pb-8 group animate-in slide-in-from-bottom-2">
         {/* Connector Line */}
         {!isLast && (
            <div className="absolute left-[15px] top-10 bottom-0 w-px bg-border/50 -z-10" />
         )}
         
         {/* Icon/Status Indicator */}
         <div className={cn(
           "size-8 rounded-full flex items-center justify-center shrink-0 text-xs font-medium shadow-sm transition-colors border z-10",
           isCompleted ? "bg-chart-2/10 border-chart-2/20 text-chart-2" : 
           isRunning ? "bg-primary/10 border-primary/20 text-primary" :
           isError ? "bg-destructive/10 border-destructive/20 text-destructive" :
           "bg-muted border-muted-foreground/20 text-muted-foreground"
         )}>
           {isRunning ? <Loader2 className="size-4 animate-spin" /> : 
            isCompleted ? <Check className="size-4" /> : 
            getToolIcon(entry.toolName || '')}
         </div>
         
         <div className="flex-1 pt-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
               <h4 className={cn("font-medium text-sm", isRunning && "text-primary")}>
                  {getToolDisplayName(entry.toolName || '', entry.toolPart.input)}
               </h4>
               <Badge variant={isRunning ? "default" : "secondary"} className="text-[10px] h-5 px-2 font-normal">
                  {isRunning ? "In Progress" : isError ? "Failed" : "Completed"}
               </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
               {entry.body}
            </p>
            
            <div className="flex items-center gap-2">
               <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onToggle} 
                  className="h-6 text-xs -ml-2 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
               >
                  {expanded ? <ChevronDown className="size-3 mr-1" /> : <ChevronRight className="size-3 mr-1" />}
                  {expanded ? 'Hide Details' : 'View Details'}
               </Button>
            </div>

            {expanded && (
               <div className="mt-3 p-3 bg-muted/30 rounded-lg border text-xs overflow-hidden animate-in slide-in-from-top-1">
                  <ToolOutput output={entry.toolPart.output} errorText={entry.toolPart.errorText} />
               </div>
            )}
         </div>
       </div>
     );
   }

   // Fallback for assistant text messages
   return (
      <div className="flex gap-4 pb-8 animate-in slide-in-from-bottom-2">
         <div className="size-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0 border">
            <Bot className="size-4" />
         </div>
         <div className="bg-muted/30 rounded-2xl rounded-tl-sm px-5 py-3.5 border text-sm leading-relaxed max-w-[85%]">
            <MessageResponse>
               {entry.body}
            </MessageResponse>
         </div>
      </div>
   );
 }

function ResultCard({ result }: { result: InvestigationResult }) {
   // This is now mainly used for structured data (Folder Report)
   // Since visual, graph, and comparison are pulled out into their own sections
   if (result.structuredData) {
      return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-muted/10 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-sm">{result.title}</h3>
               {result.summary && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.summary}</p>
               )}
            </div>
          </div>
          <div className="p-4">
             <StructuredDataDisplay data={result.structuredData} />
          </div>
       </div>
      );
   }
   return null;
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
        <div className="space-y-3">
          {results.map((result, index) => (
          <div key={index} className="group rounded-lg border p-3 hover:bg-muted/50 transition-colors">
              {result.title && (
              <h5 className="font-medium text-sm mb-1 leading-tight">{result.title}</h5>
              )}
              {result.url && (
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1 mb-2 w-fit"
                >
                  <ExternalLink className="size-3" />
                  {result.url.replace(/^https?:\/\//, '').split('/')[0]}
                </a>
              )}
              {result.text && (
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {result.text.replace(/\[.*?\]\(.*?\)/g, '').trim()}
                </p>
            )}
          </div>
        ))}
    </div>
  );
}

  // Handle other structured data - render as formatted JSON
  return (
    <div className="rounded-lg border p-3 bg-muted/30 font-mono">
      <pre className="text-[10px] overflow-auto max-h-60 text-muted-foreground">
        {JSON.stringify(data, null, 2)}
      </pre>
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
            body: part.text as string,
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

  console.log('[CROSS-CHECK] buildInvestigationResults: Processing messages');
  console.log('[CROSS-CHECK] Total messages:', messages.length);
  console.log('[CROSS-CHECK] Assistant messages:', messages.filter(m => m.role === 'assistant').length);

  messages
    .filter((message) => message.role === 'assistant')
    .forEach((message, messageIndex) => {
      const parts = extractMessageParts(message);
      console.log(`[CROSS-CHECK] Processing assistant message ${messageIndex}, parts:`, parts.length);
      
      parts.forEach((part: { type: string; text?: string } | ToolUIPart, partIndex: number) => {
        if (typeof part.type === 'string' && part.type.startsWith('tool-')) {
          const toolName = part.type.replace('tool-', '');
          console.log(`[CROSS-CHECK] Found tool part: ${toolName}`);
          
          if (toolName === 'compare_sources_comprehensive') {
            console.log('[CROSS-CHECK] Found compare_sources_comprehensive tool part!');
            console.log('[CROSS-CHECK] Tool part state:', (part as ToolUIPart).state);
            console.log('[CROSS-CHECK] Tool part output:', (part as ToolUIPart).output);
          }
          
          const parsed = parseToolOutputForResult(part as ToolUIPart, insightCounter);
          if (parsed) {
            console.log(`[CROSS-CHECK] Parsed result for ${toolName}:`, {
              id: parsed.id,
              title: parsed.title,
              hasComparisonData: !!parsed.comparisonData,
            });
            
            results.push({
               ...parsed,
               timestamp: Date.now()
            });
            insightCounter++;
          } else {
            console.log(`[CROSS-CHECK] No parsed result for ${toolName}`);
          }
        }
      });
    });

  console.log('[CROSS-CHECK] Final results count:', results.length);
  console.log('[CROSS-CHECK] Results with comparisonData:', results.filter(r => r.comparisonData).length);

  return results.reverse();
}

function parseToolOutputForResult(
  toolPart: ToolUIPart,
  insightIndex: number,
): Omit<InvestigationResult, 'timestamp'> | null {
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
        exaResults?: Record<string, unknown> & { summary?: string; citations?: any[] };
        comparison?: Record<string, unknown>;
      };
      return {
        id,
        title: visualization.title ?? `Visualization ${insightIndex}`,
        summary: visualization.exaResults?.summary || visualization.summary || '',
        visual: parsed as Record<string, unknown>,
        citations: visualization.exaResults?.citations,
      };
    }
    
    // Handle web search results directly
    if ((parsed as any).citations && Array.isArray((parsed as any).citations)) {
       return {
         id,
         title: 'Web Search Results',
         summary: (parsed as any).summary || 'Found related articles',
         citations: (parsed as any).citations,
         structuredData: parsed as Record<string, unknown>,
       }
    }

    // Check if this is structured research data
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

    if ((parsed as { type?: string }).type === 'evolution_graph') {
      return {
        id,
        title: 'Evolution Graph',
        summary: 'Visual representation of news evolution',
        graphData: parsed as { nodes: any[]; edges: any[] },
      };
    }

    if ((parsed as { tool?: string }).tool === 'compare_sources_comprehensive') {
      console.log('[CROSS-CHECK] Step 3: Parsing tool output in parseToolOutputForResult');
      console.log('[CROSS-CHECK] Raw parsed data:', JSON.stringify(parsed, null, 2));
      console.log('[CROSS-CHECK] Parsed comparison data structure:', {
        hasUserContextComparison: !!(parsed as any).userContextComparison,
        userContextComparisonLength: Array.isArray((parsed as any).userContextComparison) 
          ? (parsed as any).userContextComparison.length 
          : 0,
        hasSearchVsResearchComparison: !!(parsed as any).searchVsResearchComparison,
        searchVsResearchComparisonLength: Array.isArray((parsed as any).searchVsResearchComparison) 
          ? (parsed as any).searchVsResearchComparison.length 
          : 0,
        hasUserSourceContent: !!(parsed as any).userSourceContent,
        hasWebSearchSummary: !!(parsed as any).webSearchSummary,
        hasDeepResearchSummary: !!(parsed as any).deepResearchSummary,
      });
      
      const result = {
        id,
        title: 'Source Comparison',
        summary: 'Comprehensive comparison of sources',
        comparisonData: parsed,
      };
      
      console.log('[CROSS-CHECK] Step 4: Created result object:', JSON.stringify(result, null, 2));
      
      return result;
    }
    
    if ((parsed as { tool?: string }).tool === 'compare_user_source_to_external') {
      return {
        id,
        title: 'Source Comparison',
        summary: 'Comparison between user source and external findings',
        comparisonData: parsed,
      };
    }

    if ((parsed as { tool?: string }).tool === 'evaluate_source_credibility') {
      return {
        id,
        title: 'Author Credibility Assessment',
        summary: `Author credibility score for ${(parsed as any).username}`,
        credibilityData: parsed,
      };
    }
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
  
  const hasPersonalSource = query.includes('Personal Source Context:');
  const personalSourceText = hasPersonalSource 
    ? query.split('Personal Source Context:')[1]?.split('Investigation Query:')[0]?.trim() || 'Sample personal opinion about the topic.'
    : null;
  
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
          type: 'tool-classify_source_type',
          toolCallId: `mock-tool-classify-${timestamp}`,
          state: 'output-available',
          input: { 
            sourceUrl: 'https://www.cnbc.com/example',
            contentSnippet: 'News article reporting on funding round',
          },
          output: JSON.stringify({
            tool: 'classify_source_type',
            sourceUrl: 'https://www.cnbc.com/example',
            classification: 'secondary',
            reasoning: 'This is a news article reporting on the event, making it a secondary source.',
          }),
        },
        {
          type: 'tool-evaluate_source_credibility',
          toolCallId: `mock-tool-credibility-${timestamp}`,
          state: 'output-available',
          input: { 
            username: '@techreporter',
            platform: 'Twitter',
            profileData: JSON.stringify({ followers: 125000, verified: true }),
          },
          output: JSON.stringify({
            tool: 'evaluate_source_credibility',
            username: '@techreporter',
            platform: 'Twitter',
            score: 8,
            reasoning: 'Account age and activity patterns on Twitter suggest established presence.',
            profileData: { followers: 125000, verified: true },
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
              breakdown: { positive: 0.85, negative: 0.05, neutral: 0.10, mixed: 0.0 },
              reasoning: 'The content shows positive sentiment towards technological advancement.',
            },
            politicalLeaning: {
              classification: 'center',
              confidence: 0.72,
              reasoning: 'Neutral political stance, focused on business and technology.',
            },
            beliefDrivers: ['Innovation Bias', 'Authority Bias', 'Social Proof'],
            overallConfidence: 0.82,
          }),
        },
        {
          type: 'tool-compare_sources_comprehensive',
          toolCallId: `mock-tool-compare-${timestamp}`,
          state: 'output-available',
          input: { 
            userSourceContent: personalSourceText || undefined,
            webSearchSummary: 'External sources confirm the main claims but provide additional context about market conditions and investor sentiment.',
            deepResearchSummary: 'Deep research verifies the $2.3B funding and valuation figures, with specific details on lead investors (Andreessen Horowitz) and strategic implications for the AI market.',
          },
          output: JSON.stringify({
            tool: 'compare_sources_comprehensive',
            userSourceContent: personalSourceText || undefined,
            webSearchSummary: 'External sources confirm the main claims but provide additional context about market conditions and investor sentiment.',
            deepResearchSummary: 'Deep research verifies the $2.3B funding and valuation figures, with specific details on lead investors (Andreessen Horowitz) and strategic implications for the AI market.',
            comparisonData: {
              userContextComparison: hasPersonalSource ? [
                { 
                  category: 'Factual Consistency', 
                  userSource: 'Claims funding round occurred', 
                  externalSource: 'Multiple sources confirm $2.3B funding round', 
                  match: true 
                },
                { 
                  category: 'Tone', 
                  userSource: 'Emotional/Subjective perspective', 
                  externalSource: 'Objective/Factual reporting', 
                  match: false 
                }
              ] : [],
              searchVsResearchComparison: [
                {
                  category: 'Valuation Details',
                  searchSource: 'Mentions $29.3B valuation',
                  researchSource: 'Confirms $29.3B post-money valuation',
                  match: true
                },
                {
                  category: 'Investor Specifics',
                  searchSource: 'Mentions "major VC firms"',
                  researchSource: 'Identifies Andreessen Horowitz, Jeff Dean, and others',
                  match: true
                },
                {
                  category: 'Market Impact',
                  searchSource: 'General "revolutionizing" claims',
                  researchSource: 'Specific analysis of code editor market share shifts',
                  match: false
                }
              ]
            }
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
                breakdown: { positive: 0.85, negative: 0.05, neutral: 0.10, mixed: 0.0 },
              },
              politicalLeaning: {
                classification: 'center',
                confidence: 0.72,
              },
              beliefDrivers: ['Innovation Bias', 'Authority Bias', 'Social Proof'],
              overallConfidence: 0.82,
            },
            exaResults: {
              sentiment: {
                classification: 'positive',
                confidence: 0.88,
                breakdown: { positive: 0.80, negative: 0.10, neutral: 0.10, mixed: 0.0 },
              },
              politicalLeaning: {
                classification: 'center',
                confidence: 0.75,
              },
              beliefDrivers: ['Social Proof', 'Authority Bias'],
              overallConfidence: 0.85,
              summary: 'Analysis shows consistent positive sentiment across sources.',
              citations: [
                {
                  title: 'CNBC Article: Cursor AI raises $2.3B',
                  url: 'https://www.cnbc.com/2025/11/13/cursor-ai-startup-funding-round-valuation.html',
                },
                {
                  title: 'TechCrunch: The Future of AI Coding',
                  url: 'https://techcrunch.com/cursor-ai-development',
                },
                {
                  title: 'Bloomberg: AI Market Analysis',
                  url: 'https://bloomberg.com/news/articles/2025-11-14/ai-market-trends',
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
          type: 'tool-generate_evolution_graph',
          toolCallId: `mock-tool-graph-${timestamp}`,
          state: 'output-available',
          input: {
            events: [
              { 
                id: 'event-1', 
                label: 'Initial Funding Announcement', 
                date: '2024-01-15', 
                source: 'Company Press Release', 
                summary: 'Official announcement of the $2.3B Series A funding round led by major investors.',
                url: 'https://example.com/press-release',
                credibility: 10,
                type: 'primary' 
              },
              { 
                id: 'event-2', 
                label: 'TechCrunch Coverage', 
                date: '2024-01-15', 
                source: 'TechCrunch', 
                summary: 'Detailed analysis of the funding round and its implications for the AI coding market.',
                url: 'https://techcrunch.com/example',
                credibility: 9,
                type: 'secondary' 
              },
              { 
                id: 'event-3', 
                label: 'CNBC Analysis', 
                date: '2024-01-16', 
                source: 'CNBC', 
                summary: 'Financial perspective on the valuation and investor sentiment.',
                url: 'https://cnbc.com/example',
                credibility: 8,
                type: 'secondary' 
              },
              { 
                id: 'event-4', 
                label: 'Market Reaction', 
                date: '2024-01-16', 
                source: 'Market Data', 
                summary: 'Competitor stock prices adjusted following the announcement.',
                credibility: 7,
                type: 'related' 
              },
            ],
            relationships: [
              { sourceId: 'event-1', targetId: 'event-2', label: 'reported by' },
              { sourceId: 'event-1', targetId: 'event-3', label: 'analyzed by' },
              { sourceId: 'event-2', targetId: 'event-4', label: 'led to' },
              { sourceId: 'event-3', targetId: 'event-4', label: 'influenced' },
            ],
          },
          output: JSON.stringify({
            type: 'evolution_graph',
            nodes: [
              {
                id: 'event-1',
                type: 'default',
                data: { 
                  label: 'Initial Funding Announcement', 
                  date: '2024-01-15', 
                  source: 'Company Press Release', 
                  summary: 'Official announcement of the $2.3B Series A funding round led by major investors.',
                  url: 'https://example.com/press-release',
                  credibility: 10,
                  type: 'primary' 
                },
                position: { x: 0, y: 0 },
              },
              {
                id: 'event-2',
                type: 'default',
                data: { 
                  label: 'TechCrunch Coverage', 
                  date: '2024-01-15', 
                  source: 'TechCrunch', 
                  summary: 'Detailed analysis of the funding round and its implications for the AI coding market.',
                  url: 'https://techcrunch.com/example',
                  credibility: 9,
                  type: 'secondary' 
                },
                position: { x: 200, y: 0 },
              },
              {
                id: 'event-3',
                type: 'default',
                data: { 
                  label: 'CNBC Analysis', 
                  date: '2024-01-16', 
                  source: 'CNBC', 
                  summary: 'Financial perspective on the valuation and investor sentiment.',
                  url: 'https://cnbc.com/example',
                  credibility: 8,
                  type: 'secondary' 
                },
                position: { x: 200, y: 100 },
              },
              {
                id: 'event-4',
                type: 'default',
                data: { 
                  label: 'Market Reaction', 
                  date: '2024-01-16', 
                  source: 'Market Data', 
                  summary: 'Competitor stock prices adjusted following the announcement.',
                  credibility: 7,
                  type: 'related' 
                },
                position: { x: 400, y: 50 },
              },
            ],
            edges: [
              { id: 'e-0', source: 'event-1', target: 'event-2', label: 'reported by', animated: true },
              { id: 'e-1', source: 'event-1', target: 'event-3', label: 'analyzed by', animated: true },
              { id: 'e-2', source: 'event-2', target: 'event-4', label: 'led to', animated: true },
              { id: 'e-3', source: 'event-3', target: 'event-4', label: 'influenced', animated: true },
            ],
          }),
        },
        {
          type: 'text',
          text: `## Investigation Report: Cursor AI Funding

### Executive Summary
Cursor AI has successfully raised **$2.3 billion** in a Series A funding round, achieving a **$29.3 billion valuation**. This round was led by Andreessen Horowitz and other major investors, signaling strong market confidence in AI-assisted development tools.

### Key Findings
1. **Funding & Valuation**: The company secured $2.3B, valuing it at $29.3B. This is a significant milestone for an early-stage AI startup.
2. **Market Impact**: The investment validates the shift towards AI-native coding environments. Competitors and legacy IDEs are expected to accelerate their AI integration.
3. **Investor Sentiment**: Top-tier VCs are doubling down on developer productivity tools, betting that AI will fundamentally change software engineering.

### Conclusion
The massive valuation reflects the high growth potential of Cursor AI. However, the company will need to demonstrate sustained user adoption and revenue growth to justify this premium valuation in the long term.`,
        },
      ],
    },
  ];
}
