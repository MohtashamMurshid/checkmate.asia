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
            beliefDrivers: initialData.beliefDrivers || [],
            overallConfidence: initialData.overallConfidence || 0,
          },
          exaResults: {
            sentiment: exaData.sentiment || null,
            politicalLeaning: exaData.politicalLeaning || null,
            beliefDrivers: exaData.beliefDrivers || [],
            overallConfidence: exaData.overallConfidence || 0,
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

  generate_evolution_graph: tool({
    description:
      'Generates a graph structure representing the evolution of news/events. Returns nodes and edges compatible with React Flow / @xyflow/react.',
    inputSchema: z.object({
      events: z
        .array(
          z.object({
            id: z.string().describe('Unique ID for the event'),
            label: z.string().describe('Short title of the event'),
            date: z.string().optional().describe('Date of the event'),
            source: z.string().optional().describe('Source of the info'),
            summary: z.string().optional().describe('Short description of the event'),
            url: z.string().optional().describe('Link to the source'),
            credibility: z.number().min(0).max(10).optional().describe('Credibility score (0-10)'),
            type: z.enum(['primary', 'secondary', 'related']).optional(),
          })
        )
        .describe('List of events or news points'),
      relationships: z
        .array(
          z.object({
            sourceId: z.string(),
            targetId: z.string(),
            label: z.string().optional(),
          })
        )
        .describe('Relationships between events'),
    }),
    execute: async ({ events, relationships }) => {
      const nodes = events.map((event, index) => ({
        id: event.id,
        type: 'default', // Can be customized in frontend
        data: { 
          label: event.label, 
          date: event.date, 
          source: event.source,
          summary: event.summary,
          url: event.url,
          credibility: event.credibility,
          type: event.type || 'secondary'
        },
        position: { x: 0, y: index * 100 }, // Layout will be handled by frontend library ideally, or simple vertical for now
      }));

      const edges = relationships.map((rel, index) => ({
        id: `e-${index}`,
        source: rel.sourceId,
        target: rel.targetId,
        label: rel.label,
        animated: true,
      }));

      return JSON.stringify({
        type: 'evolution_graph',
        nodes,
        edges,
      });
    },
  }),
};

