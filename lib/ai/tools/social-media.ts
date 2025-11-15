import { tool } from 'ai';
import { z } from 'zod';
import { Scraper } from '@the-convocation/twitter-scraper';
import OpenAI from 'openai';
import { extractTwitterId } from '../utils';

// Initialize OpenAI client for Whisper transcription
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Initialize Twitter scraper
const twitterScraper = new Scraper();

export const socialMediaTools = {
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
};

