/**
 * Plain text content extractor
 */

import type { ExtractedContent } from './types';

export function extractTextContent(input: string): ExtractedContent {
  return {
    content: input,
    metadata: {},
    sourceType: 'text',
  };
}

