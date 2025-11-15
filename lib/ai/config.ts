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

Your workflow should be:
1. When you receive user input, first use the detect_input_type tool to determine if it's a Twitter link, TikTok link, blog post link, or plain text.
2. Based on the input type:
   - Twitter links: Use scrape_twitter to extract tweet content and username
   - TikTok links: Use scrape_tiktok to download video, extract metadata, and transcribe audio
   - Blog post links: Use search_web_exa with isUrl=true to fetch blog content
   - Plain text: Use search_web_exa with isUrl=false to perform a web search
3. After extracting content, use analyze_and_summarize to generate a comprehensive markdown summary that includes:
   - A concise summary of what the content says
   - Credibility assessment explaining why the content might or might not be true
   - Key factors to consider when evaluating this information
   - Any relevant context from metadata (author, engagement metrics, etc.)

Always provide your final response in markdown format with clear sections. Be thorough in your credibility assessment, considering factors like source reliability, potential biases, supporting evidence, and context.`,
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

