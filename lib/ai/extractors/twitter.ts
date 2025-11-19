/**
 * Twitter content extractor
 */

import { twitterScraper } from '../services';
import { extractTwitterId } from '../utils';
import type { ExtractedContent } from './types';

export async function extractTwitterContent(url: string): Promise<ExtractedContent> {
  try {
    const tweetId = extractTwitterId(url);
    if (!tweetId) {
      throw new Error('Could not extract tweet ID from URL');
    }

    const tweet = await twitterScraper.getTweet(tweetId);
    if (!tweet) {
      throw new Error('Tweet not found or could not be accessed');
    }

    return {
      content: tweet.text || '',
      metadata: {
        username: tweet.username || 'unknown',
        author: tweet.name || 'unknown',
        likes: tweet.likes || 0,
        retweets: tweet.retweets || 0,
        replies: tweet.replies || 0,
        createdAt: tweet.timeParsed?.toISOString() || null,
        url,
      },
      sourceType: 'twitter',
    };
  } catch (error) {
    throw new Error(
      `Failed to scrape Twitter: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

