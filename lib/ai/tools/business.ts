import { tool } from 'ai';
import { z } from 'zod';

export const businessTools = {
  search_opencorporates: tool({
    description:
      'Search for company information using OpenCorporates API. Returns company registration details, ownership, and director information.',
    inputSchema: z.object({
      companyName: z
        .string()
        .describe('The name of the company to search for'),
      jurisdiction: z
        .string()
        .optional()
        .describe('Optional jurisdiction code (e.g., "us", "gb", "ca")'),
    }),
    execute: async ({ companyName, jurisdiction }) => {
      try {
        const apiKey = process.env.OPENCORPORATES_API_KEY;
        const baseUrl = 'https://api.opencorporates.com/v0.4/companies/search';
        
        const params = new URLSearchParams({
          q: companyName,
          ...(jurisdiction && { jurisdiction_code: jurisdiction }),
          ...(apiKey && { api_token: apiKey }),
        });

        const response = await fetch(`${baseUrl}?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`OpenCorporates API error: ${response.statusText}`);
        }

        const data = await response.json();
        const companies = data.results?.companies || [];

        return JSON.stringify({
          query: companyName,
          jurisdiction,
          results: companies.map((c: any) => ({
            name: c.company?.name || '',
            companyNumber: c.company?.company_number || '',
            jurisdiction: c.company?.jurisdiction_code || '',
            incorporationDate: c.company?.incorporation_date || null,
            companyType: c.company?.company_type || null,
            status: c.company?.current_status || null,
            address: c.company?.registered_address_in_full || null,
            url: c.company?.opencorporates_url || null,
          })),
          totalResults: data.results?.total_count || 0,
        });
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          companyName,
        });
      }
    },
  }),

  get_world_bank_data: tool({
    description:
      'Query World Bank Open Data API for economic indicators like GDP, trade, employment by country and year.',
    inputSchema: z.object({
      indicator: z
        .string()
        .describe('The indicator code (e.g., "NY.GDP.MKTP.CD" for GDP, "SL.UEM.TOTL.ZS" for unemployment)'),
      country: z
        .string()
        .optional()
        .describe('ISO country code (e.g., "US", "GB", "CN"). If not provided, returns data for all countries'),
      startYear: z
        .number()
        .optional()
        .describe('Start year for the data range'),
      endYear: z
        .number()
        .optional()
        .describe('End year for the data range'),
    }),
    execute: async ({ indicator, country, startYear, endYear }) => {
      try {
        const baseUrl = 'https://api.worldbank.org/v2/country';
        const format = 'json';
        const perPage = 1000;
        
        let url = `${baseUrl}/${country || 'all'}/indicator/${indicator}?format=${format}&per_page=${perPage}`;
        
        if (startYear) {
          url += `&date=${startYear}`;
          if (endYear) {
            url += `:${endYear}`;
          }
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`World Bank API error: ${response.statusText}`);
        }

        const data = await response.json();
        
        // World Bank API returns array with metadata and data
        const metadata = data[0] || {};
        const indicators = data[1] || [];

        return JSON.stringify({
          indicator,
          country: country || 'all',
          startYear: startYear || null,
          endYear: endYear || null,
          total: metadata.total || 0,
          data: indicators.map((item: any) => ({
            country: item.country?.value || '',
            countryCode: item.countryiso3code || '',
            value: item.value,
            date: item.date || null,
            unit: item.unit || null,
          })),
        });
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          indicator,
          country,
        });
      }
    },
  }),

  search_crunchbase: tool({
    description:
      'Search Crunchbase data for startup information, funding rounds, investors, and company categories. Note: Crunchbase ODS is an AWS dataset that may require S3 access or API key.',
    inputSchema: z.object({
      query: z
        .string()
        .describe('Search query for company name, investor, or keyword'),
      entityType: z
        .enum(['organization', 'person', 'funding_round'])
        .optional()
        .describe('Type of entity to search for'),
    }),
    execute: async ({ query, entityType }) => {
      try {
        // Note: Crunchbase ODS is primarily an AWS dataset
        // This implementation uses the Crunchbase API if available
        // For ODS dataset, would need AWS S3 access
        const apiKey = process.env.CRUNCHBASE_API_KEY;
        
        if (!apiKey) {
          return JSON.stringify({
            error: 'CRUNCHBASE_API_KEY not configured. Crunchbase ODS requires AWS S3 access or API key.',
            query,
            note: 'Crunchbase ODS is an AWS dataset. For direct API access, configure CRUNCHBASE_API_KEY.',
          });
        }

        const baseUrl = 'https://api.crunchbase.com/v4/searches/organizations';
        const params = new URLSearchParams({
          user_key: apiKey,
          query,
          ...(entityType && { field_ids: entityType }),
        });

        const response = await fetch(`${baseUrl}?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Crunchbase API error: ${response.statusText}`);
        }

        const data = await response.json();

        return JSON.stringify({
          query,
          entityType: entityType || 'organization',
          results: data.entities || [],
          totalResults: data.paging?.total_items || 0,
        });
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          query,
          note: 'Crunchbase ODS is an AWS dataset. For production use, consider AWS S3 access or Crunchbase API subscription.',
        });
      }
    },
  }),
};

