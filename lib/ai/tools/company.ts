import { tool } from 'ai';
import { z } from 'zod';

export const companyTools = {
  get_company_info: tool({
    description:
      'Retrieve information about a company including registration details, ownership, and basic facts. Useful for due diligence and research.',
    inputSchema: z.object({
      companyName: z
        .string()
        .describe('The name of the company to look up'),
    }),
    execute: async ({ companyName }) => {
      // Use Exa to search for company information
      try {
        const exaApiKey = process.env.EXA_API_KEY;
        if (!exaApiKey) {
          return JSON.stringify({
            error: 'EXA_API_KEY not configured',
            companyName,
          });
        }

        const response = await fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': exaApiKey,
          },
          body: JSON.stringify({
            query: `company information ${companyName}`,
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
          companyName,
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
          companyName,
        });
      }
    },
  }),
};

