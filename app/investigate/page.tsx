'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Response } from '@/components/ai-elements/response';
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool';
import type { ToolUIPart } from 'ai';
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
import { SearchIcon } from 'lucide-react';
import { AI_CONFIG } from '@/lib/ai/config';
import { detectInputType } from '@/lib/ai/utils';
import {
  LinkPreview,
  LinkPreviewLoading,
  LinkPreviewError,
  type LinkPreviewData,
} from '@/components/link-preview';
import { LinkChip } from '@/components/link-chip';

function InvestigatePageContent() {
  const [selectedModel, setSelectedModel] = useState<string>(
    AI_CONFIG.defaultModel,
  );
  const [linkPreview, setLinkPreview] = useState<LinkPreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [detectedLinks, setDetectedLinks] = useState<string[]>([]);
  const [hoveredUrl, setHoveredUrl] = useState<string | null>(null);
  
  // Use ref to ensure the model is always current
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
      setPreviewError(err instanceof Error ? err.message : 'Failed to load preview');
      setLinkPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const handleLinkHover = useCallback((url: string) => {
    setHoveredUrl(url);
    // Clear any existing timeouts
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    if (hidePreviewTimeoutRef.current) {
      clearTimeout(hidePreviewTimeoutRef.current);
    }
    // Debounce the preview fetch
    previewTimeoutRef.current = setTimeout(() => {
      fetchPreview(url);
    }, 300);
  }, [fetchPreview]);

  const handleLinkLeave = useCallback(() => {
    // Clear timeout if user leaves before preview loads
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    // Hide preview when mouse leaves (with a small delay to allow moving to preview)
    if (hidePreviewTimeoutRef.current) {
      clearTimeout(hidePreviewTimeoutRef.current);
    }
    hidePreviewTimeoutRef.current = setTimeout(() => {
      setHoveredUrl(null);
      setLinkPreview(null);
      setPreviewError(null);
    }, 200);
  }, []);

  // Detect links in the input text (but don't auto-fetch previews)
  useEffect(() => {
    const text = textInput.value.trim();
    
    if (!text) {
      setDetectedLinks([]);
      // Clear preview if no links detected
      if (!hoveredUrl) {
        setLinkPreview(null);
        setPreviewError(null);
      }
      return;
    }

    // Check if the text contains URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);
    
    if (matches && matches.length > 0) {
      // Filter to only Twitter and TikTok links
      const supportedLinks = matches.filter(url => {
        const detection = detectInputType(url);
        return detection.type === 'twitter' || detection.type === 'tiktok';
      });
      
      setDetectedLinks(supportedLinks);
    } else {
      setDetectedLinks([]);
      // Clear preview if no links detected and not hovering
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

    // Clear preview and detected links when submitting
    setLinkPreview(null);
    setPreviewError(null);
    setHoveredUrl(null);
    setDetectedLinks([]);

    sendMessage({
      text: message.text,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        {/* Conversation Area */}
        <div className="w-full max-w-4xl flex-1 flex flex-col mb-4">
          <Conversation className="flex-1 min-h-0">
            <ConversationContent>
              {messages.length === 0 ? (
                <ConversationEmptyState
                  title="Start investigating"
                  description="Ask me anything or enter a query to investigate"
                  icon={<SearchIcon className="size-8" />}
                />
              ) : (
                messages
                  .filter((message) => message.role !== 'system')
                  .map((message) => {
                    return (
                      <Message key={message.id} from={message.role as 'user' | 'assistant'}>
                        <MessageContent>
                        {message.parts && Array.isArray(message.parts) ? (
                          message.parts.map((part, i) => {
                            if (part.type === 'text') {
                              return (
                                <Response key={`${message.id}-${i}`}>
                                  {part.text}
                                </Response>
                              );
                            }
                            // Render tool calls using Tool component
                            if (part.type.startsWith('tool-')) {
                              const toolPart = part as ToolUIPart;
                              const toolName = part.type.replace('tool-', '');
                              // Open tools by default if they have results
                              const hasResults = !!(toolPart.output || toolPart.errorText);
                              // Check if this is a visualization tool or has visualization output
                              const isVisualizationTool = toolName === 'generate_visualization' || 
                                                         toolName === 'analyze_sentiment_political';
                              let isVisualizationOutput = false;
                              if (toolPart.output) {
                                try {
                                  const output = typeof toolPart.output === 'string' 
                                    ? JSON.parse(toolPart.output) 
                                    : toolPart.output;
                                  isVisualizationOutput = output?.type === 'investigation_visualization' || 
                                                         (output?.sentiment && output?.politicalLeaning);
                                } catch {
                                  // Not JSON, skip
                                }
                              }
                              // Open by default if has results OR is visualization tool/output
                              const shouldOpen = hasResults || isVisualizationTool || isVisualizationOutput;
                              return (
                                <Tool key={`${message.id}-${i}`} defaultOpen={shouldOpen}>
                                  <ToolHeader
                                    type={toolPart.type}
                                    state={toolPart.state}
                                    input={toolPart.input}
                                  />
                                  <ToolContent>
                                    {toolPart.input && typeof toolPart.input === 'object' && !isVisualizationTool && !isVisualizationOutput ? (
                                      <ToolInput input={toolPart.input as ToolUIPart["input"]} />
                                    ) : null}
                                    {(toolPart.output || toolPart.errorText) && (
                                      <ToolOutput
                                        output={toolPart.output}
                                        errorText={toolPart.errorText}
                                      />
                                    )}
                                    {!hasResults && toolPart.state === 'output-available' && (
                                      <div className="p-4 text-sm text-muted-foreground">
                                        Tool completed but no output available.
                                      </div>
                                    )}
                                  </ToolContent>
                                </Tool>
                              );
                            }
                            return null;
                          })
                        ) : (
                          // Fallback for messages without parts
                          <Response>
                            {/* No content available */}
                          </Response>
                        )}
                        </MessageContent>
                      </Message>
                    );
                  })
              )}
              {status === 'streaming' && (
                <div className="flex items-center gap-2 py-4">
                  <Loader size={16} />
                  <span className="text-sm text-muted-foreground">
                    Investigating...
                  </span>
                </div>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        </div>

        {/* Input Area - Centered */}
        <div className="w-full max-w-4xl space-y-3">
          {/* Detected Links */}
          {detectedLinks.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
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

          {/* Link Preview - shown on hover */}
          {hoveredUrl && (
            <div
              onMouseEnter={() => {
                // Cancel hide timeout when hovering over preview
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

          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              placeholder="Enter your investigation query..."
              className="min-h-[60px]"
            />
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputSelect
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                >
                  <PromptInputSelectTrigger>
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
      </div>
    </div>
  );
}

export default function InvestigatePage() {
  return (
    <PromptInputProvider>
      <InvestigatePageContent />
    </PromptInputProvider>
  );
}

