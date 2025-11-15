/**
 * Utility functions for input detection and URL parsing
 */

export type InputType = 'twitter' | 'tiktok' | 'blog' | 'text';

export interface InputDetectionResult {
  type: InputType;
  isUrl: boolean;
  url?: string;
}

/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detects the type of input (Twitter, TikTok, blog post, or plain text)
 */
export function detectInputType(input: string): InputDetectionResult {
  const trimmedInput = input.trim();
  
  if (!isValidUrl(trimmedInput)) {
    return {
      type: 'text',
      isUrl: false,
    };
  }

  const url = new URL(trimmedInput);
  const hostname = url.hostname.toLowerCase();

  // Check for Twitter/X
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    return {
      type: 'twitter',
      isUrl: true,
      url: trimmedInput,
    };
  }

  // Check for TikTok
  if (hostname.includes('tiktok.com')) {
    return {
      type: 'tiktok',
      isUrl: true,
      url: trimmedInput,
    };
  }

  // Default to blog post for other URLs
  return {
    type: 'blog',
    isUrl: true,
    url: trimmedInput,
  };
}

/**
 * Extracts tweet ID from Twitter URL
 * Supports formats like:
 * - https://twitter.com/username/status/1234567890
 * - https://x.com/username/status/1234567890
 */
export function extractTwitterId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // Look for 'status' in the path and get the ID after it
    const statusIndex = pathParts.indexOf('status');
    if (statusIndex !== -1 && statusIndex < pathParts.length - 1) {
      return pathParts[statusIndex + 1];
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Extracts video ID from TikTok URL
 * Supports formats like:
 * - https://www.tiktok.com/@username/video/1234567890
 * - https://vm.tiktok.com/xxxxx/
 */
export function extractTikTokId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Handle vm.tiktok.com short URLs - these need to be resolved first
    if (urlObj.hostname.includes('vm.tiktok.com')) {
      return url; // Return full URL for short links
    }
    
    // Handle full TikTok URLs
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const videoIndex = pathParts.indexOf('video');
    
    if (videoIndex !== -1 && videoIndex < pathParts.length - 1) {
      return pathParts[videoIndex + 1];
    }
    
    return null;
  } catch {
    return null;
  }
}

