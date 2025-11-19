/**
 * Blog content extractor using Exa API
 */

import type { ExtractedContent } from './types';

export async function extractBlogContent(url: string): Promise<ExtractedContent> {
  try {
    const exaApiKey = process.env.EXA_API_KEY;
    if (!exaApiKey) {
      throw new Error('EXA_API_KEY not configured');
    }

    const response = await fetch('https://api.exa.ai/contents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': exaApiKey,
      },
      body: JSON.stringify({
        urls: [url],
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

    return {
      content: result?.text || '',
      metadata: {
        title: result?.title || '',
        url,
        publishedDate: result?.publishedDate || null,
        author: result?.author || null,
      },
      sourceType: 'blog',
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch blog content: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

