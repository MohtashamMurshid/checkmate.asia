'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { ToolUIPart } from 'ai';
import { useState, useRef, useEffect, useCallback } from 'react';
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
import { AI_CONFIG } from '@/lib/ai/config';
import { Loader } from '@/components/ai-elements/loader';
import { Tool, ToolHeader, ToolContent, ToolOutput, getToolDisplayName, getToolIcon } from '@/components/ai-elements/tool';
import { Visualization } from '@/components/ai-elements/visualization';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { EvolutionGraph } from '@/components/ai-elements/evolution-graph';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Bot,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

function InvestigatePageContent() {
  // Ensure default model is valid
  const defaultModel = AI_CONFIG.availableModels.find(m => m.value === AI_CONFIG.defaultModel)?.value || AI_CONFIG.availableModels[0]?.value || '';
  
  const [selectedModel, setSelectedModel] = useState<string>(defaultModel);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number>(0);

  const saveInvestigation = useMutation(api.investigations.save);

  const selectedModelRef = useRef<string>(defaultModel);
  
  // Update ref when model changes, but don't cause re-renders
  useEffect(() => {
    selectedModelRef.current = selectedModel;
  }, [selectedModel]);

  // Memoize the change handler to prevent re-renders
  const handleModelChange = useCallback((value: string) => {
    // Only update if value is valid
    if (value && AI_CONFIG.availableModels.some(m => m.value === value)) {
      setSelectedModel(value);
    }
  }, []);

  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/investigate',
      body: () => ({
        model: selectedModelRef.current,
      }),
    }),
  });

  const hasStarted = messages.length > 0;

  // Extract message parts for rendering
  function extractMessageParts(message: any) {
    if (Array.isArray(message.parts)) {
      return message.parts;
    }
    if (typeof message.content === 'string' && message.content.trim()) {
      return [{ type: 'text', text: message.content }];
    }
    return [];
  }

  // Auto-save when investigation completes
  useEffect(() => {
    if (status !== 'streaming' && messages.length > 0) {
      const userMessage = messages.find(m => m.role === 'user');
      const userParts = userMessage ? extractMessageParts(userMessage) : [];
      const userTextPart = userParts.find((p: any) => p.type === 'text');
      const userQuery = userTextPart?.text || 'Investigation';
      
      // Extract text report from assistant messages
      const assistantMessages = messages
        .filter(m => m.role === 'assistant')
        .map(m => {
          const parts = extractMessageParts(m);
          const textPart = parts.find((p: any) => p.type === 'text' && p.text);
          const text = textPart?.text || '';
          return { text, length: text.trim().length };
        })
        .filter(m => m.length > 100)
        .sort((a, b) => b.length - a.length);
      
      const textReport = assistantMessages.length > 0 ? assistantMessages[0].text.trim() : null;

      // Extract results from tool outputs
      const results: any = {
        summary: textReport || 'Investigation completed',
        citations: [],
        visual: null,
        graphData: null,
        comparisonData: null,
      };

      // Extract data from tool parts
      messages.forEach(m => {
        if (m.role === 'assistant') {
          const parts = extractMessageParts(m);
          parts.forEach((part: any) => {
            if (typeof part.type === 'string' && part.type.startsWith('tool-')) {
              const toolPart = part as ToolUIPart;
              if (toolPart.output && toolPart.state === 'output-available') {
                try {
                  const parsed = typeof toolPart.output === 'string' 
                    ? JSON.parse(toolPart.output) 
                    : toolPart.output;
                  
                  // Extract visualization
                  if (parsed.type === 'investigation_visualization') {
                    results.visual = parsed;
                    if (parsed.exaResults?.citations) {
                      results.citations.push(...parsed.exaResults.citations);
                    }
                  }
                  
                  // Extract graph
                  if (parsed.type === 'evolution_graph') {
                    results.graphData = parsed;
                  }
                  
                  // Extract citations from research
                  if (parsed.citations && Array.isArray(parsed.citations)) {
                    results.citations.push(...parsed.citations);
                  }
                  
                  // Extract comparison data
                  if (parsed.tool === 'compare_sources_comprehensive') {
                    results.comparisonData = parsed;
                  }
                } catch {
                  // Ignore parse errors
                }
              }
            }
          });
        }
      });

      // Deduplicate citations
      const citationMap = new Map();
      results.citations.forEach((cite: any) => {
        if (cite.url && !citationMap.has(cite.url)) {
          citationMap.set(cite.url, cite);
        }
      });
      results.citations = Array.from(citationMap.values());

      // Save if we have new data
      const currentTimestamp = Date.now();
      if (currentTimestamp > lastSavedTimestamp && (textReport || results.citations.length > 0)) {
        saveInvestigation({
          userQuery: userQuery.slice(0, 1000),
          results,
          graphData: results.graphData || undefined,
          timestamp: currentTimestamp,
        });
        setLastSavedTimestamp(currentTimestamp);
      }
    }
  }, [status, messages, lastSavedTimestamp, saveInvestigation]);

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text?.trim()) return;
    sendMessage({ text: message.text });
  };

  const isInvestigating = status === 'streaming';

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
            <PromptInput onSubmit={handleSubmit} className="bg-transparent border-none shadow-none">
              <PromptInputTextarea 
                placeholder="What do you want to investigate?" 
                className="min-h-[60px] border-0 focus-visible:ring-0 resize-none py-4 px-4 text-base shadow-none"
              />
              <PromptInputFooter className="px-3 pb-3 pt-0">
                <PromptInputTools>
                  <PromptInputSelect key="initial-select" value={selectedModel} onValueChange={handleModelChange}>
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
                <PromptInputSubmit status={status} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-8 w-8 transition-transform active:scale-95" />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Header */}
      <div className="border-b px-6 py-3 flex items-center justify-between bg-background/95 backdrop-blur z-10 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold text-lg flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Investigation
          </h1>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-6 pb-4">
          {messages.map((message, index) => {
            const parts = extractMessageParts(message);
            
            if (message.role === 'user') {
              const textPart = parts.find((p: any) => p.type === 'text');
              return (
                <Message key={message.id || index} from="user">
                  <MessageContent>
                    {textPart?.text || ''}
                  </MessageContent>
                </Message>
              );
            }

            // Assistant message
            return (
              <div key={message.id || index} className="space-y-4">
                {parts.map((part: any, partIndex: number) => {
                  // Text part
                  if (part.type === 'text' && part.text?.trim()) {
                    return (
                      <Message key={`${message.id}-text-${partIndex}`} from="assistant">
                        <MessageContent>
                          <MessageResponse>{part.text}</MessageResponse>
                        </MessageContent>
                      </Message>
                    );
                  }

                  // Tool part
                  if (typeof part.type === 'string' && part.type.startsWith('tool-')) {
                    const toolPart = part as ToolUIPart;
                    const toolName = part.type.replace('tool-', '');
                    
                    // Render special visualizations
                    let customContent = null;
                    if (toolPart.output && toolPart.state === 'output-available') {
                      try {
                        const parsed = typeof toolPart.output === 'string' 
                          ? JSON.parse(toolPart.output) 
                          : toolPart.output;
                        
                        // Visualization
                        if (parsed.type === 'investigation_visualization') {
                          customContent = <Visualization data={parsed} />;
                        }
                        
                        // Evolution graph
                        if (parsed.type === 'evolution_graph' && parsed.nodes && parsed.edges) {
                          customContent = (
                            <div className="h-[500px] relative">
                              <EvolutionGraph nodes={parsed.nodes} edges={parsed.edges} />
                            </div>
                          );
                        }
                      } catch {
                        // Ignore parse errors
                      }
                    }

                    return (
                      <Message key={`${message.id}-tool-${partIndex}`} from="assistant">
                        <MessageContent>
                          <Tool defaultOpen={toolPart.state === 'output-available'}>
                            <ToolHeader
                              title={getToolDisplayName(toolName, toolPart.input)}
                              type={part.type}
                              state={toolPart.state}
                              input={toolPart.input}
                            />
                            <ToolContent>
                              {customContent || (
                                <ToolOutput 
                                  output={toolPart.output} 
                                  errorText={toolPart.errorText}
                                  state={toolPart.state}
                                />
                              )}
                            </ToolContent>
                          </Tool>
                        </MessageContent>
                      </Message>
                    );
                  }

                  return null;
                })}
              </div>
            );
          })}

          {isInvestigating && (
            <div className="flex items-center gap-3 animate-pulse">
              <div className="bg-primary/10 p-2 rounded-full">
                <Loader size={14} className="text-primary" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Agent is thinking...</span>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t px-4 py-3 bg-background z-20">
        <PromptInput onSubmit={handleSubmit} className="relative shadow-sm border rounded-xl overflow-hidden bg-background focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <PromptInputTextarea 
            placeholder="Follow up question..." 
            className="min-h-[44px] border-0 focus-visible:ring-0 resize-none py-3 px-3 text-sm"
          />
          <PromptInputFooter className="px-2 pb-2 pt-0">
            <PromptInputTools>
              <PromptInputSelect key="chat-select" value={selectedModel} onValueChange={handleModelChange}>
                <PromptInputSelectTrigger className="h-7 text-xs gap-1 bg-muted/50 hover:bg-muted px-2 rounded-md border-transparent">
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
            <PromptInputSubmit status={status} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-7 w-7 p-1.5 transition-transform active:scale-95" />
          </PromptInputFooter>
        </PromptInput>
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
