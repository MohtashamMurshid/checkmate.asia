/**
 * Pre-Processor Utility
 * Cleans, deduplicates, and prepares text data before routing to analysis agents
 */

import { createHash } from 'crypto';

export interface PreprocessedResult {
  originalText: string;
  cleanedText: string;
  hash: string;
  metadata: {
    originalLength: number;
    cleanedLength: number;
    wasModified: boolean;
    anonymized: boolean;
  };
}

export interface PreprocessorOptions {
  normalizeWhitespace?: boolean;
  removeSpecialChars?: boolean;
  anonymize?: boolean;
  toLowerCase?: boolean;
  maxLength?: number;
}

const DEFAULT_OPTIONS: PreprocessorOptions = {
  normalizeWhitespace: true,
  removeSpecialChars: false, // Keep special chars by default for context
  anonymize: false,
  toLowerCase: false, // Preserve case for sentiment/bias analysis
  maxLength: 10000,
};

/**
 * Common patterns for anonymization
 */
const ANONYMIZATION_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(\+?1?[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  ssn: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,
  creditCard: /\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g,
  ipAddress: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
};

/**
 * Generate SHA-256 hash of text for caching/deduplication
 */
export function generateHash(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/**
 * Normalize whitespace in text
 * - Collapse multiple spaces/tabs to single space
 * - Normalize line breaks
 * - Trim leading/trailing whitespace
 */
function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ') // Collapse spaces/tabs
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    .trim();
}

/**
 * Remove special characters while preserving readability
 * Keeps: letters, numbers, basic punctuation, whitespace
 */
function removeSpecialChars(text: string): string {
  // Keep alphanumeric, common punctuation, and whitespace
  return text.replace(/[^\w\s.,!?;:'"()-]/g, '');
}

/**
 * Anonymize PII (Personally Identifiable Information)
 */
function anonymizeText(text: string): string {
  let anonymized = text;
  
  // Replace emails
  anonymized = anonymized.replace(ANONYMIZATION_PATTERNS.email, '[EMAIL]');
  
  // Replace phone numbers
  anonymized = anonymized.replace(ANONYMIZATION_PATTERNS.phone, '[PHONE]');
  
  // Replace SSN-like patterns
  anonymized = anonymized.replace(ANONYMIZATION_PATTERNS.ssn, '[SSN]');
  
  // Replace credit card numbers
  anonymized = anonymized.replace(ANONYMIZATION_PATTERNS.creditCard, '[CREDIT_CARD]');
  
  // Replace IP addresses
  anonymized = anonymized.replace(ANONYMIZATION_PATTERNS.ipAddress, '[IP_ADDRESS]');
  
  return anonymized;
}

/**
 * Truncate text to maximum length while preserving word boundaries
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  
  // Find last space before maxLength
  const truncatePoint = text.lastIndexOf(' ', maxLength);
  if (truncatePoint === -1) {
    return text.substring(0, maxLength) + '...';
  }
  
  return text.substring(0, truncatePoint) + '...';
}

/**
 * Main preprocessing function
 * Cleans and prepares text for analysis
 */
export function preprocessText(
  text: string,
  options: PreprocessorOptions = {}
): PreprocessedResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const originalLength = text.length;
  
  let cleanedText = text;
  
  // Normalize whitespace (always recommended)
  if (opts.normalizeWhitespace) {
    cleanedText = normalizeWhitespace(cleanedText);
  }
  
  // Remove special characters (optional)
  if (opts.removeSpecialChars) {
    cleanedText = removeSpecialChars(cleanedText);
  }
  
  // Anonymize PII (optional)
  if (opts.anonymize) {
    cleanedText = anonymizeText(cleanedText);
  }
  
  // Convert to lowercase (optional, usually not recommended for analysis)
  if (opts.toLowerCase) {
    cleanedText = cleanedText.toLowerCase();
  }
  
  // Truncate if too long
  if (opts.maxLength && cleanedText.length > opts.maxLength) {
    cleanedText = truncateText(cleanedText, opts.maxLength);
  }
  
  // Generate hash for caching/deduplication
  const hash = generateHash(cleanedText);
  
  return {
    originalText: text,
    cleanedText,
    hash,
    metadata: {
      originalLength,
      cleanedLength: cleanedText.length,
      wasModified: cleanedText !== text,
      anonymized: opts.anonymize ?? false,
    },
  };
}

/**
 * Batch preprocess multiple texts
 * Returns preprocessed results with deduplication info
 */
export function preprocessBatch(
  texts: string[],
  options: PreprocessorOptions = {}
): {
  results: PreprocessedResult[];
  uniqueHashes: Set<string>;
  duplicateIndices: Map<number, number>; // Maps duplicate index to original index
} {
  const results: PreprocessedResult[] = [];
  const uniqueHashes = new Set<string>();
  const hashToIndex = new Map<string, number>();
  const duplicateIndices = new Map<number, number>();
  
  for (let i = 0; i < texts.length; i++) {
    const result = preprocessText(texts[i], options);
    results.push(result);
    
    if (hashToIndex.has(result.hash)) {
      // This is a duplicate
      duplicateIndices.set(i, hashToIndex.get(result.hash)!);
    } else {
      // First occurrence
      hashToIndex.set(result.hash, i);
      uniqueHashes.add(result.hash);
    }
  }
  
  return {
    results,
    uniqueHashes,
    duplicateIndices,
  };
}

/**
 * Check if text is empty or too short for meaningful analysis
 */
export function isValidForAnalysis(text: string, minLength: number = 10): boolean {
  const cleaned = normalizeWhitespace(text);
  return cleaned.length >= minLength;
}

/**
 * Extract key phrases for routing decisions
 * Simple extraction based on common patterns
 */
export function extractKeyPhrases(text: string): string[] {
  const phrases: string[] = [];
  
  // Look for quoted text
  const quotes = text.match(/"[^"]+"/g) || [];
  phrases.push(...quotes.map(q => q.replace(/"/g, '')));
  
  // Look for numbers with context (potential facts)
  const numbersWithContext = text.match(/\d+(?:\.\d+)?%?(?:\s+\w+){0,3}/g) || [];
  phrases.push(...numbersWithContext);
  
  // Look for capitalized phrases (potential names/entities)
  const capitalizedPhrases = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/g) || [];
  phrases.push(...capitalizedPhrases);
  
  return [...new Set(phrases)].slice(0, 10); // Dedupe and limit
}

