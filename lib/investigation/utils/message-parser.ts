/**
 * Message parsing utilities for extracting content from UI messages
 */

import type { UIMessage } from 'ai';

export interface ParsedMessageContent {
  text: string;
  files: File[];
  links: string[];
}

/**
 * Extract text content from a message
 */
function extractTextFromMessage(message: UIMessage): string {
  let text = '';

  // Handle message parts (for structured messages)
  if (message.parts && Array.isArray(message.parts)) {
    for (const part of message.parts) {
      if (part.type === 'text' && 'text' in part) {
        text += part.text + '\n';
      }
    }
  }
  // Handle content field
  else if ('content' in message && typeof message.content === 'string') {
    text = message.content;
  }
  // Handle text field
  else if ('text' in message && typeof message.text === 'string') {
    text = message.text;
  }

  return text;
}

/**
 * Extract links from text using regex
 */
function extractLinksFromText(text: string): string[] {
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(linkRegex) || [];
}

/**
 * Convert base64 data URL to File object
 */
async function base64ToFile(
  base64Data: string,
  filename: string,
  mimeType: string
): Promise<File> {
  // Remove data URL prefix if present
  const base64 = base64Data.includes(',') 
    ? base64Data.split(',')[1] 
    : base64Data;
  
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return new File([bytes], filename, { type: mimeType });
}

/**
 * Extract files from message data
 */
async function extractFilesFromMessage(message: UIMessage): Promise<File[]> {
  const files: File[] = [];

  if ('data' in message && message.data && typeof message.data === 'object') {
    const data = message.data as any;
    
    if (data.files && Array.isArray(data.files)) {
      const filePromises = data.files.map(async (file: {
        name: string;
        type: string;
        data: string;
      }) => {
        return base64ToFile(file.data, file.name, file.type);
      });
      
      const extractedFiles = await Promise.all(filePromises);
      files.push(...extractedFiles);
    }
  }

  return files;
}

/**
 * Extract links from message data
 */
function extractLinksFromMessage(message: UIMessage): string[] {
  const links: string[] = [];

  if ('data' in message && message.data && typeof message.data === 'object') {
    const data = message.data as any;
    
    if (data.links && Array.isArray(data.links)) {
      links.push(...data.links);
    }
  }

  return links;
}

/**
 * Parse a UI message to extract text, files, and links
 */
export async function parseMessageContent(
  message: UIMessage
): Promise<ParsedMessageContent> {
  // Extract text content
  const text = extractTextFromMessage(message);
  
  // Extract links from text
  const textLinks = extractLinksFromText(text);
  
  // Extract files from message data
  const files = await extractFilesFromMessage(message);
  
  // Extract additional links from message data
  const dataLinks = extractLinksFromMessage(message);
  
  // Combine all links
  const links = [...textLinks, ...dataLinks];

  return {
    text,
    files,
    links,
  };
}

