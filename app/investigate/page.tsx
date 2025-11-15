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
import { SearchIcon } from 'lucide-react';
import { AI_CONFIG } from '@/lib/ai/config';

export default function InvestigatePage() {
  const [selectedModel, setSelectedModel] = useState<string>(
    AI_CONFIG.defaultModel,
  );
  
  // Use ref to ensure the model is always current
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

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text?.trim()) {
      return;
    }

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
                            // Tool invocations and other part types can be rendered here
                            if (part.type.startsWith('tool-')) {
                              return (
                                <div key={`${message.id}-${i}`} className="text-sm text-muted-foreground py-2">
                                  Using tool: {part.type.replace('tool-', '')}
                                </div>
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
        <div className="w-full max-w-4xl">
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

