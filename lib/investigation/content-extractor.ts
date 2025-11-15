/**
 * Content extraction utilities for various input types
 */

import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import type {
  ContentExtractionResult,
  LinkPlatform,
  FileType,
} from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Detect if input is a URL
 */
function isURL(text: string): boolean {
  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Detect platform from URL
 */
function detectPlatform(url: string): LinkPlatform {
  const hostname = new URL(url).hostname.toLowerCase();
  
  if (hostname.includes('tiktok.com') || hostname.includes('vm.tiktok.com')) {
    return 'tiktok';
  }
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    return 'twitter';
  }
  return 'blog';
}

/**
 * Small delay helper for retry backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Try downloading TikTok metadata with version fallback and limited retries
 * Attempts downloader versions in order: v3 -> v2 -> v1
 */
async function downloadTikTokWithFallback(
  url: string
): Promise<{ result: any; usedVersion: string }> {
  // Ensure we're in a server environment
  if (typeof window !== 'undefined') {
    throw new Error('TikTok extraction is only available server-side');
  }

  // Dynamically import TikTok downloader to avoid bundling native dependencies
  const { Downloader } = await import('@tobyg74/tiktok-api-dl');
  
  const versions = ['v3', 'v2', 'v1'] as const;
  const maxRetriesPerVersion = 2;

  for (const version of versions) {
    for (let attempt = 1; attempt <= maxRetriesPerVersion; attempt++) {
      try {
        const result = await Downloader(url, { version });

        if (result?.status === 'success' && result?.result) {
          return { result, usedVersion: version };
        }

        console.warn(`Downloader returned unsuccessful status`, {
          url,
          version,
          attempt,
          status: result?.status,
        });
      } catch (err) {
        console.warn(`Downloader attempt failed`, {
          url,
          version,
          attempt,
          error: (err as Error)?.message,
        });
      }

      // Exponential-ish backoff
      await sleep(300 * attempt);
    }
  }

  throw new Error('All TikTok downloader versions failed after retries');
}

/**
 * Extract content from TikTok link
 * Uses dynamic import to avoid bundling native dependencies
 */
async function extractTikTokContent(url: string): Promise<string> {
  try {
    const { result, usedVersion } = await downloadTikTokWithFallback(url);

    console.debug('TikTok content extracted', {
      url,
      usedVersion,
    });

    const data = result.result;

    // Get video URL (prefer HD, then watermarked, then SD)
    const videoUrl = data.videoHD || data.videoWatermark || data.videoSD;

    if (!videoUrl) {
      // If no video URL, return description text
      return data.desc || data.description || 'TikTok content (no video URL available)';
    }

    // Download video to buffer for transcription
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error('Failed to fetch video');
    }

    const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
    
    // Create a File object for Whisper API
    // In Node.js 18+, File is available globally
    const videoFile = new File([videoBuffer], 'tiktok-video.mp4', {
      type: 'video/mp4',
    });

    // Transcribe using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: videoFile,
      model: 'whisper-1',
    });

    // Combine description and transcription
    const description = data.desc || data.description || '';
    const transcribedText = transcription.text || '';
    
    return description && transcribedText
      ? `${description}\n\n[Transcribed Audio]:\n${transcribedText}`
      : transcribedText || description || 'Content unavailable';
  } catch (error) {
    console.error('TikTok extraction error:', error);
    throw new Error(`Failed to extract TikTok content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract content from Twitter/X link
 * Uses dynamic import to avoid bundling native dependencies
 */
async function extractTwitterContent(url: string): Promise<string> {
  // Ensure we're in a server environment
  if (typeof window !== 'undefined') {
    throw new Error('Twitter extraction is only available server-side');
  }
  
  try {
    // Dynamically import Twitter scraper to avoid bundling native dependencies
    const { Scraper } = await import('@the-convocation/twitter-scraper');
    const scraper = new Scraper();
    
    // Extract tweet ID from URL
    const tweetIdMatch = url.match(/status\/(\d+)/);
    if (!tweetIdMatch) {
      throw new Error('Invalid Twitter URL format');
    }

    const tweetId = tweetIdMatch[1];
    const tweet = await scraper.getTweet(tweetId);
    
    if (!tweet) {
      throw new Error('Tweet not found');
    }

    return tweet.text || 'Content unavailable';
  } catch (error) {
    console.error('Twitter extraction error:', error);
    throw new Error(`Failed to extract Twitter content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract content from blog/article link
 */
async function extractBlogContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script and style elements
    $('script, style, nav, header, footer, aside').remove();

    // Extract main content
    const article = $('article, main, [role="main"], .content, .post-content, .article-content').first();
    const content = article.length > 0 ? article.text() : $('body').text();

    // Clean up whitespace
    return content.replace(/\s+/g, ' ').trim();
  } catch (error) {
    console.error('Blog extraction error:', error);
    throw new Error(`Failed to extract blog content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from PDF file
 * Uses dynamic import to handle ESM module properly
 */
async function extractPDFContent(file: File | Buffer): Promise<string> {
  try {
    // Dynamically import pdf-parse to handle ESM properly
    const pdfParseModule = await import('pdf-parse');
    // pdf-parse exports a default function
    const pdfParse = ('default' in pdfParseModule && typeof pdfParseModule.default === 'function')
      ? pdfParseModule.default
      : (typeof pdfParseModule === 'function' ? pdfParseModule : null);
    
    if (!pdfParse) {
      throw new Error('pdf-parse module not found or invalid');
    }
    
    let buffer: Buffer;
    if (file instanceof Buffer) {
      buffer = file;
    } else if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      throw new Error('Invalid file type for PDF extraction');
    }
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract PDF content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from PPT/PPTX file
 */
async function extractPPTContent(file: File | Buffer, filename?: string): Promise<string> {
  try {
    // For now, return a placeholder - PPT extraction requires more complex handling
    // We can implement this later with a proper PPT parsing library
    const name = filename || (file instanceof File ? file.name : 'presentation');
    return `[PPT/PPTX file: ${name} - Text extraction not yet implemented. Please provide text content separately.]`;
  } catch (error) {
    console.error('PPT extraction error:', error);
    throw new Error(`Failed to extract PPT content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Detect file type from filename
 */
function detectFileType(filename: string): FileType {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'pdf':
      return 'pdf';
    case 'ppt':
      return 'ppt';
    case 'pptx':
      return 'pptx';
    default:
      return 'unknown';
  }
}

/**
 * Main content extraction function
 */
export async function extractContent(
  input: string,
  files?: File[],
  links?: string[]
): Promise<ContentExtractionResult[]> {
  const results: ContentExtractionResult[] = [];

  // Process text input
  if (input && input.trim()) {
    if (isURL(input)) {
      // It's a link
      const platform = detectPlatform(input);
      let content = '';

      try {
        switch (platform) {
          case 'tiktok':
            content = await extractTikTokContent(input);
            break;
          case 'twitter':
            content = await extractTwitterContent(input);
            break;
          case 'blog':
            content = await extractBlogContent(input);
            break;
          default:
            content = await extractBlogContent(input);
        }

        results.push({
          type: 'link',
          content,
          metadata: {
            platform,
            url: input,
          },
        });
      } catch {
        // If extraction fails, still include the URL
        results.push({
          type: 'link',
          content: input,
          metadata: {
            platform,
            url: input,
          },
        });
      }
    } else {
      // It's plain text
      results.push({
        type: 'text',
        content: input.trim(),
      });
    }
  }

  // Process additional links
  if (links && links.length > 0) {
    for (const link of links) {
      if (isURL(link)) {
        const platform = detectPlatform(link);
        try {
          let content = '';
          switch (platform) {
            case 'tiktok':
              content = await extractTikTokContent(link);
              break;
            case 'twitter':
              content = await extractTwitterContent(link);
              break;
            case 'blog':
              content = await extractBlogContent(link);
              break;
            default:
              content = await extractBlogContent(link);
          }

          results.push({
            type: 'link',
            content,
            metadata: {
              platform,
              url: link,
            },
          });
        } catch {
          results.push({
            type: 'link',
            content: link,
            metadata: {
              platform,
              url: link,
            },
          });
        }
      }
    }
  }

  // Process files
  if (files && files.length > 0) {
    for (const file of files) {
      const filename = file instanceof File ? file.name : 'file';
      const fileType = detectFileType(filename);
      try {
        let content = '';
        switch (fileType) {
          case 'pdf':
            content = await extractPDFContent(file);
            break;
          case 'ppt':
          case 'pptx':
            content = await extractPPTContent(file, filename);
            break;
          default:
            content = `[Unsupported file type: ${filename}]`;
        }

        results.push({
          type: 'file',
          content,
          metadata: {
            fileType,
            filename,
          },
        });
      } catch {
        results.push({
          type: 'file',
          content: `[Error extracting content from ${filename}]`,
          metadata: {
            fileType,
            filename,
          },
        });
      }
    }
  }

  return results;
}

