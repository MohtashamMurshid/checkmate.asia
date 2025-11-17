import { tool } from 'ai';
import { z } from 'zod';

export const financeTools = {
  query_fred_data: tool({
    description:
      'Query FRED (Federal Reserve Economic Data) API for economic data series including interest rates, bonds, inflation, and other financial indicators.',
    inputSchema: z.object({
      seriesId: z
        .string()
        .optional()
        .describe('FRED series ID (e.g., "FEDFUNDS" for federal funds rate, "UNRATE" for unemployment)'),
      searchText: z
        .string()
        .optional()
        .describe('Search text to find series by keyword'),
      startDate: z
        .string()
        .optional()
        .describe('Start date in YYYY-MM-DD format'),
      endDate: z
        .string()
        .optional()
        .describe('End date in YYYY-MM-DD format'),
    }),
    execute: async ({ seriesId, searchText, startDate, endDate }) => {
      try {
        const apiKey = process.env.FRED_API_KEY;
        
        if (!apiKey) {
          return JSON.stringify({
            error: 'FRED_API_KEY not configured. Get a free API key from https://fred.stlouisfed.org/docs/api/api_key.html',
            seriesId,
            searchText,
          });
        }

        if (searchText && !seriesId) {
          // Search for series
          const searchUrl = 'https://api.stlouisfed.org/fred/series/search';
          const searchParams = new URLSearchParams({
            search_text: searchText,
            api_key: apiKey,
            file_type: 'json',
          });

          const searchResponse = await fetch(`${searchUrl}?${searchParams.toString()}`);
          
          if (!searchResponse.ok) {
            throw new Error(`FRED search API error: ${searchResponse.statusText}`);
          }

          const searchData = await searchResponse.json();
          
          return JSON.stringify({
            searchText,
            results: searchData.seriess || [],
            totalResults: searchData.seriess?.length || 0,
          });
        }

        if (!seriesId) {
          return JSON.stringify({
            error: 'Either seriesId or searchText must be provided',
          });
        }

        // Get series data
        const baseUrl = 'https://api.stlouisfed.org/fred/series/observations';
        const params = new URLSearchParams({
          series_id: seriesId,
          api_key: apiKey,
          file_type: 'json',
          ...(startDate && { observation_start: startDate }),
          ...(endDate && { observation_end: endDate }),
        });

        const response = await fetch(`${baseUrl}?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`FRED API error: ${response.statusText}`);
        }

        const data = await response.json();

        return JSON.stringify({
          seriesId,
          title: data.seriess?.[0]?.title || '',
          units: data.seriess?.[0]?.units || '',
          frequency: data.seriess?.[0]?.frequency || '',
          observations: data.observations?.map((obs: any) => ({
            date: obs.date,
            value: obs.value,
          })) || [],
          startDate: startDate || null,
          endDate: endDate || null,
        });
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          seriesId,
          searchText,
        });
      }
    },
  }),

  query_imf_data: tool({
    description:
      'Query IMF Data API for GDP, fiscal balance, debt, forecasts, and other macroeconomic indicators by country and indicator.',
    inputSchema: z.object({
      indicator: z
        .string()
        .describe('IMF indicator code (e.g., "NGDP_RPCH" for GDP growth, "GGXWDG_NGDP" for government debt)'),
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
        const baseUrl = 'https://www.imf.org/external/datamapper/api/v1';
        let url = `${baseUrl}/${indicator}`;
        
        if (country) {
          url += `/${country}`;
        }

        const params = new URLSearchParams();
        if (startYear) {
          params.append('periods', startYear.toString());
          if (endYear) {
            params.append('periods', endYear.toString());
          }
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`IMF API error: ${response.statusText}`);
        }

        const data = await response.json();

        return JSON.stringify({
          indicator,
          country: country || 'all',
          startYear: startYear || null,
          endYear: endYear || null,
          data: data.values || {},
          metadata: data.metadata || {},
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

  get_exchange_rates: tool({
    description:
      'Get current and historical currency exchange rates using ExchangeRate.host API. Free API for currency conversion.',
    inputSchema: z.object({
      baseCurrency: z
        .string()
        .optional()
        .default('USD')
        .describe('Base currency code (e.g., "USD", "EUR", "GBP")'),
      targetCurrency: z
        .string()
        .optional()
        .describe('Target currency code. If not provided, returns rates for all currencies'),
      date: z
        .string()
        .optional()
        .describe('Historical date in YYYY-MM-DD format. If not provided, returns current rates'),
    }),
    execute: async ({ baseCurrency = 'USD', targetCurrency, date }) => {
      try {
        let url = 'https://api.exchangerate.host';
        
        if (date) {
          url += `/historical?date=${date}`;
        } else {
          url += '/latest';
        }

        const params = new URLSearchParams({
          base: baseCurrency,
          ...(targetCurrency && { symbols: targetCurrency }),
        });

        url += `?${params.toString()}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`ExchangeRate API error: ${response.statusText}`);
        }

        const data = await response.json();

        return JSON.stringify({
          baseCurrency,
          targetCurrency: targetCurrency || 'all',
          date: date || data.date || 'latest',
          rates: data.rates || {},
          success: data.success !== false,
        });
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          baseCurrency,
          targetCurrency,
          date,
        });
      }
    },
  }),
};

