import { z } from 'zod';
import { generateObject } from 'ai';
import { getOpenRouterProvider, getModelConfig } from '../config';

export const FactBiasSentimentSpanSchema = z.object({
  start: z
    .number()
    .int()
    .nonnegative()
    .describe('Start character index (0-based, inclusive) in the original text'),
  end: z
    .number()
    .int()
    .nonnegative()
    .describe('End character index (0-based, exclusive) in the original text'),
  text: z
    .string()
    .describe('The exact substring from the original text for this span'),
  type: z
    .enum(['fact', 'bias', 'sentiment', 'other'])
    .describe('Primary classification of this span'),
  subtype: z
    .string()
    .optional()
    .describe(
      'Optional, more specific subtype (e.g. "statistic", "political_bias", "positive_sentiment")',
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Confidence score for this classification (0-1)'),
  shortExplanation: z
    .string()
    .describe('One-sentence explanation of why this span was highlighted'),
  tags: z
    .array(z.string())
    .optional()
    .describe('Optional tags or labels for this span'),
});

export type FactBiasSentimentSpan = z.infer<typeof FactBiasSentimentSpanSchema>;

const FactBiasSentimentResponseSchema = z.object({
  spans: z
    .array(FactBiasSentimentSpanSchema)
    .describe('List of highlighted spans within the original text'),
});

/**
 * Analyze a block of text and return spans for facts, bias, and sentiment.
 *
 * This uses a single LLM call (Gemini via OpenRouter) and returns structured,
 * machine-parseable spans with character indices so the frontend can render
 * inline highlights.
 */
export async function analyzeFactBiasSentimentSpans(
  text: string,
): Promise<FactBiasSentimentSpan[]> {
  const trimmed = text ?? '';

  if (!trimmed.trim()) {
    return [];
  }

  const provider = getOpenRouterProvider();
  const modelConfig = getModelConfig();

  const prompt = `You are a careful annotator that highlights parts of text related to factual claims, bias, and sentiment.

Analyze the following text and return spans with CHARACTER INDICES:

TEXT:
"""${trimmed}"""

INSTRUCTIONS:
1. Work on the ORIGINAL TEXT as given between the triple quotes.
2. Identify sentences or short phrases that are:
   - FACT: concrete factual statements that could be verified (numbers, dates, named events, scientific or historical claims, quotes).
   - BIAS: language that shows political, demographic, ideological, or other bias, including framing or loaded wording.
   - SENTIMENT: clear emotional tone (strongly positive or negative, praise, fear, anger, etc.).
3. For each highlighted span:
   - Use 0-based character indices (start inclusive, end exclusive) referring to the ORIGINAL TEXT.
   - The "text" field MUST be the exact substring from start to end.
   - Spans MAY be sentence-level or phrase-level, but should not overlap heavily; prefer fewer, higher-value spans.
4. Be conservative:
   - Do NOT mark neutral, descriptive sentences as bias or sentiment.
   - Use "other" only when something is worth flagging but doesn't clearly fit fact/bias/sentiment.

OUTPUT FORMAT:
Return a JSON object with a "spans" array. Each span must follow this TypeScript-type:

type Span = {
  start: number;   // 0-based, inclusive
  end: number;     // 0-based, exclusive
  text: string;    // exact substring from the original text
  type: 'fact' | 'bias' | 'sentiment' | 'other';
  subtype?: string; // e.g. "statistic", "political_bias", "positive_sentiment"
  confidence: number; // 0-1
  shortExplanation: string; // one-sentence explanation
  tags?: string[];
};

IMPORTANT:
- Ensure that start/end indices are consistent with the ORIGINAL TEXT.
- Do NOT modify or normalize the text when computing indices.
- Prefer at most 30 spans; skip low-signal phrases.`;

  const result = await generateObject({
    model: provider.chat(modelConfig.model),
    prompt,
    schema: FactBiasSentimentResponseSchema,
  });

  // Basic safety filter to avoid obviously invalid indices
  const spans = (result.object.spans || []).filter((span) => {
    if (span.start < 0 || span.end <= span.start) return false;
    if (span.end > trimmed.length) return false;

    const slice = trimmed.slice(span.start, span.end);
    // If the model's text field doesn't match the slice, trust indices and overwrite text
    return !!slice.trim();
  });

  return spans.map((span) => ({
    ...span,
    text: trimmed.slice(span.start, span.end),
  }));
}


