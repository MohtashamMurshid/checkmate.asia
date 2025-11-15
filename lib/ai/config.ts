import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import type { AIConfig } from './types';

/**
 * Centralized AI configuration
 * Modify this file to change models, prompts, or settings across the entire application
 */
export const AI_CONFIG: AIConfig = {
  defaultModel: 'openai/gpt-4o-mini',
  availableModels: [
    {
      name: 'Claude 3.5 Sonnet',
      value: 'anthropic/claude-3.5-sonnet',
    },
    {
      name: 'GPT-4o',
      value: 'openai/gpt-4o',
    },
    {
      name: 'GPT-4o Mini',
      value: 'openai/gpt-4o-mini',
    },
    {
      name: 'Llama 3.1 70B',
      value: 'meta-llama/llama-3.1-70b-instruct',
    },
    {
      name: 'Gemini Pro',
      value: 'google/gemini-pro',
    },
  ],
  maxDuration: 30, // seconds
  systemPrompt: `You are a helpful AI assistant specialized in investigating and analyzing information. 
You can help users research topics, analyze data, search for information, and provide comprehensive insights.
Use your available tools to gather accurate and up-to-date information when needed.`,
};

/**
 * Get the OpenRouter provider instance
 * Creates a singleton instance to avoid recreating the provider
 */
let openRouterProvider: ReturnType<typeof createOpenRouter> | null = null;

export function getOpenRouterProvider() {
  if (!openRouterProvider) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error(
        'OPENROUTER_API_KEY is not set. Please add it to your environment variables.',
      );
    }
    openRouterProvider = createOpenRouter({
      apiKey,
    });
  }
  return openRouterProvider;
}

/**
 * Get the current model configuration
 */
export function getModelConfig(modelId?: string) {
  const model = modelId || AI_CONFIG.defaultModel;
  const modelOption = AI_CONFIG.availableModels.find((m) => m.value === model);
  return {
    model,
    modelName: modelOption?.name || model,
    ...AI_CONFIG,
  };
}

