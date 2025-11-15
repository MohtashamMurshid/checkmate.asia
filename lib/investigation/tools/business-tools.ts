/**
 * Business/Economics API tools
 */

import { tool } from 'ai';
import { z } from 'zod';

export const businessTools = {
  search_opencorporates: tool({
    description:
      'Search for company information including registration details, ownership, and directors from OpenCorporates API.',
    inputSchema: z.object({
      companyName: z.string().describe('The name of the company to search for'),
      jurisdiction: z.string().optional().describe('Jurisdiction code (e.g., "us", "gb")'),
    }),
    execute: async ({ companyName, jurisdiction }) => {
      try {
        const apiKey = process.env.OPENCORPORATES_API_KEY || '';
        const baseUrl = 'https://api.opencorporates.com/v0.4/companies/search';
        const params = new URLSearchParams({
          q: companyName,
          ...(jurisdiction && { jurisdiction_code: jurisdiction }),
          ...(apiKey && { api_token: apiKey }),
        });

        const response = await fetch(`${baseUrl}?${params}`);
        if (!response.ok) {
          throw new Error(`OpenCorporates API error: ${response.statusText}`);
        }

        const data = await response.json();
        return JSON.stringify(data, null, 2);
      } catch (error) {
        return `Error searching OpenCorporates: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },
  }),

  search_crunchbase: tool({
    description:
      'Search for startup funding information, investors, and company categories from Crunchbase. Note: This uses the AWS dataset which may require different access methods.',
    inputSchema: z.object({
      companyName: z.string().describe('The name of the company or startup to search for'),
    }),
    execute: async ({ companyName }) => {
      try {
        // Crunchbase ODS is an AWS dataset, so we'll need to provide instructions
        // For now, return information about how to access it
        return `Crunchbase Open Data Set (ODS) is available on AWS. To access:
1. Visit: https://aws.amazon.com/datasets/crunchbase/
2. The dataset contains funding rounds, investors, and company information
3. Search for company: "${companyName}"
Note: Direct API access may require AWS credentials and dataset subscription.`;
      } catch (error) {
        return `Error accessing Crunchbase data: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },
  }),

  search_world_bank: tool({
    description:
      'Search for economic indicators, GDP, trade, and employment data from World Bank Open Data API.',
    inputSchema: z.object({
      indicator: z.string().describe('Economic indicator code (e.g., "NY.GDP.MKTP.CD" for GDP)'),
      country: z.string().optional().describe('Country code (ISO 3-letter, e.g., "USA", "GBR")'),
      year: z.string().optional().describe('Year (e.g., "2020")'),
    }),
    execute: async ({ indicator, country, year }) => {
      try {
        const baseUrl = 'https://api.worldbank.org/v2/country';
        let url = `${baseUrl}/${country || 'all'}/indicator/${indicator}?format=json`;
        
        if (year) {
          url += `&date=${year}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`World Bank API error: ${response.statusText}`);
        }

        const data = await response.json();
        return JSON.stringify(data, null, 2);
      } catch (error) {
        return `Error searching World Bank data: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },
  }),
};

