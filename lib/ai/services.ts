/**
 * Shared service instances for content extraction
 */

import { Scraper } from '@the-convocation/twitter-scraper';
import OpenAI from 'openai';

/**
 * Twitter scraper instance
 */
export const twitterScraper = new Scraper();

/**
 * OpenAI client instance (if API key is configured)
 */
export const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

