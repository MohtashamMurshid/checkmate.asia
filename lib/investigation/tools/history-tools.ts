/**
 * Human History API tools
 */

import { tool } from 'ai';
import { z } from 'zod';

export const historyTools = {
  get_historical_events: tool({
    description:
      'Get historical events for a specific date from History API (MuffinLabs).',
    inputSchema: z.object({
      month: z.number().describe('Month (1-12)'),
      day: z.number().describe('Day (1-31)'),
    }),
    execute: async ({ month, day }) => {
      try {
        const baseUrl = 'https://history.muffinlabs.com/date';
        const response = await fetch(`${baseUrl}/${month}/${day}`);

        if (!response.ok) {
          throw new Error(`History API error: ${response.statusText}`);
        }

        const data = await response.json();
        return JSON.stringify(data, null, 2);
      } catch (error) {
        return `Error fetching historical events: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },
  }),

  search_pleiades: tool({
    description:
      'Search Pleiades for information about historical places, ancient cities, and regions.',
    inputSchema: z.object({
      query: z.string().describe('Search term for historical place or region'),
    }),
    execute: async ({ query }) => {
      try {
        // Pleiades uses a REST API
        const baseUrl = 'https://pleiades.stoa.org/places';
        const searchUrl = `${baseUrl}/search`;
        const params = new URLSearchParams({
          q: query,
        });

        const response = await fetch(`${searchUrl}?${params}`);
        if (!response.ok) {
          throw new Error(`Pleiades API error: ${response.statusText}`);
        }

        const data = await response.json();
        return JSON.stringify(data, null, 2);
      } catch (error) {
        return `Error searching Pleiades: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },
  }),

  search_europeana: tool({
    description:
      'Search Europeana API for cultural heritage artifacts, images, books, and historical documents.',
    inputSchema: z.object({
      query: z.string().describe('Search query for cultural heritage items'),
      limit: z.number().optional().describe('Maximum number of results (default: 10)'),
    }),
    execute: async ({ query, limit = 10 }) => {
      try {
        const apiKey = process.env.EUROPEANA_API_KEY || '';
        if (!apiKey) {
          return 'Europeana API key not configured. Get a free API key from https://pro.europeana.eu/page/apis';
        }

        const baseUrl = 'https://api.europeana.eu/record/v2/search.json';
        const params = new URLSearchParams({
          wskey: apiKey,
          query: query,
          rows: limit.toString(),
        });

        const response = await fetch(`${baseUrl}?${params}`);
        if (!response.ok) {
          throw new Error(`Europeana API error: ${response.statusText}`);
        }

        const data = await response.json();
        return JSON.stringify(data, null, 2);
      } catch (error) {
        return `Error searching Europeana: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },
  }),
};

