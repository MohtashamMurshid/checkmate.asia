import { tool } from 'ai';
import { z } from 'zod';

export const visualizationTools = {
  generate_visualization: tool({
    description:
      'Compiles all investigation analysis results into a visualization-ready JSON structure. Includes sentiment comparison, political leaning distribution, and citation sources. Use this after completing sentiment analysis on both initial content and Exa results.',
    inputSchema: z.object({
      initialAnalysis: z
        .string()
        .describe('JSON string of sentiment/political analysis for initial content'),
      exaAnalysis: z
        .string()
        .describe('JSON string of sentiment/political analysis for Exa results summary'),
      citations: z
        .string()
        .optional()
        .describe('JSON string of citations array from Exa search'),
      exaSummary: z
        .string()
        .optional()
        .describe('Summary text from Exa search results'),
    }),
    execute: async ({ initialAnalysis, exaAnalysis, citations, exaSummary }) => {
      try {
        // Parse inputs
        let initialData: any = {};
        let exaData: any = {};
        let citationsArray: any[] = [];

        try {
          initialData = JSON.parse(initialAnalysis);
        } catch {
          initialData = { error: 'Failed to parse initial analysis' };
        }

        try {
          exaData = JSON.parse(exaAnalysis);
        } catch {
          exaData = { error: 'Failed to parse Exa analysis' };
        }

        if (citations) {
          try {
            const parsedCitations = JSON.parse(citations);
            citationsArray = Array.isArray(parsedCitations) ? parsedCitations : parsedCitations.citations || [];
          } catch {
            citationsArray = [];
          }
        }

        // Build visualization structure
        const visualization = {
          type: 'investigation_visualization',
          initialContent: {
            sentiment: initialData.sentiment || null,
            politicalLeaning: initialData.politicalLeaning || null,
          },
          exaResults: {
            sentiment: exaData.sentiment || null,
            politicalLeaning: exaData.politicalLeaning || null,
            citations: citationsArray,
            summary: exaSummary || null,
          },
          comparison: {
            sentimentDiff: {
              initial: initialData.sentiment?.classification || null,
              exa: exaData.sentiment?.classification || null,
              match: initialData.sentiment?.classification === exaData.sentiment?.classification,
            },
            politicalDiff: {
              initial: initialData.politicalLeaning?.classification || null,
              exa: exaData.politicalLeaning?.classification || null,
              match: initialData.politicalLeaning?.classification === exaData.politicalLeaning?.classification,
            },
          },
        };

        return JSON.stringify(visualization, null, 2);
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          type: 'investigation_visualization',
        });
      }
    },
  }),
};

