import { detectInputType, extractTwitterId, extractTikTokId } from '@/lib/ai/utils';
import { Scraper } from '@the-convocation/twitter-scraper';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const maxDuration = 30;

const twitterScraper = new Scraper(); 
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(req: Request) {
  try {
    const { url }: { url: string } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const detection = detectInputType(url);

    if (detection.type === 'twitter' && detection.url) {
      try {
        const tweetId = extractTwitterId(detection.url);
        if (!tweetId) {
          throw new Error('Could not extract tweet ID from URL');
        }

        const tweet = await twitterScraper.getTweet(tweetId);
        if (!tweet) {
          throw new Error('Tweet not found or could not be accessed');
        }

        return new Response(
          JSON.stringify({
            type: 'twitter',
            url: detection.url,
            content: tweet.text || '',
            metadata: {
              username: tweet.username || 'unknown',
              author: tweet.name || 'unknown',
              likes: tweet.likes || 0,
              retweets: tweet.retweets || 0,
              replies: tweet.replies || 0,
              createdAt: tweet.timeParsed?.toISOString() || null,
            },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: `Failed to scrape Twitter: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }
    }

    if (detection.type === 'tiktok' && detection.url) {
      try {
        if (!openai) {
          throw new Error('OpenAI API key not configured');
        }

        // Dynamically import TikTok downloader
        const Downloader = (await import('@tobyg74/tiktok-api-dl')).default;

        const videoResponse = await Downloader.Downloader(detection.url, {
          version: 'v1',
        });

        if (!videoResponse || videoResponse.status !== 'success' || !videoResponse.result) {
          throw new Error('Could not fetch TikTok video data');
        }

        const videoData = videoResponse.result;
        const metadata = {
          description: videoData.desc || '',
          author: videoData.author?.nickname || 'unknown',
          videoUrl: videoData.videoHD || videoData.videoSD || videoData.videoWatermark || null,
          duration: videoData.video?.duration || 0,
          likes: typeof videoData.statistics?.likeCount === 'string'
            ? parseInt(videoData.statistics.likeCount)
            : videoData.statistics?.likeCount || 0,
        };

        return new Response(
          JSON.stringify({
            type: 'tiktok',
            url: detection.url,
            content: metadata.description,
            metadata,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: `Failed to scrape TikTok: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Unsupported URL type' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in preview API:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An error occurred while fetching preview',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

