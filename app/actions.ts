'use server';

import { generateObject } from 'ai';
import { z } from 'zod';
import { getOpenRouterProvider, getModelConfig } from '@/lib/ai/config';

export async function analyzeSourceAction(text: string, sourceTitle: string) {
  try {
    const provider = getOpenRouterProvider();
    const modelConfig = getModelConfig();

    const analysisPrompt = `Analyze the sentiment and political bias of the following text from source "${sourceTitle}".
    
Text: "${text.substring(0, 2000)}"

Provide:
1. Sentiment Score (0-1)
2. Political Bias (Left/Center/Right)
3. Key Themes`;

    const result = await generateObject({
      model: provider.chat(modelConfig.model),
      prompt: analysisPrompt,
      schema: z.object({
        sentiment: z.enum(['Positive', 'Negative', 'Neutral']),
        politicalBias: z.enum(['Left', 'Center', 'Right', 'None']),
        confidence: z.number(),
        themes: z.array(z.string())
      })
    });

    return { success: true, data: result.object };
  } catch (error) {
    console.error('Analysis failed:', error);
    return { success: false, error: 'Failed to analyze source' };
  }
}

