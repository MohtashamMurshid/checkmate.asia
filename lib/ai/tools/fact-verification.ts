import { z } from 'zod';
import { generateObject } from 'ai';
import { getOpenRouterProvider, getModelConfig } from '../config';

const EvidenceItemSchema = z.object({
  claimSnippet: z
    .string()
    .describe('Short snippet of the original claim or a key fragment'),
  quote: z
    .string()
    .describe('Relevant quote or summary from an external source'),
  sourceTitle: z.string().optional().describe('Title of the source, if known'),
  url: z.string().url().optional().describe('URL of the source, if applicable'),
});

const FactVerificationResultSchema = z.object({
  verdict: z
    .enum(['supported', 'contradicted', 'mixed', 'unknown'])
    .describe(
      'Overall verdict: supported by evidence, contradicted, mixed, or unknown/unverifiable',
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Confidence score for the verdict (0-1)'),
  explanation: z
    .string()
    .describe(
      'Short explanation summarizing how the verdict was reached, in plain language',
    ),
  evidence: z
    .array(EvidenceItemSchema)
    .describe('Key evidence items that support the verdict'),
  sources: z
    .array(
      z.object({
        title: z.string().describe('Human-readable title of the source'),
        url: z.string().url().describe('Canonical URL for the source'),
      }),
    )
    .describe('List of unique sources considered in the verdict'),
});

export type FactVerificationResult = z.infer<typeof FactVerificationResultSchema>;

interface ExaResultItem {
  title?: string;
  url?: string;
  text?: string;
  publishedDate?: string | null;
}

/**
 * Verify a single factual claim using web search (Exa) and an LLM synthesis step.
 *
 * This is intentionally lightweight compared to the full research agent, but
 * still provides structured verdict + evidence for UI consumption.
 */
export async function verifyClaimWithWebSearch(params: {
  claim: string;
  context?: string;
}): Promise<FactVerificationResult> {
  const { claim, context } = params;
  const trimmedClaim = (claim ?? '').trim();

  if (!trimmedClaim) {
    return {
      verdict: 'unknown',
      confidence: 0,
      explanation: 'No claim provided to verify.',
      evidence: [],
      sources: [],
    };
  }

  const exaApiKey = process.env.EXA_API_KEY;
  if (!exaApiKey) {
    return {
      verdict: 'unknown',
      confidence: 0,
      explanation:
        'Web search API (Exa) is not configured, so this claim cannot be verified automatically.',
      evidence: [],
      sources: [],
    };
  }

  // 1) Run a focused web search for the claim
  let searchResults: ExaResultItem[] = [];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const response = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': exaApiKey,
      },
      body: JSON.stringify({
        query: trimmedClaim,
        num_results: 5,
        contents: {
          text: {
            max_characters: 4000,
          },
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Exa API error: ${response.statusText}`);
    }

    const data = await response.json();
    searchResults = (data.results || []) as ExaResultItem[];
  } catch (error) {
    return {
      verdict: 'unknown',
      confidence: 0,
      explanation: `Web search failed while trying to verify the claim: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
      evidence: [],
      sources: [],
    };
  }

  const provider = getOpenRouterProvider();
  const modelConfig = getModelConfig();

  const searchSummary = searchResults
    .slice(0, 5)
    .map((r, i) => {
      const title = r.title || 'Untitled';
      const url = r.url || 'unknown-url';
      const snippet = (r.text || '').substring(0, 500);
      return `Source ${i + 1}:
Title: ${title}
URL: ${url}
Snippet: ${snippet}`;
    })
    .join('\n\n');

  const synthesisPrompt = `You are a fact-checking assistant.

Task: Evaluate the following claim using the provided web search results.

CLAIM:
"${trimmedClaim}"

${context ? `CONTEXT (optional, may help disambiguate the claim):\n"${context.substring(0, 5000)}"\n\n` : ''}
WEB SEARCH RESULTS (from Exa):
${searchSummary || '(no usable search results)'}

INSTRUCTIONS:
- Carefully read the claim and the search results.
- Decide whether the claim is overall SUPPORTED, CONTRADICTED, MIXED, or UNKNOWN:
  - "supported": Multiple credible sources agree the claim is broadly true.
  - "contradicted": Multiple credible sources say the claim is false or misleading.
  - "mixed": Evidence is conflicting or only partially supports the claim.
  - "unknown": There is not enough relevant evidence to judge the claim.
- Be conservative: if evidence is weak or ambiguous, prefer "mixed" or "unknown".
- Identify 2-6 of the most relevant evidence items with short quotes or summaries.
- Prefer authoritative sources when possible.

Return a JSON object with this exact TypeScript shape:

type Result = {
  verdict: 'supported' | 'contradicted' | 'mixed' | 'unknown';
  confidence: number; // 0-1
  explanation: string; // short natural-language explanation
  evidence: {
    claimSnippet: string;
    quote: string;
    sourceTitle?: string;
    url?: string;
  }[];
  sources: {
    title: string;
    url: string;
  }[];
};

Use the web search results above as your ONLY evidence. If they are insufficient, clearly state that in the explanation.`;

  const result = await generateObject({
    model: provider.chat(modelConfig.model),
    prompt: synthesisPrompt,
    schema: FactVerificationResultSchema,
  });

  const output = result.object;

  // Deduplicate sources array by URL
  const seen = new Set<string>();
  const uniqueSources = output.sources.filter((s) => {
    const key = s.url;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    ...output,
    sources: uniqueSources,
  };
}


