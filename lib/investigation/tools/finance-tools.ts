/**
 * Finance/Macroeconomics API tools
 */

import { tool } from 'ai';
import { z } from 'zod';

export const financeTools = {
  search_fred: tool({
    description:
      'Search for financial and economic data from FRED (Federal Reserve Economic Data) including interest rates, bonds, inflation, and historical financial series.',
    inputSchema: z.object({
      seriesId: z.string().describe('FRED series ID (e.g., "GDP", "UNRATE" for unemployment)'),
      observationStart: z.string().optional().describe('Start date (YYYY-MM-DD)'),
      observationEnd: z.string().optional().describe('End date (YYYY-MM-DD)'),
    }),
    execute: async ({ seriesId, observationStart, observationEnd }) => {
      try {
        const apiKey = process.env.FRED_API_KEY || '';
        if (!apiKey) {
          return 'FRED API key not configured. Get a free API key from https://fred.stlouisfed.org/docs/api/api_key.html';
        }

        const baseUrl = 'https://api.stlouisfed.org/fred/series/observations';
        const params = new URLSearchParams({
          series_id: seriesId,
          api_key: apiKey,
          file_type: 'json',
          ...(observationStart && { observation_start: observationStart }),
          ...(observationEnd && { observation_end: observationEnd }),
        });

        const response = await fetch(`${baseUrl}?${params}`);
        if (!response.ok) {
          throw new Error(`FRED API error: ${response.statusText}`);
        }

        const data = await response.json();
        return JSON.stringify(data, null, 2);
      } catch (error) {
        return `Error searching FRED data: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },
  }),

  search_imf: tool({
    description:
      'Search for macroeconomic data from IMF Data API including GDP, fiscal balance, debt, and forecasts.',
    inputSchema: z.object({
      database: z.string().describe('Database code (e.g., "IFS" for International Financial Statistics)'),
      indicator: z.string().describe('Indicator code'),
      country: z.string().optional().describe('Country code'),
    }),
    execute: async ({ database, indicator, country }) => {
      try {
        // IMF Data API structure
        const baseUrl = 'https://www.imf.org/external/datamapper/api/v1';
        let url = `${baseUrl}/${database}/${indicator}`;
        
        if (country) {
          url += `/${country}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`IMF API error: ${response.statusText}`);
        }

        const data = await response.json();
        return JSON.stringify(data, null, 2);
      } catch (error) {
        return `Error searching IMF data: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },
  }),

  get_exchange_rate: tool({
    description:
      'Get currency exchange rates and historical FX rates from ExchangeRate.host API.',
    inputSchema: z.object({
      from: z.string().describe('Base currency code (e.g., "USD")'),
      to: z.string().describe('Target currency code (e.g., "EUR")'),
      date: z.string().optional().describe('Date for historical rate (YYYY-MM-DD)'),
    }),
    execute: async ({ from, to, date }) => {
      try {
        const baseUrl = date
          ? `https://api.exchangerate.host/${date}`
          : 'https://api.exchangerate.host/latest';
        
        const params = new URLSearchParams({
          base: from,
          symbols: to,
        });

        const response = await fetch(`${baseUrl}?${params}`);
        if (!response.ok) {
          throw new Error(`ExchangeRate API error: ${response.statusText}`);
        }

        const data = await response.json();
        return JSON.stringify(data, null, 2);
      } catch (error) {
        return `Error getting exchange rate: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },
  }),
};

