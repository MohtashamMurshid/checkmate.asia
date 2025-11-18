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
  SearchIcon, 
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
  CircleDashed,
  Loader2,
  Bot,
  Save,
  TrendingUp,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  // Auto-save when investigation completes
  useEffect(() => {
    if (status !== 'streaming' && investigationResults.length > 0) {
      const latestTimestamp = Math.max(...investigationResults.map(r => r.timestamp));
      if (latestTimestamp > lastSavedTimestamp) {
        const latestResult = investigationResults[0]; // Most recent
        
        // Find user query
        const userQuery = activeMessages.find(m => m.role === 'user')?.content || 'Investigation';

        // Prepare data to save - save aggregate or specific result?
        // Let's save the latest state
        const saveData = async () => {
          try {
            await saveInvestigation({
              userQuery: userQuery.slice(0, 1000), // Limit length
              userSourceContent: personalSource || undefined,
              results: latestResult, // Save the latest result object
              graphData: latestResult.graphData || undefined,
              timestamp: Date.now(),
            });
            setLastSavedTimestamp(Date.now());
            console.log('Investigation saved');
          } catch (err) {
            console.error('Failed to save investigation:', err);
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

  // Filtering results for tabs
  const visualResults = investigationResults.filter(r => r.visual || r.graphData);
  const dataResults = investigationResults.filter(r => r.structuredData || r.comparisonData || r.credibilityData);

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
                       <span className="text-xs text-blue-500 font-medium flex items-center gap-1"><FileText className="size-3" /> Context Active</span>
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
         {/* Left Panel: Results & Evidence (Main View) */}
         <div className="flex-1 flex flex-col min-w-0 bg-muted/5 relative z-0">
            <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
               <div className="p-3 border-b bg-background flex items-center justify-between gap-2 shrink-0 sticky top-0">
                 <h2 className="font-semibold text-sm flex items-center gap-2 whitespace-nowrap text-muted-foreground pl-2">
                   <LayoutTemplate className="size-4" />
                   Evidence Board
                 </h2>
                 <TabsList className="h-8 bg-muted/50 p-0.5">
                    <TabsTrigger value="all" className="text-xs px-2.5 h-7">
                       <Layers className="size-3 mr-1.5" /> All
                       <span className="ml-1.5 text-[10px] bg-primary/10 text-primary px-1 rounded-full">{investigationResults.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="visuals" className="text-xs px-2.5 h-7">
                       <PieChart className="size-3 mr-1.5" /> Visuals
                       <span className="ml-1.5 text-[10px] bg-muted text-muted-foreground px-1 rounded-full">{visualResults.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="data" className="text-xs px-2.5 h-7">
                       <FileText className="size-3 mr-1.5" /> Data
                       <span className="ml-1.5 text-[10px] bg-muted text-muted-foreground px-1 rounded-full">{dataResults.length}</span>
                    </TabsTrigger>
                 </TabsList>
              </div>
               
               <div className="flex-1 overflow-y-auto">
                 <div className="p-6 min-h-full max-w-5xl mx-auto w-full">
                   <TabsContent value="all" className="mt-0 space-y-6 animate-in fade-in duration-300">
                     {investigationResults.length === 0 ? (
                        <EmptyState />
                     ) : (
                        investigationResults.map((result) => (
                           <ResultCard key={result.id} result={result} />
                        ))
                     )}
                   </TabsContent>
                   
                   <TabsContent value="visuals" className="mt-0 space-y-6 animate-in fade-in duration-300">
                     {visualResults.length === 0 ? (
                        <EmptyState text="No visualizations generated yet." />
                     ) : (
                        visualResults.map((result) => (
                           <ResultCard key={result.id} result={result} />
                        ))
                     )}
                   </TabsContent>
                   
                   <TabsContent value="data" className="mt-0 space-y-6 animate-in fade-in duration-300">
                     {dataResults.length === 0 ? (
                        <EmptyState text="No structured data found yet." />
                     ) : (
                        dataResults.map((result) => (
                           <ResultCard key={result.id} result={result} />
                        ))
                     )}
                   </TabsContent>
                 </div>
               </div>
            </Tabs>
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
                   {personalSource && <span className="text-[10px] text-blue-500 font-medium flex items-center gap-1"><FileText className="size-3" /> Active</span>}
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

function EmptyState({ text = "No evidence collected yet." }: { text?: string }) {
   return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl m-2 bg-muted/5">
         <LayoutTemplate className="size-12 mb-4 opacity-20" />
         <p className="text-base font-medium mb-1">Evidence Board Empty</p>
         <p className="text-sm opacity-70">{text}</p>
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
           isCompleted ? "bg-green-50 border-green-200 text-green-600" : 
           isRunning ? "bg-blue-50 border-blue-200 text-blue-600" :
           isError ? "bg-red-50 border-red-200 text-red-600" :
           "bg-muted border-muted-foreground/20 text-muted-foreground"
         )}>
           {isRunning ? <Loader2 className="size-4 animate-spin" /> : 
            isCompleted ? <Check className="size-4" /> : 
            getToolIcon(entry.toolName || '')}
         </div>
         
         <div className="flex-1 pt-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
               <h4 className={cn("font-medium text-sm", isRunning && "text-blue-600")}>
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
   return (
     <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-2">
       <div className="p-4 border-b bg-muted/10 flex items-start justify-between gap-4">
         <div>
           <h3 className="font-semibold text-sm">{result.title}</h3>
                    {result.summary && (
             <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.summary}</p>
                    )}
         </div>
       </div>
       
       <div className="p-0">
                    {result.visual && (
            <div className="p-4">
                      <Visualization data={result.visual} />
            </div>
                    )}
                    {result.graphData && (
            <div className="h-[600px] border-b relative">
                      <EvolutionGraph nodes={result.graphData.nodes} edges={result.graphData.edges} />
            </div>
                    )}
                    {result.comparisonData && (
           <div className="p-4">
                      <SourceComparison 
               userSourceContent={result.comparisonData.userSourceContent || 'No user source provided'}
                        externalSummary={result.comparisonData.externalSourcesSummary}
                        comparisonPoints={result.comparisonData.comparisonPoints || []}
                      />
           </div>
                    )}
                    {result.credibilityData && (
           <div className="p-4 flex justify-center bg-muted/5">
                      <CredibilityBadge 
                        score={result.credibilityData.score} 
                        username={result.credibilityData.username}
                        platform={result.credibilityData.platform}
                      />
           </div>
                    )}
                    {result.structuredData && (
           <div className="p-4">
                      <StructuredDataDisplay data={result.structuredData} />
              </div>
            )}
       </div>
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
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 mb-2 w-fit"
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

  messages
    .filter((message) => message.role === 'assistant')
    .forEach((message, messageIndex) => {
      const parts = extractMessageParts(message);
      parts.forEach((part: { type: string; text?: string } | ToolUIPart, partIndex: number) => {
        if (typeof part.type === 'string' && part.type.startsWith('tool-')) {
          const parsed = parseToolOutputForResult(part as ToolUIPart, insightCounter);
          if (parsed) {
            results.push({
               ...parsed,
               timestamp: Date.now()
            });
            insightCounter++;
          }
        }
      });
    });

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
        title: 'Credibility Assessment',
        summary: `Credibility score for ${(parsed as any).username}`,
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
        ...(hasPersonalSource && personalSourceText ? [{
          type: 'tool-compare_user_source_to_external',
          toolCallId: `mock-tool-compare-${timestamp}`,
          state: 'output-available',
          input: { 
            userSourceContent: personalSourceText,
            externalSourcesSummary: 'External sources confirm the main claims but provide additional context about market conditions and investor sentiment.',
          },
          output: JSON.stringify({
            tool: 'compare_user_source_to_external',
            userSourceContent: personalSourceText,
            externalSourcesSummary: 'External sources confirm the main claims but provide additional context about market conditions and investor sentiment.',
            comparisonPoints: [
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
              },
              { 
                category: 'Context', 
                userSource: 'Focuses on immediate impact', 
                externalSource: 'Includes market analysis and historical context', 
                match: false 
              },
            ],
          }),
        }] : []),
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
          text: 'Investigation complete. All analyses have been performed and results are available in the Evidence Board.',
        },
      ],
    },
  ];
}
