/**
 * Main content extractor that routes to appropriate extractor based on input type
 */

import { detectInputType } from '../utils';
import { extractTwitterContent } from './twitter';
import { extractTikTokContent } from './tiktok';
import { extractBlogContent } from './blog';
import { extractTextContent } from './text';
import type { ExtractedContent } from './types';

/**
 * Extract content deterministically based on input type
 */
export async function extractContent(input: string): Promise<ExtractedContent> {
  const detection = detectInputType(input);

  if (detection.type === 'twitter' && detection.url) {
    return extractTwitterContent(detection.url);
  }

  if (detection.type === 'tiktok' && detection.url) {
    return extractTikTokContent(detection.url);
  }

  if (detection.type === 'blog' && detection.url) {
    return extractBlogContent(detection.url);
  }

  // Plain text input
  return extractTextContent(input);
}

