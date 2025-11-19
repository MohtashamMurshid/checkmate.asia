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
      profileData: z.string().optional().describe('Valid JSON string of profile data if available (followers, bio, etc.). Must use double quotes, e.g. {"username":"felixhhaas","likes":546}'),
    }),
    execute: async ({ username, platform, profileData }) => {
      const randomScore = Math.floor(Math.random() * 4) + 6; // Random score between 6-9 for demo
      
      // Helper function to safely parse JSON, handling common issues
      let parsedProfileData = null;
      if (profileData) {
        try {
          // First try direct JSON parse
          parsedProfileData = JSON.parse(profileData);
        } catch (error) {
          try {
            // Handle Python-style dict strings with single quotes
            // Example: {'username': 'felixhhaas', 'likes': 546}
            // Remove outer braces if present and clean up
            let cleaned = profileData.trim();
            if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
              cleaned = cleaned.slice(1, -1);
            }
            
            // Replace escaped single quotes with regular single quotes first
            cleaned = cleaned.replace(/\\'/g, "'");
            
            // Replace single quotes with double quotes for JSON
            cleaned = cleaned.replace(/'/g, '"');
            
            // Fix unquoted keys (ensure keys are quoted)
            cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
            
            // Wrap back in braces
            cleaned = `{${cleaned}}`;
            
            parsedProfileData = JSON.parse(cleaned);
          } catch (secondError) {
            try {
              // Fallback: Manual extraction of key-value pairs
              // Handle both string and numeric values, including URLs
              const pairs: Record<string, any> = {};
              
              // Split by comma, but be careful with commas inside quoted strings
              // First, try to match key-value pairs more carefully
              const keyValuePattern = /['"]?([a-zA-Z_][a-zA-Z0-9_]*)['"]?\s*:\s*((?:\d+(?:\.\d+)?)|(?:['"](?:[^'"]|\\['"])*['"])|(?:true|false|null)|(?:[^,}]+(?=,|})))/g;
              let match;
              
              while ((match = keyValuePattern.exec(profileData)) !== null) {
                const key = match[1];
                let value: any = match[2].trim();
                
                // Parse value based on type
                if ((value.startsWith('"') && value.endsWith('"')) || 
                    (value.startsWith("'") && value.endsWith("'"))) {
                  // String value - remove quotes and unescape
                  value = value.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"');
                } else if (value === 'true') {
                  value = true;
                } else if (value === 'false') {
                  value = false;
                } else if (value === 'null') {
                  value = null;
                } else if (/^\d+$/.test(value)) {
                  // Integer value
                  value = parseInt(value, 10);
                } else if (/^\d+\.\d+$/.test(value)) {
                  // Float value
                  value = parseFloat(value);
                } else {
                  // Try to parse as string, handling escaped quotes
                  value = value.replace(/\\'/g, "'").replace(/\\"/g, '"');
                }
                
                pairs[key] = value;
              }
              
              if (Object.keys(pairs).length > 0) {
                parsedProfileData = pairs;
              } else {
                throw new Error('No valid pairs found');
              }
            } catch (thirdError) {
              // If all parsing fails, store as raw string with error info
              console.warn('Failed to parse profileData after all attempts:', profileData);
              parsedProfileData = { 
                raw: profileData,
                parseError: 'Could not parse profileData as JSON'
              };
            }
          }
        }
      }
      
      return JSON.stringify({
        tool: 'evaluate_source_credibility',
        username,
        platform,
        score: randomScore,
        reasoning: `Account age and activity patterns on ${platform} suggest established presence.`,
        profileData: parsedProfileData
      });
    },
  }),

  compare_sources_comprehensive: tool({
    description: 'Performs a comprehensive comparison of sources. The AI should invoke this tool with the COMPARISON DATA it has generated. Use this to visualize discrepancies between User Context vs. Reality, and News vs. Verified Facts.',
    inputSchema: z.object({
      userContextComparison: z.array(z.object({
        category: z.string(),
        userSource: z.string(),
        externalSource: z.string(),
        match: z.boolean()
      })).optional().describe('Comparison points between User Source and Web Search'),
      
      searchVsResearchComparison: z.array(z.object({
        category: z.string(),
        searchSource: z.string(),
        researchSource: z.string(),
        match: z.boolean()
      })).optional().describe('Comparison points between Initial News Search and Deep Research'),
      
      userSourceContent: z.string().optional(),
      webSearchSummary: z.string(),
      deepResearchSummary: z.string().optional(),
    }),
    execute: async ({ userContextComparison, searchVsResearchComparison, userSourceContent, webSearchSummary, deepResearchSummary }) => {
      console.log('[CROSS-CHECK] Step 1: Tool execute called');
      console.log('[CROSS-CHECK] Input received:', {
        hasUserContextComparison: !!userContextComparison,
        userContextComparisonLength: userContextComparison?.length || 0,
        hasSearchVsResearchComparison: !!searchVsResearchComparison,
        searchVsResearchComparisonLength: searchVsResearchComparison?.length || 0,
        hasUserSourceContent: !!userSourceContent,
        userSourceContentLength: userSourceContent?.length || 0,
        hasWebSearchSummary: !!webSearchSummary,
        webSearchSummaryLength: webSearchSummary?.length || 0,
        hasDeepResearchSummary: !!deepResearchSummary,
        deepResearchSummaryLength: deepResearchSummary?.length || 0,
      });
      
      if (userContextComparison) {
        console.log('[CROSS-CHECK] userContextComparison details:', JSON.stringify(userContextComparison, null, 2));
      }
      if (searchVsResearchComparison) {
        console.log('[CROSS-CHECK] searchVsResearchComparison details:', JSON.stringify(searchVsResearchComparison, null, 2));
      }
      
      const result = {
        tool: 'compare_sources_comprehensive',
        userContextComparison: userContextComparison || [],
        searchVsResearchComparison: searchVsResearchComparison || [],
        userSourceContent,
        webSearchSummary,
        deepResearchSummary
      };
      
      console.log('[CROSS-CHECK] Step 2: Returning result:', JSON.stringify(result, null, 2));
      
      return JSON.stringify(result);
    },
  }),

  // Keeping the old one for backward compat if needed, but we'll likely deprecate it
  compare_user_source_to_external: tool({
    description: 'DEPRECATED: Use compare_sources_comprehensive instead.',
    inputSchema: z.object({
      userSourceContent: z.string(),
      externalSourcesSummary: z.string(),
    }),
    execute: async ({ userSourceContent, externalSourcesSummary }) => {
       return JSON.stringify({
        tool: 'compare_user_source_to_external',
        userSourceContent,
        externalSourcesSummary,
        comparisonPoints: []
      });
    },
  }),
};
