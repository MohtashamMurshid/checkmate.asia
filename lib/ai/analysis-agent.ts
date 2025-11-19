import { tool } from 'ai';
import { z } from 'zod';
import { generateText } from 'ai';
import { getOpenRouterProvider, getModelConfig } from './config';
import { stepCountIs } from 'ai';

/**
 * Analysis agent tools - used by the nested analysis agent
 */
export const analysisTools = {
  search_web: tool({
    description:
      'Search the web for information related to the content being analyzed. Use this to find related articles, news, and sources.',
    inputSchema: z.object({
      query: z.string().describe('The search query to look up'),
    }),
    execute: async ({ query }) => {
      try {
        const exaApiKey = process.env.EXA_API_KEY;
        if (!exaApiKey) {
          return JSON.stringify({
            error: 'EXA_API_KEY not configured',
            query,
          });
        }

        const response = await fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': exaApiKey,
          },
          body: JSON.stringify({
            query,
            num_results: 10,
            contents: {
              text: {
                max_characters: 5000,
              },
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Exa API error: ${response.statusText}`);
        }

        const data = await response.json();
        const results = data.results || [];

        return JSON.stringify({
          query,
          results: results.map((r: any) => ({
            title: r.title || '',
            url: r.url || '',
            text: r.text || '',
            publishedDate: r.publishedDate || null,
          })),
        });
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          query,
        });
      }
    },
  }),

  find_agreeing_sources: tool({
    description:
      'Find 5+ sources that agree with or support the claims in the content. Search for sources that validate or confirm the information.',
    inputSchema: z.object({
      content: z.string().describe('The content to find agreeing sources for'),
      keyClaims: z
        .array(z.string())
        .optional()
        .describe('Key claims from the content to search for'),
    }),
    execute: async ({ content, keyClaims }) => {
      try {
        const exaApiKey = process.env.EXA_API_KEY;
        if (!exaApiKey) {
          return JSON.stringify({
            error: 'EXA_API_KEY not configured',
          });
        }

        // Build search queries from key claims or content
        const searchQueries = keyClaims && keyClaims.length > 0
          ? keyClaims.slice(0, 3) // Use top 3 claims
          : [content.substring(0, 200)]; // Use first 200 chars if no claims

        const allResults: any[] = [];

        // Search for each query
        for (const query of searchQueries) {
          const response = await fetch('https://api.exa.ai/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': exaApiKey,
            },
            body: JSON.stringify({
              query: `${query} supporting evidence`,
              num_results: 5,
              contents: {
                text: {
                  max_characters: 3000,
                },
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.results) {
              allResults.push(...data.results);
            }
          }
        }

        // Deduplicate by URL
        const uniqueResults = Array.from(
          new Map(allResults.map((r) => [r.url, r])).values()
        ).slice(0, 5);

        return JSON.stringify({
          sources: uniqueResults.map((r: any) => ({
            title: r.title || '',
            url: r.url || '',
            text: r.text || '',
            publishedDate: r.publishedDate || null,
            stance: 'agreeing',
          })),
        });
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  }),

  find_disagreeing_sources: tool({
    description:
      'Find 5+ sources that disagree with or contradict the claims in the content. Search for sources that challenge or refute the information.',
    inputSchema: z.object({
      content: z.string().describe('The content to find disagreeing sources for'),
      keyClaims: z
        .array(z.string())
        .optional()
        .describe('Key claims from the content to search for'),
    }),
    execute: async ({ content, keyClaims }) => {
      try {
        const exaApiKey = process.env.EXA_API_KEY;
        if (!exaApiKey) {
          return JSON.stringify({
            error: 'EXA_API_KEY not configured',
          });
        }

        // Build search queries from key claims or content
        const searchQueries = keyClaims && keyClaims.length > 0
          ? keyClaims.slice(0, 3) // Use top 3 claims
          : [content.substring(0, 200)]; // Use first 200 chars if no claims

        const allResults: any[] = [];

        // Search for each query with contradiction keywords
        for (const query of searchQueries) {
          const response = await fetch('https://api.exa.ai/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': exaApiKey,
            },
            body: JSON.stringify({
              query: `${query} debunked fact-checked false`,
              num_results: 5,
              contents: {
                text: {
                  max_characters: 3000,
                },
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.results) {
              allResults.push(...data.results);
            }
          }
        }

        // Deduplicate by URL
        const uniqueResults = Array.from(
          new Map(allResults.map((r) => [r.url, r])).values()
        ).slice(0, 5);

        return JSON.stringify({
          sources: uniqueResults.map((r: any) => ({
            title: r.title || '',
            url: r.url || '',
            text: r.text || '',
            publishedDate: r.publishedDate || null,
            stance: 'disagreeing',
          })),
        });
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  }),

  compare_sources: tool({
    description:
      'Compare multiple sources side by side to identify similarities, differences, and patterns. Use this after gathering agreeing and disagreeing sources.',
    inputSchema: z.object({
      sources: z
        .array(
          z.object({
            title: z.string(),
            url: z.string(),
            text: z.string(),
            stance: z.enum(['agreeing', 'disagreeing', 'neutral']).optional(),
          })
        )
        .describe('Array of sources to compare'),
    }),
    execute: async ({ sources }) => {
      // This tool provides structured comparison data
      // The actual comparison logic is done by the AI model
      return JSON.stringify({
        sources,
        comparison: {
          totalSources: sources.length,
          agreeingCount: sources.filter((s) => s.stance === 'agreeing').length,
          disagreeingCount: sources.filter((s) => s.stance === 'disagreeing')
            .length,
          neutralCount: sources.filter((s) => s.stance === 'neutral').length,
        },
      });
    },
  }),

  identify_beneficiaries: tool({
    description:
      'Identify who might benefit from the information or claims in the content. Only use this if applicable - not all content has clear beneficiaries.',
    inputSchema: z.object({
      content: z.string().describe('The content to analyze for beneficiaries'),
      context: z
        .string()
        .optional()
        .describe('Additional context about the content'),
    }),
    execute: async ({ content, context }) => {
      // This tool provides structured data for beneficiary analysis
      // The actual identification is done by the AI model
      return JSON.stringify({
        content: content.substring(0, 500),
        context,
        analysis: 'Use AI reasoning to identify potential beneficiaries',
      });
    },
  }),
};

/**
 * System prompt for the analysis agent
 */
const ANALYSIS_AGENT_PROMPT = `You are a comprehensive research and analysis agent specialized in investigating information credibility and bias.

Your workflow:
1. **Web Search**: Search the web for information related to the content being analyzed
2. **Find Agreeing Sources**: Find 5+ sources that agree with or support the claims
3. **Find Disagreeing Sources**: Find 5+ sources that disagree with or contradict the claims
4. **Compare Sources**: Compare all sources side by side to identify patterns
5. **Identify Beneficiaries**: If applicable, identify who might benefit from this information
6. **Generate Summary**: Create a comprehensive markdown summary that includes:
   - Summary of the content
   - Credibility assessment (why it might or might not be true)
   - Key factors to consider
   - Comparison of agreeing vs disagreeing sources
   - Who benefits (if applicable)
   - Final balanced assessment

Always provide thorough analysis with citations to sources. Be objective and balanced in your assessment.`;

/**
 * Run the analysis agent with extracted content
 */
export async function runAnalysisAgent(
  content: string,
  metadata?: Record<string, any>,
  sourceType?: 'twitter' | 'tiktok' | 'blog' | 'text' | 'web_search'
) {
  const provider = getOpenRouterProvider();
  const modelConfig = getModelConfig();

  // Build the analysis prompt
  let analysisPrompt = `Analyze the following content and provide a comprehensive investigation:\n\n`;
  analysisPrompt += `**Content:**\n${content}\n\n`;

  if (metadata) {
    analysisPrompt += `**Metadata:**\n${JSON.stringify(metadata, null, 2)}\n\n`;
  }

  if (sourceType) {
    analysisPrompt += `**Source Type:** ${sourceType}\n\n`;
  }

  analysisPrompt += `Please perform a comprehensive analysis using your available tools.`;

  const result = await generateText({
    model: provider.chat(modelConfig.model),
    system: ANALYSIS_AGENT_PROMPT,
    messages: [
      {
        role: 'user',
        content: analysisPrompt,
      },
    ],
    tools: analysisTools,
    stopWhen: stepCountIs(10),
  });

  return result.text;
}

