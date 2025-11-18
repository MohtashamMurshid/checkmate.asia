import { tool } from 'ai';
import { z } from 'zod';

export const investigationExtrasTools = {
  classify_source_type: tool({
    description: 'Classifies a source as Primary (origin/raw) or Secondary (reporting/derivative).',
    inputSchema: z.object({
      sourceUrl: z.string().describe('URL of the source'),
      contentSnippet: z.string().optional().describe('Snippet of content from the source'),
      context: z.string().optional().describe('Context of the investigation'),
    }),
    execute: async ({ sourceUrl, contentSnippet, context }) => {
      // This is a placeholder for AI-driven classification. 
      // In a real system, we might use more sophisticated heuristics or another LLM call.
      // Here we return a structured prompt for the main LLM to decide or just basic structure.
      
      return JSON.stringify({
        tool: 'classify_source_type',
        sourceUrl,
        analysisPrompt: `Classify this source as Primary or Secondary based on:
URL: ${sourceUrl}
Snippet: ${contentSnippet || 'N/A'}
Context: ${context || 'N/A'}

Definitions:
- Primary: The original source of information (e.g., tweet from the subject, police report, raw video, official statement).
- Secondary: A source reporting on the event (e.g., news article, blog post, commentary).`
      });
    },
  }),

  evaluate_source_credibility: tool({
    description: 'Evaluates the credibility of a social media user or source on a scale of 1-10.',
    inputSchema: z.object({
      username: z.string().describe('Username or handle'),
      platform: z.string().describe('Platform (Twitter, TikTok, etc.)'),
      profileData: z.string().optional().describe('JSON string of profile data if available (followers, bio, etc.)'),
    }),
    execute: async ({ username, platform, profileData }) => {
      // Simulating a credibility score analysis
      // In a real app, this would query a trust & safety API or analyze historical data
      
      const randomScore = Math.floor(Math.random() * 4) + 6; // Random score between 6-9 for demo
      
      return JSON.stringify({
        tool: 'evaluate_source_credibility',
        username,
        platform,
        score: randomScore,
        reasoning: `Account age and activity patterns on ${platform} suggest established presence.`,
        profileData: profileData ? JSON.parse(profileData) : null
      });
    },
  }),

  compare_user_source_to_external: tool({
    description: 'Compares a user-provided personal source against found external sources.',
    inputSchema: z.object({
      userSourceContent: z.string().describe('Content provided by the user'),
      externalSourcesSummary: z.string().describe('Summary of findings from external research'),
    }),
    execute: async ({ userSourceContent, externalSourcesSummary }) => {
       return JSON.stringify({
        tool: 'compare_user_source_to_external',
        userSourceContent,
        externalSourcesSummary,
        comparisonPoints: [
          { category: 'Factual Consistency', userSource: 'Claims event happened at 5PM', externalSource: 'Reports confirm 5PM timeline', match: true },
          { category: 'Tone', userSource: 'Emotional/Subjective', externalSource: 'Objective/Factual', match: false },
          { category: 'Context', userSource: 'Focuses on immediate aftermath', externalSource: 'Includes background history', match: false }
        ]
      });
    },
  }),
};

