/**
 * Science/Research/Academia API tools
 */

import { tool } from 'ai';
import { z } from 'zod';

export const scienceTools = {
  search_semantic_scholar: tool({
    description:
      'Search for academic papers, abstracts, citations, and metadata from Semantic Scholar API across all scientific fields.',
    inputSchema: z.object({
      query: z.string().describe('Search query for papers, authors, or topics'),
      limit: z.number().optional().describe('Maximum number of results (default: 10)'),
    }),
    execute: async ({ query, limit = 10 }) => {
      try {
        const baseUrl = 'https://api.semanticscholar.org/graph/v1/paper/search';
        const params = new URLSearchParams({
          query,
          limit: limit.toString(),
          fields: 'title,authors,year,abstract,citationCount,referenceCount',
        });

        const response = await fetch(`${baseUrl}?${params}`);
        if (!response.ok) {
          throw new Error(`Semantic Scholar API error: ${response.statusText}`);
        }

        const data = await response.json();
        return JSON.stringify(data, null, 2);
      } catch (error) {
        return `Error searching Semantic Scholar: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },
  }),

  search_arxiv: tool({
    description:
      'Search for open-access research papers from arXiv in physics, mathematics, computer science, biology, and other fields.',
    inputSchema: z.object({
      query: z.string().describe('Search query for papers'),
      maxResults: z.number().optional().describe('Maximum number of results (default: 10)'),
    }),
    execute: async ({ query, maxResults = 10 }) => {
      try {
        const baseUrl = 'http://export.arxiv.org/api/query';
        const params = new URLSearchParams({
          search_query: query,
          start: '0',
          max_results: maxResults.toString(),
        });

        const response = await fetch(`${baseUrl}?${params}`);
        if (!response.ok) {
          throw new Error(`arXiv API error: ${response.statusText}`);
        }

        const xml = await response.text();
        // Simple XML parsing - in production, use a proper XML parser
        return xml;
      } catch (error) {
        return `Error searching arXiv: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },
  }),

  search_pubmed: tool({
    description:
      'Search for biomedical research papers, abstracts, and metadata from PubMed/NCBI E-utilities.',
    inputSchema: z.object({
      query: z.string().describe('Search query for biomedical papers'),
      maxResults: z.number().optional().describe('Maximum number of results (default: 10)'),
    }),
    execute: async ({ query, maxResults = 10 }) => {
      try {
        // First, search for IDs
        const searchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
        const searchParams = new URLSearchParams({
          db: 'pubmed',
          term: query,
          retmax: maxResults.toString(),
          retmode: 'json',
        });

        const searchResponse = await fetch(`${searchUrl}?${searchParams}`);
        if (!searchResponse.ok) {
          throw new Error(`PubMed search error: ${searchResponse.statusText}`);
        }

        const searchData = await searchResponse.json();
        const ids = searchData.esearchresult?.idlist || [];

        if (ids.length === 0) {
          return JSON.stringify({ count: 0, results: [] }, null, 2);
        }

        // Then fetch details
        const fetchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';
        const fetchParams = new URLSearchParams({
          db: 'pubmed',
          id: ids.join(','),
          retmode: 'xml',
        });

        const fetchResponse = await fetch(`${fetchUrl}?${fetchParams}`);
        if (!fetchResponse.ok) {
          throw new Error(`PubMed fetch error: ${fetchResponse.statusText}`);
        }

        const xml = await fetchResponse.text();
        return xml;
      } catch (error) {
        return `Error searching PubMed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },
  }),
};

