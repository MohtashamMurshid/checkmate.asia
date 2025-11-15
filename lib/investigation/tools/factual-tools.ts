/**
 * Factual/General Knowledge API tools
 */

import { tool } from 'ai';
import { z } from 'zod';

export const factualTools = {
  query_wikidata: tool({
    description:
      'Query Wikidata SPARQL API for structured knowledge graph data about people, places, events, and facts.',
    inputSchema: z.object({
      query: z.string().describe('SPARQL query string or natural language description of what to search for'),
    }),
    execute: async ({ query }) => {
      try {
        // If it looks like a SPARQL query, use it directly; otherwise, construct a simple query
        let sparqlQuery = query;
        
        if (!query.trim().toUpperCase().startsWith('SELECT')) {
          // Construct a simple SPARQL query from natural language
          const searchTerm = query.trim();
          sparqlQuery = `
            SELECT ?item ?itemLabel ?description WHERE {
              ?item ?label "${searchTerm}"@en .
              ?item schema:description ?description .
              FILTER(LANG(?description) = "en")
              SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
            }
            LIMIT 10
          `;
        }

        const baseUrl = 'https://query.wikidata.org/sparql';
        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/sparql-results+json',
          },
          body: new URLSearchParams({
            query: sparqlQuery,
          }),
        });

        if (!response.ok) {
          throw new Error(`Wikidata API error: ${response.statusText}`);
        }

        const data = await response.json();
        return JSON.stringify(data, null, 2);
      } catch (error) {
        return `Error querying Wikidata: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },
  }),

  search_wikipedia: tool({
    description:
      'Search Wikipedia API for page content, categories, and historical summaries.',
    inputSchema: z.object({
      query: z.string().describe('Search query for Wikipedia pages'),
      limit: z.number().optional().describe('Maximum number of results (default: 5)'),
    }),
    execute: async ({ query, limit = 5 }) => {
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

        const searchResponse = await fetch(`${searchUrl}?${searchParams}`);
        if (!searchResponse.ok) {
          throw new Error(`Wikipedia search error: ${searchResponse.statusText}`);
        }

        const searchData = await searchResponse.json();
        const pageIds = searchData.query?.search?.map((item: { pageid: number }) => item.pageid) || [];

        if (pageIds.length === 0) {
          return JSON.stringify({ count: 0, results: [] }, null, 2);
        }

        // Then fetch page content
        const contentParams = new URLSearchParams({
          action: 'query',
          pageids: pageIds.join('|'),
          prop: 'extracts|info',
          exintro: 'true',
          explaintext: 'true',
          format: 'json',
          origin: '*',
        });

        const contentResponse = await fetch(`${searchUrl}?${contentParams}`);
        if (!contentResponse.ok) {
          throw new Error(`Wikipedia content error: ${contentResponse.statusText}`);
        }

        const contentData = await contentResponse.json();
        return JSON.stringify(contentData, null, 2);
      } catch (error) {
        return `Error searching Wikipedia: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },
  }),

  query_dbpedia: tool({
    description:
      'Query DBpedia for structured historical and factual knowledge extracted from Wikipedia.',
    inputSchema: z.object({
      query: z.string().describe('SPARQL query or search term for DBpedia'),
    }),
    execute: async ({ query }) => {
      try {
        // Construct SPARQL query
        let sparqlQuery = query;
        
        if (!query.trim().toUpperCase().startsWith('SELECT')) {
          const searchTerm = query.trim();
          sparqlQuery = `
            SELECT ?resource ?label ?abstract WHERE {
              ?resource rdfs:label ?label .
              ?resource dbo:abstract ?abstract .
              FILTER(CONTAINS(LCASE(?label), LCASE("${searchTerm}")))
              FILTER(LANG(?label) = "en")
              FILTER(LANG(?abstract) = "en")
            }
            LIMIT 10
          `;
        }

        const baseUrl = 'https://dbpedia.org/sparql';
        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/sparql-results+json',
          },
          body: new URLSearchParams({
            query: sparqlQuery,
            format: 'json',
          }),
        });

        if (!response.ok) {
          throw new Error(`DBpedia API error: ${response.statusText}`);
        }

        const data = await response.json();
        return JSON.stringify(data, null, 2);
      } catch (error) {
        return `Error querying DBpedia: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },
  }),
};

