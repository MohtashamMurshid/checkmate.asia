import { tool } from 'ai';
import { z } from 'zod';

export const factualTools = {
  query_wikidata_sparql: tool({
    description:
      'Execute SPARQL queries against Wikidata to retrieve structured knowledge about people, places, events, and other entities.',
    inputSchema: z.object({
      query: z
        .string()
        .describe('SPARQL query string to execute against Wikidata'),
    }),
    execute: async ({ query }) => {
      try {
        const baseUrl = 'https://query.wikidata.org/sparql';
        const params = new URLSearchParams({
          query,
          format: 'json',
        });

        const response = await fetch(`${baseUrl}?${params.toString()}`, {
          headers: {
            'Accept': 'application/sparql-results+json',
            'User-Agent': 'ResearchBot/1.0',
          },
        });

        if (!response.ok) {
          throw new Error(`Wikidata SPARQL API error: ${response.statusText}`);
        }

        const data = await response.json();

        return JSON.stringify({
          query,
          results: data.results?.bindings || [],
          head: data.head || {},
        });
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          query,
        });
      }
    },
  }),

  search_wikipedia: tool({
    description:
      'Search Wikipedia using the MediaWiki API. Returns page titles, summaries, and content.',
    inputSchema: z.object({
      query: z
        .string()
        .describe('Search query for Wikipedia pages'),
      limit: z
        .number()
        .optional()
        .default(10)
        .describe('Maximum number of results to return (default: 10)'),
    }),
    execute: async ({ query, limit = 10 }) => {
      try {
        // First, search for pages
        const searchUrl = 'https://en.wikipedia.org/w/api.php';
        const searchParams = new URLSearchParams({
          action: 'query',
          list: 'search',
          srsearch: query,
          srlimit: limit.toString(),
          format: 'json',
          origin: '*',
        });

        const searchResponse = await fetch(`${searchUrl}?${searchParams.toString()}`);
        
        if (!searchResponse.ok) {
          throw new Error(`Wikipedia search API error: ${searchResponse.statusText}`);
        }

        const searchData = await searchResponse.json();
        const searchResults = searchData.query?.search || [];

        // Get page content for top results
        const pageIds = searchResults.slice(0, 5).map((r: any) => r.pageid).join('|');
        
        let pages: any[] = [];
        if (pageIds) {
          const contentParams = new URLSearchParams({
            action: 'query',
            pageids: pageIds,
            prop: 'extracts|info',
            exintro: 'true',
            explaintext: 'true',
            format: 'json',
            origin: '*',
          });

          const contentResponse = await fetch(`${searchUrl}?${contentParams.toString()}`);
          
          if (contentResponse.ok) {
            const contentData = await contentResponse.json();
            pages = Object.values(contentData.query?.pages || {});
          }
        }

        return JSON.stringify({
          query,
          totalResults: searchData.query?.searchinfo?.totalhits || 0,
          results: searchResults.map((result: any) => {
            const page = pages.find((p: any) => p.pageid === result.pageid);
            return {
              title: result.title,
              pageId: result.pageid,
              snippet: result.snippet,
              size: result.size,
              wordCount: result.wordcount,
              extract: page?.extract || null,
              url: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title)}`,
            };
          }),
        });
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          query,
        });
      }
    },
  }),

  get_wikipedia_page: tool({
    description:
      'Get full content and metadata for a specific Wikipedia page by title.',
    inputSchema: z.object({
      title: z
        .string()
        .describe('Title of the Wikipedia page'),
      extractOnly: z
        .boolean()
        .optional()
        .default(true)
        .describe('Return only extract (intro) or full content'),
    }),
    execute: async ({ title, extractOnly = true }) => {
      try {
        const baseUrl = 'https://en.wikipedia.org/w/api.php';
        const params = new URLSearchParams({
          action: 'query',
          titles: title,
          prop: 'extracts|info|categories',
          ...(extractOnly && { exintro: 'true' }),
          explaintext: 'true',
          format: 'json',
          origin: '*',
        });

        const response = await fetch(`${baseUrl}?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Wikipedia API error: ${response.statusText}`);
        }

        const data = await response.json();
        const pages = data.query?.pages || {};
        const page = Object.values(pages)[0] as any;

        if (!page || page.missing) {
          return JSON.stringify({
            error: 'Page not found',
            title,
          });
        }

        return JSON.stringify({
          title: page.title,
          pageId: page.pageid,
          extract: page.extract || '',
          fullUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
          lastModified: page.touched || null,
          length: page.length || 0,
          categories: page.categories?.map((c: any) => c.title) || [],
        });
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          title,
        });
      }
    },
  }),

  query_dbpedia: tool({
    description:
      'Query DBpedia SPARQL endpoint for structured knowledge extracted from Wikipedia. Returns RDF data about entities.',
    inputSchema: z.object({
      query: z
        .string()
        .describe('SPARQL query string to execute against DBpedia'),
      format: z
        .enum(['json', 'xml'])
        .optional()
        .default('json')
        .describe('Response format'),
    }),
    execute: async ({ query, format = 'json' }) => {
      try {
        const baseUrl = 'https://dbpedia.org/sparql';
        const params = new URLSearchParams({
          query,
          format: format === 'json' ? 'application/sparql-results+json' : 'application/sparql-results+xml',
        });

        const response = await fetch(`${baseUrl}?${params.toString()}`, {
          headers: {
            'Accept': format === 'json' ? 'application/sparql-results+json' : 'application/sparql-results+xml',
          },
        });

        if (!response.ok) {
          throw new Error(`DBpedia SPARQL API error: ${response.statusText}`);
        }

        if (format === 'json') {
          const data = await response.json();
          
          return JSON.stringify({
            query,
            results: data.results?.bindings || [],
            head: data.head || {},
          });
        } else {
          const xmlText = await response.text();
          
          return JSON.stringify({
            query,
            xml: xmlText,
            note: 'XML response returned. Consider using format=json for structured data.',
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
};

