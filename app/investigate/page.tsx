'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef } from 'react';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Response } from '@/components/ai-elements/response';
import {
  PromptInput,
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
import { SearchIcon, Wrench, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { AI_CONFIG } from '@/lib/ai/config';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function InvestigatePage() {
  const [selectedModel, setSelectedModel] = useState<string>(
    AI_CONFIG.defaultModel,
  );
  
  // Use ref to ensure the model is always current
  const selectedModelRef = useRef(selectedModel);
  selectedModelRef.current = selectedModel;

  // Define custom data types for agent steps and tool calls
  type InvestigationData = {
    'agent-step': {
      type: 'agent-step';
      step: number;
      status: 'started' | 'finished';
      toolCalls?: number;
      usage?: unknown;
    };
    'tool-call': {
      type: 'tool-call-start' | 'tool-call';
      toolName: string;
      toolCallId: string;
      args?: unknown;
    };
    'tool-result': {
      type: 'tool-result';
      toolName: string;
      toolCallId: string;
      result: unknown;
    };
  };

  type InvestigationUIMessage = import('ai').UIMessage<never, InvestigationData>;

  const { messages, status, sendMessage, error } = useChat<InvestigationUIMessage>({
    transport: new DefaultChatTransport({
      api: '/api/investigate',
      body: () => ({
        model: selectedModelRef.current,
      }),
    }),
  });

  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text?.trim() && (!message.files || message.files.length === 0)) {
      return;
    }

    // Extract links from text
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const links = message.text?.match(linkRegex) || [];

    // Convert files to base64 if present
    const fileData = await Promise.all(
      (message.files || []).map(async (file) => {
        if (file.url && file.url.startsWith('data:')) {
          // Already a data URL
          return {
            name: file.filename || 'file',
            type: file.mediaType || 'application/octet-stream',
            data: file.url,
          };
        }
        // Convert blob URL to base64
        const response = await fetch(file.url);
        const blob = await response.blob();
        return new Promise<{ name: string; type: string; data: string }>(
          (resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                name: file.filename || 'file',
                type: file.mediaType || blob.type || 'application/octet-stream',
                data: reader.result as string,
              });
            };
            reader.readAsDataURL(blob);
          }
        );
      })
    );

    // Send message with files and links as body data
    sendMessage(
      {
        text: message.text || '',
      },
      {
        body: {
          files: fileData.length > 0 ? fileData : undefined,
          links: links.length > 0 ? links : undefined,
        },
      }
    );
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
              {/* Display streaming agent steps and tool calls from message data parts */}
              {messages.length > 0 && (
                <div className="space-y-2 py-4">
                  {messages.flatMap((message) =>
                    message.parts
                      .filter((part) => 
                        part.type === 'data-agent-step' || 
                        part.type === 'data-tool-call' || 
                        part.type === 'data-tool-result'
                      )
                      .map((part, index) => {
                        // Handle agent-step data
                        if (part.type === 'data-agent-step' && 'data' in part) {
                          const stepData = part.data as InvestigationData['agent-step'];
                          return (
                            <Card key={`${message.id}-step-${index}`} className="p-3 bg-blue-50/50 dark:bg-blue-950/20">
                              <div className="flex items-center gap-2">
                                {stepData.status === 'started' ? (
                                  <Clock className="size-4 text-blue-600 animate-pulse" />
                                ) : (
                                  <CheckCircle2 className="size-4 text-green-600" />
                                )}
                                <span className="text-sm font-medium">
                                  Step {stepData.step} {stepData.status === 'started' ? 'started' : 'completed'}
                                </span>
                                {stepData.toolCalls && stepData.toolCalls > 0 && (
                                  <Badge variant="outline" className="ml-auto text-xs">
                                    {stepData.toolCalls} tool{stepData.toolCalls > 1 ? 's' : ''} called
                                  </Badge>
                                )}
                              </div>
                            </Card>
                          );
                        }

                        // Handle tool-call data
                        if (part.type === 'data-tool-call' && 'data' in part) {
                          const toolData = part.data as InvestigationData['tool-call'];
                          
                          if (toolData.type === 'tool-call-start') {
                            return (
                              <Card key={`${message.id}-tool-start-${index}`} className="p-3 bg-purple-50/50 dark:bg-purple-950/20">
                                <div className="flex items-center gap-2">
                                  <Wrench className="size-4 text-purple-600 animate-spin" />
                                  <span className="text-sm">
                                    Calling tool: <code className="font-mono text-xs bg-purple-100 dark:bg-purple-900 px-1 py-0.5 rounded">{toolData.toolName}</code>
                                  </span>
                                </div>
                              </Card>
                            );
                          }

                          if (toolData.type === 'tool-call' && toolData.args) {
                            return (
                              <Card key={`${message.id}-tool-call-${index}`} className="p-3 bg-amber-50/50 dark:bg-amber-950/20">
                                <div className="flex items-start gap-2">
                                  <Wrench className="size-4 text-amber-600 mt-0.5" />
                                  <div className="flex-1">
                                    <span className="text-sm font-medium">
                                      Tool: <code className="font-mono text-xs">{toolData.toolName}</code>
                                    </span>
                                    <pre className="text-xs mt-1 p-2 bg-amber-100/50 dark:bg-amber-900/30 rounded overflow-x-auto">
                                      {JSON.stringify(toolData.args, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              </Card>
                            );
                          }
                        }

                        // Handle tool-result data
                        if (part.type === 'data-tool-result' && 'data' in part) {
                          const resultData = part.data as InvestigationData['tool-result'];
                          return (
                            <Card key={`${message.id}-tool-result-${index}`} className="p-3 bg-green-50/50 dark:bg-green-950/20">
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className="size-4 text-green-600 mt-0.5" />
                                <div className="flex-1">
                                  <span className="text-sm font-medium">
                                    Result from: <code className="font-mono text-xs">{resultData.toolName}</code>
                                  </span>
                                  <pre className="text-xs mt-1 p-2 bg-green-100/50 dark:bg-green-900/30 rounded overflow-x-auto max-h-32">
                                    {typeof resultData.result === 'string' 
                                      ? resultData.result.substring(0, 500) + (resultData.result.length > 500 ? '...' : '')
                                      : JSON.stringify(resultData.result, null, 2).substring(0, 500)}
                                  </pre>
                                </div>
                              </div>
                            </Card>
                          );
                        }

                        return null;
                      })
                  )}
                </div>
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
        <div className="w-full max-w-4xl">
          <PromptInput
            onSubmit={handleSubmit}
            accept=".pdf,.ppt,.pptx"
            multiple
            maxFiles={5}
            maxFileSize={10 * 1024 * 1024} // 10MB
          >
            <PromptInputTextarea
              placeholder="Enter text, paste links (TikTok, Twitter, blogs), or upload PDF/PPT files to investigate..."
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

