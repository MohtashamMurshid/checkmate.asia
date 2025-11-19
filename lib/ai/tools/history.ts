import { tool } from 'ai';
import { z } from 'zod';

export const historyTools = {
  get_historical_events: tool({
    description:
      'Get historical events for a specific date using History API (MuffinLabs). Returns events that occurred on a given month and day.',
    inputSchema: z.object({
      month: z
        .number()
        .min(1)
        .max(12)
        .describe('Month (1-12)'),
      day: z
        .number()
        .min(1)
        .max(31)
        .describe('Day of month (1-31)'),
    }),
    execute: async ({ month, day }) => {
      try {
        const baseUrl = `https://history.muffinlabs.com/date/${month}/${day}`;

        const response = await fetch(baseUrl);

        if (!response.ok) {
          throw new Error(`History API error: ${response.statusText}`);
        }

        const data = await response.json();

        return JSON.stringify({
          date: `${month}/${day}`,
          events: data.data?.Events || [],
          births: data.data?.Births || [],
          deaths: data.data?.Deaths || [],
        });
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          month,
          day,
        });
      }
    },
  }),

  search_pleiades: tool({
    description:
      'Search Pleiades database for historical places including ancient cities, regions, and geographical locations.',
    inputSchema: z.object({
      query: z
        .string()
        .describe('Search query for place name or location'),
      limit: z
        .number()
        .optional()
        .default(10)
        .describe('Maximum number of results to return (default: 10)'),
    }),
    execute: async ({ query, limit = 10 }) => {
      try {
        // Pleiades uses a REST API
        const baseUrl = 'https://pleiades.stoa.org/api/places';
        const params = new URLSearchParams({
          title: query,
          limit: limit.toString(),
        });

        const response = await fetch(`${baseUrl}?${params.toString()}`, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Pleiades API error: ${response.statusText}`);
        }

        const data = await response.json();

        return JSON.stringify({
          query,
          totalResults: data.length || 0,
          results: (data || []).map((place: any) => ({
            id: place.id || '',
            title: place.title || '',
            description: place.description || '',
            details: place.details || '',
            names: place.names || [],
            location: place.reprPoint ? {
              lat: place.reprPoint[1],
              lon: place.reprPoint[0],
            } : null,
            uri: place.uri || null,
            created: place.created || null,
            modified: place.modified || null,
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

  get_pleiades_place: tool({
    description:
      'Get detailed information about a specific historical place from Pleiades by place ID.',
    inputSchema: z.object({
      placeId: z
        .string()
        .describe('Pleiades place ID'),
    }),
    execute: async ({ placeId }) => {
      try {
        const baseUrl = `https://pleiades.stoa.org/api/places/${placeId}`;

        const response = await fetch(baseUrl, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Pleiades API error: ${response.statusText}`);
        }

        const place = await response.json();

        return JSON.stringify({
          id: place.id || '',
          title: place.title || '',
          description: place.description || '',
          details: place.details || '',
          names: place.names || [],
          location: place.reprPoint ? {
            lat: place.reprPoint[1],
            lon: place.reprPoint[0],
          } : null,
          uri: place.uri || null,
          created: place.created || null,
          modified: place.modified || null,
          connections: place.connections || [],
        });
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          placeId,
        });
      }
    },
  }),

  search_europeana: tool({
    description:
      'Search Europeana API for cultural heritage items including artifacts, images, books, and other cultural objects.',
    inputSchema: z.object({
      query: z
        .string()
        .describe('Search query for cultural heritage items'),
      limit: z
        .number()
        .optional()
        .default(10)
        .describe('Maximum number of results to return (default: 10)'),
      media: z
        .boolean()
        .optional()
        .describe('Filter to items with media (images, videos)'),
      type: z
        .enum(['IMAGE', 'TEXT', 'VIDEO', 'SOUND', '3D'])
        .optional()
        .describe('Filter by media type'),
    }),
    execute: async ({ query, limit = 10, media, type }) => {
      try {
        const apiKey = process.env.EUROPEANA_API_KEY;
        
        if (!apiKey) {
          return JSON.stringify({
            error: 'EUROPEANA_API_KEY not configured. Get a free API key from https://pro.europeana.eu/page/apis',
            query,
          });
        }

        const baseUrl = 'https://api.europeana.eu/record/v2/search.json';
        const params = new URLSearchParams({
          wskey: apiKey,
          query,
          rows: limit.toString(),
          ...(media && { media: 'true' }),
          ...(type && { type }),
        });

        const response = await fetch(`${baseUrl}?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Europeana API error: ${response.statusText}`);
        }

        const data = await response.json();

        return JSON.stringify({
          query,
          totalResults: data.totalResults || 0,
          results: (data.items || []).map((item: any) => ({
            id: item.id || '',
            title: item.title?.[0] || '',
            description: item.dcDescription?.[0] || '',
            creator: item.dcCreator || [],
            date: item.dcDate?.[0] || null,
            type: item.type || null,
            dataProvider: item.dataProvider?.[0] || null,
            provider: item.provider || null,
            edmPreview: item.edmPreview?.[0] || null,
            edmIsShownBy: item.edmIsShownBy?.[0] || null,
            edmIsShownAt: item.edmIsShownAt?.[0] || null,
            europeanaCollectionName: item.europeanaCollectionName || [],
            language: item.dcLanguage || [],
            rights: item.rights || [],
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
};

