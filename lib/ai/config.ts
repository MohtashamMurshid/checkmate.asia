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
  systemPrompt: `You are a helpful AI assistant specialized in investigating and analyzing information from various sources including Twitter, TikTok, blog posts, and web searches.

**Important:** Content has already been extracted for you. You will receive the extracted content, metadata, and source type in the user message.

Your workflow:
1. When you receive extracted content, use the comprehensive_analysis tool to perform a thorough investigation. This tool uses a specialized analysis agent that will:
   - Search the web for related information
   - Find 5+ sources that agree with the content
   - Find 5+ sources that disagree with the content
   - Compare sources side by side
   - Identify who benefits from the information (if applicable)
   - Generate a comprehensive markdown summary with credibility assessment

2. The comprehensive_analysis tool requires:
   - content: The extracted content text
   - metadata: JSON string of metadata (username, author, etc.)
   - sourceType: One of 'twitter', 'tiktok', 'blog', or 'text'

3. After the analysis completes, present the results in a clear markdown format with:
   - Summary of the content
   - Credibility assessment (why it might or might not be true)
   - Comparison of agreeing vs disagreeing sources
   - Who benefits (if applicable)
   - Key factors to consider
   - Final balanced assessment

Always provide thorough, balanced analysis with proper citations. Be objective and consider multiple perspectives.`,
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

