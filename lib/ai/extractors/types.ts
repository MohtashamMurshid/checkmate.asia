/**
 * Types for content extraction
 */

export interface ExtractedContent {
  content: string;
  metadata: Record<string, any>;
  sourceType: 'twitter' | 'tiktok' | 'blog' | 'text';
}

