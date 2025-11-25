import { tool } from 'ai';
import { z } from 'zod';
import { generateObject } from 'ai';
import { getOpenRouterProvider, getModelConfig } from '../config';

/**
 * Dataset Analysis Tools
 * Three specialized agents for batch text analysis:
 * 1. detect_bias - Checks for gender, religious, political bias
 * 2. analyze_sentiment_batch - Bulk sentiment analysis
 * 3. smart_fact_check - Lightweight fact-checker (only searches if needed)
 */

// Bias detection result schema
const BiasResultSchema = z.object({
  gender: z.object({
    score: z.number().min(0).max(1).describe('Gender bias score (0 = no bias, 1 = severe bias)'),
    direction: z.enum(['male', 'female', 'neutral']).describe('Direction of gender bias if present'),
    examples: z.array(z.string()).describe('Specific phrases showing gender bias'),
  }),
  religion: z.object({
    score: z.number().min(0).max(1).describe('Religious bias score (0 = no bias, 1 = severe bias)'),
    targetReligion: z.string().optional().describe('Religion being targeted if bias detected'),
    examples: z.array(z.string()).describe('Specific phrases showing religious bias'),
  }),
  political: z.object({
    score: z.number().min(0).max(1).describe('Political bias score (0 = no bias, 1 = severe bias)'),
    leaning: z.enum(['left', 'right', 'center']).describe('Political leaning detected'),
    examples: z.array(z.string()).describe('Specific phrases showing political bias'),
  }),
  overallBiasScore: z.number().min(0).max(1).describe('Combined bias score'),
  flagged: z.boolean().describe('Whether this content should be flagged for review'),
  summary: z.string().describe('Brief explanation of bias findings'),
});

// Sentiment result schema
const SentimentResultSchema = z.object({
  sentiment: z.enum(['positive', 'negative', 'neutral', 'mixed']),
  confidence: z.number().min(0).max(1),
  scores: z.object({
    positive: z.number().min(0).max(1),
    negative: z.number().min(0).max(1),
    neutral: z.number().min(0).max(1),
  }),
  reasoning: z.string().describe('Brief explanation of sentiment classification'),
});

// Fact check eligibility schema
const FactCheckEligibilitySchema = z.object({
  needsFactCheck: z.boolean().describe('Whether this content contains verifiable factual claims'),
  reason: z.string().describe('Why fact-checking is or is not needed'),
  claims: z.array(z.object({
    claim: z.string().describe('The specific factual claim'),
    type: z.enum(['statistic', 'date', 'event', 'quote', 'scientific', 'other']),
    searchQuery: z.string().describe('Optimized search query to verify this claim'),
  })).describe('List of verifiable claims found (empty if none)'),
});

// Fact check result schema
const FactCheckResultSchema = z.object({
  verified: z.boolean().describe('Whether the claims could be verified'),
  status: z.enum(['verified', 'disputed', 'unverified', 'mixed', 'no_claims']),
  confidence: z.number().min(0).max(1),
  findings: z.array(z.object({
    claim: z.string(),
    verdict: z.enum(['true', 'false', 'partially_true', 'unverifiable']),
    source: z.string().optional(),
    explanation: z.string(),
  })),
  summary: z.string(),
});

export const datasetAnalysisTools = {
  /**
   * Bias Detection Agent
   * Analyzes text for gender, religious, and political bias
   */
  detect_bias: tool({
    description: 'Analyzes text for gender, religious, and political bias. Returns severity scores and specific examples.',
    inputSchema: z.object({
      text: z.string().describe('The text to analyze for bias'),
      context: z.string().optional().describe('Optional context about the text source'),
    }),
    execute: async ({ text, context }) => {
      try {
        const provider = getOpenRouterProvider();
        const modelConfig = getModelConfig();

        const prompt = `Analyze the following text for potential bias across three dimensions: gender, religion, and political.

Text to analyze:
"${text}"

${context ? `Context: ${context}` : ''}

For each type of bias:
1. Score from 0 (no bias) to 1 (severe bias)
2. Identify specific phrases or language that indicate bias
3. Note the direction/target of bias if present

Be objective and thorough. Flag content that exceeds 0.5 overall bias score.`;

        const result = await generateObject({
          model: provider.chat(modelConfig.model),
          prompt,
          schema: BiasResultSchema,
        });

        return JSON.stringify(result.object);
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Bias detection failed',
          text: text.substring(0, 100),
        });
      }
    },
  }),

  /**
   * Sentiment Analysis Agent
   * Bulk-optimized sentiment analysis
   */
  analyze_sentiment_batch: tool({
    description: 'Analyzes text sentiment. Returns classification (positive/negative/neutral/mixed) with confidence scores.',
    inputSchema: z.object({
      text: z.string().describe('The text to analyze for sentiment'),
    }),
    execute: async ({ text }) => {
      try {
        const provider = getOpenRouterProvider();
        const modelConfig = getModelConfig();

        const prompt = `Analyze the sentiment of the following text. Classify it as positive, negative, neutral, or mixed.

Text: "${text}"

Provide:
1. Overall sentiment classification
2. Confidence score (0-1)
3. Breakdown of sentiment scores
4. Brief reasoning for your classification`;

        const result = await generateObject({
          model: provider.chat(modelConfig.model),
          prompt,
          schema: SentimentResultSchema,
        });

        return JSON.stringify(result.object);
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Sentiment analysis failed',
          text: text.substring(0, 100),
        });
      }
    },
  }),

  /**
   * Smart Fact Check Agent
   * Step 1: Determine if content has verifiable claims
   * Step 2: If yes, run web search to verify
   */
  smart_fact_check: tool({
    description: 'Lightweight fact-checker. First determines if content has verifiable claims (dates, statistics, events). If yes, runs web search to verify. Skips opinion/subjective content.',
    inputSchema: z.object({
      text: z.string().describe('The text to fact-check'),
    }),
    execute: async ({ text }) => {
      try {
        const provider = getOpenRouterProvider();
        const modelConfig = getModelConfig();

        // Step 1: Check if fact-checking is needed
        const eligibilityPrompt = `Analyze this text and determine if it contains factual claims that can be verified.

Text: "${text}"

Factual claims include:
- Statistics or numbers
- Dates or time-specific events
- Named events or incidents
- Scientific claims
- Quotes attributed to specific people

Opinions, feelings, and subjective statements do NOT need fact-checking.

If claims exist, generate optimized search queries to verify each one.`;

        const eligibilityResult = await generateObject({
          model: provider.chat(modelConfig.model),
          prompt: eligibilityPrompt,
          schema: FactCheckEligibilitySchema,
        });

        const eligibility = eligibilityResult.object;

        // If no fact-checking needed, return early
        if (!eligibility.needsFactCheck || eligibility.claims.length === 0) {
          return JSON.stringify({
            verified: true,
            status: 'no_claims',
            confidence: 1,
            findings: [],
            summary: eligibility.reason,
            skipped: true,
          });
        }

        // Step 2: Run web search for each claim (max 3 to stay efficient)
        const claimsToCheck = eligibility.claims.slice(0, 3);
        const exaApiKey = process.env.EXA_API_KEY;

        if (!exaApiKey) {
          return JSON.stringify({
            verified: false,
            status: 'unverified',
            confidence: 0,
            findings: claimsToCheck.map(c => ({
              claim: c.claim,
              verdict: 'unverifiable' as const,
              explanation: 'Web search API not configured',
            })),
            summary: 'Could not verify claims - EXA_API_KEY not configured',
          });
        }

        // Search for each claim
        const searchResults = await Promise.all(
          claimsToCheck.map(async (claim) => {
            try {
              const response = await fetch('https://api.exa.ai/search', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': exaApiKey,
                },
                body: JSON.stringify({
                  query: claim.searchQuery,
                  num_results: 3,
                  contents: {
                    text: { max_characters: 2000 },
                  },
                }),
              });

              if (!response.ok) {
                throw new Error(`Search failed: ${response.statusText}`);
              }

              const data = await response.json();
              return {
                claim: claim.claim,
                results: data.results || [],
              };
            } catch (error) {
              return {
                claim: claim.claim,
                results: [],
                error: error instanceof Error ? error.message : 'Search failed',
              };
            }
          })
        );

        // Step 3: Analyze search results to determine verdict
        const verificationPrompt = `Based on web search results, verify the following claims from the original text.

Original text: "${text}"

Claims and search results:
${searchResults.map((sr, i) => `
Claim ${i + 1}: "${sr.claim}"
Search Results:
${sr.results.slice(0, 2).map((r: any) => `- ${r.title}: ${r.text?.substring(0, 300)}...`).join('\n')}
${sr.error ? `Error: ${sr.error}` : ''}
`).join('\n')}

For each claim, determine:
1. Verdict: true, false, partially_true, or unverifiable
2. Source URL if verification found
3. Brief explanation

Then provide an overall assessment.`;

        const verificationResult = await generateObject({
          model: provider.chat(modelConfig.model),
          prompt: verificationPrompt,
          schema: FactCheckResultSchema,
        });

        return JSON.stringify(verificationResult.object);
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Fact check failed',
          text: text.substring(0, 100),
          verified: false,
          status: 'unverified',
          confidence: 0,
          findings: [],
          summary: 'Fact-checking failed due to an error',
        });
      }
    },
  }),
};

/**
 * Direct analysis functions (bypassing tool wrappers for batch processing)
 */
async function runBiasDetection(text: string): Promise<any> {
  const provider = getOpenRouterProvider();
  const modelConfig = getModelConfig();

  const prompt = `Analyze the following text for potential bias across three dimensions: gender, religion, and political.

Text to analyze:
"${text}"

For each type of bias:
1. Score from 0 (no bias) to 1 (severe bias)
2. Identify specific phrases or language that indicate bias
3. Note the direction/target of bias if present

Be objective and thorough. Flag content that exceeds 0.5 overall bias score.`;

  const result = await generateObject({
    model: provider.chat(modelConfig.model),
    prompt,
    schema: BiasResultSchema,
  });

  return result.object;
}

async function runSentimentAnalysis(text: string): Promise<any> {
  const provider = getOpenRouterProvider();
  const modelConfig = getModelConfig();

  const prompt = `Analyze the sentiment of the following text. Classify it as positive, negative, neutral, or mixed.

Text: "${text}"

Provide:
1. Overall sentiment classification
2. Confidence score (0-1)
3. Breakdown of sentiment scores
4. Brief reasoning for your classification`;

  const result = await generateObject({
    model: provider.chat(modelConfig.model),
    prompt,
    schema: SentimentResultSchema,
  });

  return result.object;
}

async function runFactCheck(text: string): Promise<any> {
  const provider = getOpenRouterProvider();
  const modelConfig = getModelConfig();

  // Step 1: Check if fact-checking is needed
  const eligibilityPrompt = `Analyze this text and determine if it contains factual claims that can be verified.

Text: "${text}"

Factual claims include:
- Statistics or numbers
- Dates or time-specific events
- Named events or incidents
- Scientific claims
- Quotes attributed to specific people

Opinions, feelings, and subjective statements do NOT need fact-checking.

If claims exist, generate optimized search queries to verify each one.`;

  const eligibilityResult = await generateObject({
    model: provider.chat(modelConfig.model),
    prompt: eligibilityPrompt,
    schema: FactCheckEligibilitySchema,
  });

  const eligibility = eligibilityResult.object;

  // If no fact-checking needed, return early
  if (!eligibility.needsFactCheck || eligibility.claims.length === 0) {
    return {
      verified: true,
      status: 'no_claims',
      confidence: 1,
      findings: [],
      summary: eligibility.reason,
      skipped: true,
    };
  }

  // Step 2: Run web search for each claim (max 3)
  const claimsToCheck = eligibility.claims.slice(0, 3);
  const exaApiKey = process.env.EXA_API_KEY;

  if (!exaApiKey) {
    return {
      verified: false,
      status: 'unverified',
      confidence: 0,
      findings: claimsToCheck.map(c => ({
        claim: c.claim,
        verdict: 'unverifiable' as const,
        explanation: 'Web search API not configured',
      })),
      summary: 'Could not verify claims - EXA_API_KEY not configured',
    };
  }

  // Search for each claim
  const searchResults = await Promise.all(
    claimsToCheck.map(async (claim) => {
      try {
        const response = await fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': exaApiKey,
          },
          body: JSON.stringify({
            query: claim.searchQuery,
            num_results: 3,
            contents: {
              text: { max_characters: 2000 },
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }

        const data = await response.json();
        return {
          claim: claim.claim,
          results: data.results || [],
        };
      } catch (error) {
        return {
          claim: claim.claim,
          results: [],
          error: error instanceof Error ? error.message : 'Search failed',
        };
      }
    })
  );

  // Step 3: Analyze search results
  const verificationPrompt = `Based on web search results, verify the following claims from the original text.

Original text: "${text}"

Claims and search results:
${searchResults.map((sr, i) => `
Claim ${i + 1}: "${sr.claim}"
Search Results:
${sr.results.slice(0, 2).map((r: any) => `- ${r.title}: ${r.text?.substring(0, 300)}...`).join('\n')}
${sr.error ? `Error: ${sr.error}` : ''}
`).join('\n')}

For each claim, determine:
1. Verdict: true, false, partially_true, or unverifiable
2. Source URL if verification found
3. Brief explanation

Then provide an overall assessment.`;

  const verificationResult = await generateObject({
    model: provider.chat(modelConfig.model),
    prompt: verificationPrompt,
    schema: FactCheckResultSchema,
  });

  return verificationResult.object;
}

/**
 * Batch analysis function for the API route
 * Runs all three agents in parallel for a single row
 */
export async function analyzeRow(
  text: string,
  options: { checkBias?: boolean; checkSentiment?: boolean; checkFacts?: boolean } = {}
): Promise<{
  text: string;
  bias?: any;
  sentiment?: any;
  factCheck?: any;
  error?: string;
}> {
  const { checkBias = true, checkSentiment = true, checkFacts = true } = options;

  try {
    const promises: Promise<any>[] = [];
    const resultKeys: string[] = [];

    if (checkBias) {
      promises.push(runBiasDetection(text).catch(e => ({ error: e.message })));
      resultKeys.push('bias');
    }

    if (checkSentiment) {
      promises.push(runSentimentAnalysis(text).catch(e => ({ error: e.message })));
      resultKeys.push('sentiment');
    }

    if (checkFacts) {
      promises.push(runFactCheck(text).catch(e => ({ error: e.message })));
      resultKeys.push('factCheck');
    }

    const results = await Promise.all(promises);

    const output: any = { text };
    results.forEach((result, i) => {
      output[resultKeys[i]] = result;
    });

    return output;
  } catch (error) {
    return {
      text,
      error: error instanceof Error ? error.message : 'Analysis failed',
    };
  }
}

