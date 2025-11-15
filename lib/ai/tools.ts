import { tool } from 'ai';
import { z } from 'zod';
import { Scraper } from '@the-convocation/twitter-scraper';
import OpenAI from 'openai';
import {
  extractTwitterId,
  extractTikTokId,
} from './utils';

// Initialize OpenAI client for Whisper transcription
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Initialize Twitter scraper
const twitterScraper = new Scraper();

/**
 * Tool definitions for the investigate page
 * Add, remove, or modify tools here - changes will automatically apply to the entire application
 */

export const investigateTools = {
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
        const { runAnalysisAgent } = await import('./analysis-agent');
        
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

  scrape_twitter: tool({
    description:
      'Extracts content and username from a Twitter/X post. Use this when the input is a Twitter or X.com link.',
    inputSchema: z.object({
      url: z.string().describe('The Twitter/X URL to scrape'),
    }),
    execute: async ({ url }) => {
      try {
        const tweetId = extractTwitterId(url);
        if (!tweetId) {
          return JSON.stringify({
            error: 'Could not extract tweet ID from URL',
            url,
          });
        }

        const tweet = await twitterScraper.getTweet(tweetId);
        
        if (!tweet) {
          return JSON.stringify({
            error: 'Tweet not found or could not be accessed',
            url,
          });
        }

        return JSON.stringify({
          content: tweet.text || '',
          username: tweet.username || 'unknown',
          author: tweet.name || 'unknown',
          likes: tweet.likes || 0,
          retweets: tweet.retweets || 0,
          replies: tweet.replies || 0,
          createdAt: tweet.timeParsed?.toISOString() || null,
        });
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          url,
        });
      }
    },
  }),

  scrape_tiktok: tool({
    description:
      'Downloads a TikTok video, extracts metadata (description, author), and transcribes the audio using Whisper. Use this when the input is a TikTok link.',
    inputSchema: z.object({
      url: z.string().describe('The TikTok URL to scrape and transcribe'),
    }),
    execute: async ({ url }) => {
      try {
        if (!openai) {
          return JSON.stringify({
            error: 'OpenAI API key not configured. Cannot transcribe video.',
            url,
          });
        }

        // Dynamically import TikTok downloader to avoid bundling issues with native modules
        let Downloader;
        try {
          Downloader = (await import('@tobyg74/tiktok-api-dl')).default;
        } catch (importError) {
          return JSON.stringify({
            error: 'Failed to load TikTok downloader. Native dependencies may not be available.',
            url,
            details: importError instanceof Error ? importError.message : 'Unknown import error',
          });
        }
        
        // Get video metadata and download URL using Downloader function
        const videoResponse = await Downloader.Downloader(url, {
          version: 'v1',
        });
        
        if (!videoResponse || videoResponse.status !== 'success' || !videoResponse.result) {
          return JSON.stringify({
            error: 'Could not fetch TikTok video data',
            url,
            message: videoResponse?.message || 'Unknown error',
          });
        }

        const videoData = videoResponse.result;

        // Extract metadata
        const metadata = {
          description: videoData.desc || '',
          author: videoData.author?.nickname || 'unknown',
          authorId: videoData.id || 'unknown',
          videoUrl: videoData.videoHD || videoData.videoSD || videoData.videoWatermark || videoData.video?.downloadAddr?.[0] || null,
          duration: videoData.video?.duration || 0,
          likes: typeof videoData.statistics?.likeCount === 'string' 
            ? parseInt(videoData.statistics.likeCount) 
            : videoData.statistics?.likeCount || 0,
          shares: typeof videoData.statistics?.shareCount === 'string'
            ? parseInt(videoData.statistics.shareCount)
            : videoData.statistics?.shareCount || 0,
          comments: typeof videoData.statistics?.commentCount === 'string'
            ? parseInt(videoData.statistics.commentCount)
            : videoData.statistics?.commentCount || 0,
        };

        // Transcribe video if video URL is available
        let transcription = '';
        if (metadata.videoUrl && openai) {
          try {
            // Download video to a temporary buffer
            const videoResponse = await fetch(metadata.videoUrl);
            if (!videoResponse.ok) {
              throw new Error('Failed to download video');
            }

            const videoBuffer = await videoResponse.arrayBuffer();
            const videoFile = new File(
              [videoBuffer],
              'tiktok-video.mp4',
              { type: 'video/mp4' }
            );

            // Transcribe using OpenAI Whisper
            const transcriptionResponse = await openai.audio.transcriptions.create({
              file: videoFile,
              model: 'whisper-1',
            });

            transcription = transcriptionResponse.text;
          } catch (transcriptionError) {
            console.error('Transcription error:', transcriptionError);
            transcription = `[Transcription failed: ${transcriptionError instanceof Error ? transcriptionError.message : 'Unknown error'}]`;
          }
        }

        return JSON.stringify({
          ...metadata,
          transcription,
        });
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          url,
        });
      }
    },
  }),

  search_web_exa: tool({
    description:
      'Searches the web using Exa API or fetches content from a blog post URL. Use this for plain text queries or blog post links.',
    inputSchema: z.object({
      query: z.string().describe('The search query or blog post URL'),
      isUrl: z
        .boolean()
        .optional()
        .describe('Whether the query is a URL (true) or search query (false)'),
    }),
    execute: async ({ query, isUrl = false }) => {
      try {
        const exaApiKey = process.env.EXA_API_KEY;
        if (!exaApiKey) {
          return JSON.stringify({
            error: 'EXA_API_KEY not configured',
            query,
          });
        }

        if (isUrl) {
          // Fetch content from a specific URL (blog post)
          const response = await fetch('https://api.exa.ai/contents', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': exaApiKey,
            },
            body: JSON.stringify({
              urls: [query],
              text: {
                max_characters: 10000,
              },
            }),
          });

          if (!response.ok) {
            throw new Error(`Exa API error: ${response.statusText}`);
          }

          const data = await response.json();
          const result = data.results?.[0];

          return JSON.stringify({
            url: query,
            title: result?.title || '',
            text: result?.text || '',
            publishedDate: result?.publishedDate || null,
            author: result?.author || null,
          });
        } else {
          // Perform web search
          const response = await fetch('https://api.exa.ai/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': exaApiKey,
            },
            body: JSON.stringify({
              query,
              num_results: 5,
              contents: {
                text: {
                  max_characters: 5000,
                },
              },
            }),
          });

          if (!response.ok) {
            throw new Error(`Exa API error: ${response.statusText}`);
          }

          const data = await response.json();
          const results = data.results || [];

          return JSON.stringify({
            query,
            results: results.map((r: any) => ({
              title: r.title || '',
              url: r.url || '',
              text: r.text || '',
              publishedDate: r.publishedDate || null,
            })),
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

  // Keep existing tools for backward compatibility
  search_web: tool({
    description:
      'Search the web for current information about a topic. Use this when you need up-to-date information or facts that may have changed recently.',
    inputSchema: z.object({
      query: z
        .string()
        .describe('The search query to look up on the web'),
    }),
    execute: async ({ query }) => {
      // Delegate to search_web_exa implementation
      try {
        const exaApiKey = process.env.EXA_API_KEY;
        if (!exaApiKey) {
          return JSON.stringify({
            error: 'EXA_API_KEY not configured',
            query,
          });
        }

        const response = await fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': exaApiKey,
          },
          body: JSON.stringify({
            query,
            num_results: 5,
            contents: {
              text: {
                max_characters: 5000,
              },
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Exa API error: ${response.statusText}`);
        }

        const data = await response.json();
        const results = data.results || [];

        return JSON.stringify({
          query,
          results: results.map((r: any) => ({
            title: r.title || '',
            url: r.url || '',
            text: r.text || '',
            publishedDate: r.publishedDate || null,
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

  get_company_info: tool({
    description:
      'Retrieve information about a company including registration details, ownership, and basic facts. Useful for due diligence and research.',
    inputSchema: z.object({
      companyName: z
        .string()
        .describe('The name of the company to look up'),
    }),
    execute: async ({ companyName }) => {
      // Use Exa to search for company information
      try {
        const exaApiKey = process.env.EXA_API_KEY;
        if (!exaApiKey) {
          return JSON.stringify({
            error: 'EXA_API_KEY not configured',
            companyName,
          });
        }

        const response = await fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': exaApiKey,
          },
          body: JSON.stringify({
            query: `company information ${companyName}`,
            num_results: 5,
            contents: {
              text: {
                max_characters: 5000,
              },
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Exa API error: ${response.statusText}`);
        }

        const data = await response.json();
        const results = data.results || [];

        return JSON.stringify({
          companyName,
          results: results.map((r: any) => ({
            title: r.title || '',
            url: r.url || '',
            text: r.text || '',
            publishedDate: r.publishedDate || null,
          })),
        });
      } catch (error) {
        return JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          companyName,
        });
      }
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
};

