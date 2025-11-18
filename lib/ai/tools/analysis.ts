import { tool } from 'ai';
import { z } from 'zod';
import { generateObject } from 'ai';
import { getOpenRouterProvider } from '../config';

export const analysisTools = {
  comprehensive_analysis: tool({
    description:
      'Performs comprehensive analysis of extracted content using a specialized analysis agent. This agent will search the web, find agreeing/disagreeing sources, compare them, and provide a detailed credibility assessment.',
    inputSchema: z.object({
      content: z
        .string()
        .describe('The extracted content to analyze (tweet text, TikTok transcription, blog post, etc.)'),
      metadata: z
        .string()
        .optional()
        .describe('Additional metadata in JSON format (username, author, description, etc.)'),
      sourceType: z
        .enum(['twitter', 'tiktok', 'blog', 'text'])
        .describe('The type of source the content came from'),
    }),
    execute: async ({ content, metadata, sourceType }) => {
      try {
        // Import and run the analysis agent
        const { runAnalysisAgent } = await import('../analysis-agent');
        
        // Parse metadata if provided
        let parsedMetadata: Record<string, any> = {};
        try {
          if (metadata) {
            parsedMetadata = JSON.parse(metadata);
          }
        } catch {
          // Ignore parsing errors
        }

        // Run the analysis agent
        // Map 'text' to 'web_search' for the analysis agent
        const agentSourceType = sourceType === 'text' ? 'web_search' : sourceType;
        const analysisResult = await runAnalysisAgent(
          content,
          parsedMetadata,
          agentSourceType
        );

        return analysisResult;
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          content: content.substring(0, 200),
        });
      }
    },
  }),

  analyze_and_summarize: tool({
    description:
      'Analyzes extracted content and generates a markdown summary with credibility assessment. Explains why the content might or might not be true.',
    inputSchema: z.object({
      content: z
        .string()
        .describe('The extracted content to analyze (tweet text, TikTok transcription, blog post, etc.)'),
      metadata: z
        .string()
        .optional()
        .describe('Additional metadata in JSON format (username, author, description, etc.)'),
      sourceType: z
        .enum(['twitter', 'tiktok', 'blog', 'web_search'])
        .describe('The type of source the content came from'),
    }),
    execute: async ({ content, metadata, sourceType }) => {
      // Parse metadata if provided
      let parsedMetadata: Record<string, any> = {};
      try {
        if (metadata) {
          parsedMetadata = JSON.parse(metadata);
        }
      } catch {
        // Ignore parsing errors
      }

      // Build context for analysis
      const context = {
        content,
        sourceType,
        ...parsedMetadata,
      };

      // Return structured data that the AI can use to generate the summary
      // The actual markdown generation will be done by the AI model
      return JSON.stringify({
        content,
        sourceType,
        metadata: parsedMetadata,
        analysisPrompt: `Analyze this ${sourceType} content and provide:
1. A concise summary of what the content says
2. Credibility assessment (why it might or might not be true)
3. Key factors to consider when evaluating this information

Content: ${content}
${metadata ? `Metadata: ${JSON.stringify(parsedMetadata)}` : ''}`,
      });
    },
  }),

  analyze_text: tool({
    description:
      'Analyze text for sentiment, key topics, bias detection, or other text analysis tasks. Useful for investigating claims and content.',
    inputSchema: z.object({
      text: z.string().describe('The text to analyze'),
      analysisType: z
        .enum(['sentiment', 'topics', 'bias', 'summary'])
        .describe('The type of analysis to perform'),
    }),
    execute: async ({ text, analysisType }) => {
      // Return structured data for analysis
      return JSON.stringify({
        content: text,
        sourceType: 'web_search',
        analysisType,
        analysisPrompt: `Analyze this text (${analysisType}) and provide:
1. A concise summary of what the content says
2. Credibility assessment (why it might or might not be true)
3. Key factors to consider when evaluating this information

Content: ${text}`,
      });
    },
  }),

  analyze_sentiment_political: tool({
    description:
      'Analyzes text for sentiment (positive/negative/neutral) and political leaning (left/center/right) using structured output. Returns detailed analysis with confidence scores and reasoning.',
    inputSchema: z.object({
      text: z.string().describe('The text to analyze for sentiment and political leaning'),
      context: z
        .string()
        .optional()
        .describe('Optional context about the text (e.g., source type, author)'),
    }),
    execute: async ({ text, context }) => {
      try {
        const provider = getOpenRouterProvider();
        // Use a robust model for structured output to avoid "No object generated" errors
        const modelId = 'openai/gpt-4o-mini';

        const analysisPrompt = `Analyze the following text for sentiment and political leaning.

Text to analyze:
${text}

${context ? `Context: ${context}` : ''}

Provide a detailed analysis with:
1. Sentiment classification (positive, negative, or neutral) with confidence score (0-1)
2. Detailed sentiment breakdown (percentage 0-1 for positive, negative, neutral, mixed)
3. Political leaning classification (left, center, or right) with confidence score (0-1)
4. Identification of belief drivers (psychological factors like Confirmation Bias, Availability Heuristic, etc.) present or exploited in the text
5. Overall analysis confidence score (0-1)
6. Reasoning/evidence for each classification

Be objective and base your analysis on the actual content, not assumptions.`;

        const analysisResult = await generateObject({
          model: provider.chat(modelId),
          prompt: analysisPrompt,
          schema: z.object({
            sentiment: z.object({
              classification: z.enum(['positive', 'negative', 'neutral']),
              confidence: z.number().min(0).max(1),
              breakdown: z.object({
                positive: z.number().min(0).max(1),
                negative: z.number().min(0).max(1),
                neutral: z.number().min(0).max(1),
                mixed: z.number().min(0).max(1),
              }),
              reasoning: z.string(),
            }),
            politicalLeaning: z.object({
              classification: z.enum(['left', 'center', 'right']),
              confidence: z.number().min(0).max(1),
              reasoning: z.string(),
            }),
            beliefDrivers: z.array(z.string()).describe('List of psychological factors influencing belief identified in the text'),
            overallConfidence: z.number().min(0).max(1).describe('Overall confidence in the analysis'),
          }),
        });

        return JSON.stringify(analysisResult.object);
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          text: text.substring(0, 200),
        });
      }
    },
  }),

  research_query: tool({
    description:
      'Performs comprehensive research on a topic using authoritative sources. This tool can query business databases, economic data, academic papers, factual knowledge bases, and historical records. Use this when you need to gather factual information, verify claims, or find authoritative sources about companies, economics, science, history, or general knowledge.',
    inputSchema: z.object({
      query: z
        .string()
        .describe('The research query or topic to investigate (e.g., "What is the GDP of France?", "Find papers about machine learning", "Search for information about Apple Inc.")'),
      context: z
        .string()
        .optional()
        .describe('Optional context about why this research is needed (e.g., "verifying a claim about company ownership", "checking economic data mentioned in content")'),
    }),
    execute: async ({ query, context }) => {
      const startTime = Date.now();
      try {
        console.log('[research_query] Starting research query:', query.substring(0, 100));
        
        // Import and run the research agent
        const { runResearchAgent } = await import('../research-agent');
        
        // Build the research query with context if provided
        let researchQuery = query;
        if (context) {
          researchQuery = `${query}\n\nContext: ${context}`;
        }

        // Run the research agent with timeout protection
        // This prevents the tool from hanging the entire stream
        const researchResult = await Promise.race([
          runResearchAgent(researchQuery),
          new Promise<string>((_, reject) => {
            setTimeout(() => {
              reject(new Error('Research query timed out after 18 seconds'));
            }, 18000); // Slightly longer than research agent timeout (15s)
          }),
        ]);

        const duration = Date.now() - startTime;
        console.log(`[research_query] Completed in ${duration}ms`);
        return researchResult;
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[research_query] Failed after ${duration}ms:`, error);
        // Return error as string instead of JSON to avoid double-stringification
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return `Research query failed: ${errorMessage}\n\nQuery: ${query.substring(0, 200)}${context ? `\n\nContext: ${context.substring(0, 200)}` : ''}`;
      }
    },
  }),
};

