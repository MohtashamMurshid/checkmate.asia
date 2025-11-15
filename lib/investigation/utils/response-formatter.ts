/**
 * Response formatting utilities for investigation API
 */

import type { InvestigationType } from '../types';

/**
 * Create an error response
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage = 'An error occurred while processing your request'
): Response {
  const message = error instanceof Error ? error.message : defaultMessage;
  
  return new Response(
    JSON.stringify({ error: message }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Create system prompt for presenting investigation results
 */
export function createInvestigationSystemPrompt(
  investigationType: InvestigationType
): string {
  return `You are presenting the results of an investigation. Format the results clearly with:
- Investigation Type: ${investigationType}
- Truthfulness Analysis
- Evidence and Sources
- Reasoning

Present the agent's findings in a clear, structured format.`;
}

/**
 * Combine extracted content results into a single string
 */
export function combineExtractedContent(
  extractionResults: Array<{ content: string }>
): string {
  return extractionResults
    .map((result) => result.content)
    .join('\n\n---\n\n');
}

