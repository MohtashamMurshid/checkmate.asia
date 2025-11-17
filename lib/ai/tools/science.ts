import { tool } from 'ai';
import { z } from 'zod';

export const scienceTools = {
  search_semantic_scholar: tool({
    description:
      'Search Semantic Scholar API for academic papers across all fields. Returns abstracts, citations, metadata, and related papers.',
    inputSchema: z.object({
      query: z
        .string()
        .describe('Search query for papers (keywords, title, author, etc.)'),
      limit: z
        .number()
        .optional()
        .default(10)
        .describe('Maximum number of results to return (default: 10)'),
      fields: z
        .string()
        .optional()
        .describe('Comma-separated fields to return (e.g., "title,abstract,authors,citationCount")'),
    }),
    execute: async ({ query, limit = 10, fields }) => {
      try {
        const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
        const baseUrl = 'https://api.semanticscholar.org/graph/v1/paper/search';
        
        const params = new URLSearchParams({
          query,
          limit: limit.toString(),
          ...(fields && { fields }),
        });

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (apiKey) {
          headers['x-api-key'] = apiKey;
        }

        const response = await fetch(`${baseUrl}?${params.toString()}`, { headers });

        if (!response.ok) {
          throw new Error(`Semantic Scholar API error: ${response.statusText}`);
        }

        const data = await response.json();

        return JSON.stringify({
          query,
          totalResults: data.total || 0,
          results: (data.data || []).map((paper: any) => ({
            paperId: paper.paperId || '',
            title: paper.title || '',
            abstract: paper.abstract || '',
            authors: paper.authors || [],
            year: paper.year || null,
            citationCount: paper.citationCount || 0,
            referenceCount: paper.referenceCount || 0,
            url: paper.url || paper.externalIds?.DOI ? `https://doi.org/${paper.externalIds.DOI}` : null,
            venue: paper.venue || null,
            fieldsOfStudy: paper.fieldsOfStudy || [],
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

  get_semantic_scholar_paper: tool({
    description:
      'Get detailed information about a specific paper from Semantic Scholar using paper ID or DOI.',
    inputSchema: z.object({
      paperId: z
        .string()
        .optional()
        .describe('Semantic Scholar paper ID'),
      doi: z
        .string()
        .optional()
        .describe('DOI of the paper'),
      fields: z
        .string()
        .optional()
        .describe('Comma-separated fields to return'),
    }),
    execute: async ({ paperId, doi, fields }) => {
      try {
        if (!paperId && !doi) {
          return JSON.stringify({
            error: 'Either paperId or doi must be provided',
          });
        }

        const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
        const identifier = paperId || `DOI:${doi}`;
        const baseUrl = `https://api.semanticscholar.org/graph/v1/paper/${identifier}`;

        const params = new URLSearchParams({
          ...(fields && { fields }),
        });

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (apiKey) {
          headers['x-api-key'] = apiKey;
        }

        const response = await fetch(`${baseUrl}?${params.toString()}`, { headers });

        if (!response.ok) {
          throw new Error(`Semantic Scholar API error: ${response.statusText}`);
        }

        const paper = await response.json();

        return JSON.stringify({
          paperId: paper.paperId || '',
          title: paper.title || '',
          abstract: paper.abstract || '',
          authors: paper.authors || [],
          year: paper.year || null,
          citationCount: paper.citationCount || 0,
          referenceCount: paper.referenceCount || 0,
          url: paper.url || paper.externalIds?.DOI ? `https://doi.org/${paper.externalIds.DOI}` : null,
          venue: paper.venue || null,
          fieldsOfStudy: paper.fieldsOfStudy || [],
          citations: paper.citations || [],
          references: paper.references || [],
        });
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          paperId,
          doi,
        });
      }
    },
  }),

  search_arxiv: tool({
    description:
      'Search arXiv API for open-access papers in physics, mathematics, computer science, biology, and other fields. Returns abstracts and metadata.',
    inputSchema: z.object({
      query: z
        .string()
        .describe('Search query (supports arXiv search syntax)'),
      maxResults: z
        .number()
        .optional()
        .default(10)
        .describe('Maximum number of results to return (default: 10)'),
      sortBy: z
        .enum(['relevance', 'lastUpdatedDate', 'submittedDate'])
        .optional()
        .default('relevance')
        .describe('Sort order for results'),
      sortOrder: z
        .enum(['ascending', 'descending'])
        .optional()
        .default('descending')
        .describe('Sort order direction'),
    }),
    execute: async ({ query, maxResults = 10, sortBy = 'relevance', sortOrder = 'descending' }) => {
      try {
        const baseUrl = 'http://export.arxiv.org/api/query';
        const params = new URLSearchParams({
          search_query: query,
          start: '0',
          max_results: maxResults.toString(),
          sortBy: sortBy,
          sortOrder: sortOrder,
        });

        const response = await fetch(`${baseUrl}?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`arXiv API error: ${response.statusText}`);
        }

        const xmlText = await response.text();
        
        // Parse XML response (simplified - in production, use proper XML parser)
        const entries = xmlText.match(/<entry>[\s\S]*?<\/entry>/g) || [];
        const results = entries.map((entry: string) => {
          const getId = (text: string) => {
            const match = text.match(/<id>(.*?)<\/id>/);
            return match ? match[1] : '';
          };
          const getTitle = (text: string) => {
            const match = text.match(/<title>(.*?)<\/title>/);
            return match ? match[1].replace(/\s+/g, ' ').trim() : '';
          };
          const getSummary = (text: string) => {
            const match = text.match(/<summary>(.*?)<\/summary>/);
            return match ? match[1].replace(/\s+/g, ' ').trim() : '';
          };
          const getAuthors = (text: string) => {
            const matches = text.matchAll(/<name>(.*?)<\/name>/g);
            return Array.from(matches).map(m => m[1]);
          };
          const getPublished = (text: string) => {
            const match = text.match(/<published>(.*?)<\/published>/);
            return match ? match[1] : null;
          };
          const getCategories = (text: string) => {
            const matches = text.matchAll(/term="([^"]+)"/g);
            return Array.from(matches).map(m => m[1]);
          };

          return {
            id: getId(entry),
            title: getTitle(entry),
            summary: getSummary(entry),
            authors: getAuthors(entry),
            published: getPublished(entry),
            categories: getCategories(entry),
            url: getId(entry),
          };
        });

        return JSON.stringify({
          query,
          totalResults: results.length,
          results,
        });
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          query,
        });
      }
    },
  }),

  search_pubmed: tool({
    description:
      'Search PubMed/NCBI E-utilities API for biomedical papers. Returns abstracts and metadata for biomedical research.',
    inputSchema: z.object({
      query: z
        .string()
        .describe('Search query (PubMed search syntax)'),
      maxResults: z
        .number()
        .optional()
        .default(10)
        .describe('Maximum number of results to return (default: 10)'),
      retmode: z
        .enum(['json', 'xml'])
        .optional()
        .default('json')
        .describe('Response format'),
    }),
    execute: async ({ query, maxResults = 10, retmode = 'json' }) => {
      try {
        // First, search for IDs
        const searchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
        const searchParams = new URLSearchParams({
          db: 'pubmed',
          term: query,
          retmax: maxResults.toString(),
          retmode: retmode,
          rettype: 'abstract',
        });

        const searchResponse = await fetch(`${searchUrl}?${searchParams.toString()}`);
        
        if (!searchResponse.ok) {
          throw new Error(`PubMed search API error: ${searchResponse.statusText}`);
        }

        const searchData = await searchResponse.json();
        const ids = searchData.esearchresult?.idlist || [];

        if (ids.length === 0) {
          return JSON.stringify({
            query,
            totalResults: 0,
            results: [],
          });
        }

        // Fetch details for the IDs
        const fetchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';
        const fetchParams = new URLSearchParams({
          db: 'pubmed',
          id: ids.join(','),
          retmode: retmode,
          rettype: 'abstract',
        });

        const fetchResponse = await fetch(`${fetchUrl}?${fetchParams.toString()}`);
        
        if (!fetchResponse.ok) {
          throw new Error(`PubMed fetch API error: ${fetchResponse.statusText}`);
        }

        if (retmode === 'json') {
          const fetchData = await fetchResponse.json();
          
          return JSON.stringify({
            query,
            totalResults: searchData.esearchresult?.count || 0,
            results: (fetchData.result || {})[ids[0]] || [],
          });
        } else {
          // XML response - simplified parsing
          const xmlText = await fetchResponse.text();
          
          return JSON.stringify({
            query,
            totalResults: searchData.esearchresult?.count || 0,
            results: ids.map((id: string) => ({
              pmid: id,
              xml: xmlText, // Return raw XML for parsing
            })),
            note: 'XML response returned. Consider using retmode=json for structured data.',
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

