import { tool } from 'ai';
import { z } from 'zod';
import { generateObject } from 'ai';
import { getOpenRouterProvider, getModelConfig } from '../config';

export const webSearchTools = {
  search_web_exa: tool({
    description:
      'Searches the web using Exa API or fetches content from a blog post URL. Use this for plain text queries or blog post links.',
    inputSchema: z.object({
      query: z.string().describe('The search query or blog post URL'),
      isUrl: z
        .boolean()
        .optional()
        .describe('Whether the query is a URL (true) or search query (false)'),
    }),
    execute: async ({ query, isUrl = false }) => {
      try {
        const exaApiKey = process.env.EXA_API_KEY;
        if (!exaApiKey) {
          return JSON.stringify({
            error: 'EXA_API_KEY not configured',
            query,
          });
        }

        if (isUrl) {
          // Fetch content from a specific URL (blog post)
          const response = await fetch('https://api.exa.ai/contents', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': exaApiKey,
            },
            body: JSON.stringify({
              urls: [query],
              text: {
                max_characters: 10000,
              },
            }),
          });

          if (!response.ok) {
            throw new Error(`Exa API error: ${response.statusText}`);
          }

          const data = await response.json();
          const result = data.results?.[0];

          return JSON.stringify({
            url: query,
            title: result?.title || '',
            text: result?.text || '',
            publishedDate: result?.publishedDate || null,
            author: result?.author || null,
          });
        } else {
          // Perform web search
          const response = await fetch('https://api.exa.ai/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': exaApiKey,
            },
            body: JSON.stringify({
              query,
              num_results: 5,
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
        }
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          query,
        });
      }
    },
  }),

  // Keep existing tools for backward compatibility
  search_web: tool({
    description:
      'Search the web for current information about a topic. Use this when you need up-to-date information or facts that may have changed recently.',
    inputSchema: z.object({
      query: z
        .string()
        .describe('The search query to look up on the web'),
    }),
    execute: async ({ query }) => {
      // Delegate to search_web_exa implementation
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
            num_results: 5,
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

  search_news_parallel: tool({
    description:
      'Searches for related news articles using 2 parallel Exa queries from different angles. Returns compiled citations and summaries. Use this after content extraction to find comprehensive news coverage.',
    inputSchema: z.object({
      content: z
        .string()
        .describe('The extracted content to search news for'),
      sourceType: z
        .enum(['twitter', 'tiktok', 'blog', 'text'])
        .describe('The type of source the content came from'),
    }),
    execute: async ({ content, sourceType }) => {
      try {
        const exaApiKey = process.env.EXA_API_KEY;
        if (!exaApiKey) {
          return JSON.stringify({
            error: 'EXA_API_KEY not configured',
            content: content.substring(0, 200),
          });
        }

        // Generate 2 different search angles
        const searchAngles = [
          content.substring(0, 200), // Main claim/content
          `${content.substring(0, 150)} news recent`, // Recent news angle
        ];

        // Run 2 parallel Exa searches
        const searchPromises = searchAngles.map(async (query) => {
          try {
            const response = await fetch('https://api.exa.ai/search', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': exaApiKey,
              },
              body: JSON.stringify({
                query,
                num_results: 2,
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
            return {
              query,
              results: (data.results || []).map((r: any) => ({
                title: r.title || '',
                url: r.url || '',
                text: r.text || '',
                publishedDate: r.publishedDate || null,
              })),
            };
          } catch (error) {
            return {
              query,
              error: error instanceof Error ? error.message : 'Unknown error',
              results: [],
            };
          }
        });

        const searchResults = await Promise.all(searchPromises);

        // Deduplicate results by URL
        const urlMap = new Map<string, any>();
        for (const searchResult of searchResults) {
          for (const result of searchResult.results) {
            if (result.url && !urlMap.has(result.url)) {
              urlMap.set(result.url, result);
            }
          }
        }

        const uniqueCitations = Array.from(urlMap.values());

        // Generate summary using AI
        const provider = getOpenRouterProvider();
        const modelConfig = getModelConfig();
        
        const summaryPrompt = `Summarize the following news articles found related to this content. Provide a concise summary highlighting key points and patterns:

Content being investigated: ${content.substring(0, 500)}

Found ${uniqueCitations.length} unique articles:
${uniqueCitations.slice(0, 10).map((c, i) => `${i + 1}. ${c.title} (${c.url})`).join('\n')}

Provide a 2-3 paragraph summary of what these articles reveal about the content.`;

        let summary = '';
        try {
          const summaryResult = await generateObject({
            model: provider.chat(modelConfig.model),
            prompt: summaryPrompt,
            schema: z.object({
              summary: z.string().describe('Summary of the news articles'),
            }),
          });
          summary = summaryResult.object.summary;
        } catch (error) {
          summary = `Found ${uniqueCitations.length} related articles. Summary generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }

        return JSON.stringify({
          citations: uniqueCitations,
          summary,
          totalResults: uniqueCitations.length,
          searchAngles: searchAngles.length,
        });
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          content: content.substring(0, 200),
        });
      }
    },
  }),
};

