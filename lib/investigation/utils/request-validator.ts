/**
 * Request validation utilities for investigation API
 */

import type { UIMessage } from 'ai';

export interface ValidationError {
  error: string;
  status: number;
}

/**
 * Validate that messages array exists and is not empty
 */
export function validateMessages(messages: unknown): ValidationError | null {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return {
      error: 'Messages array is required',
      status: 400,
    };
  }
  return null;
}

/**
 * Validate that the last message is from a user
 */
export function validateLastMessage(messages: UIMessage[]): ValidationError | null {
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== 'user') {
    return {
      error: 'Last message must be from user',
      status: 400,
    };
  }
  return null;
}

/**
 * Validate that content was successfully extracted
 */
export function validateExtractedContent(content: string): ValidationError | null {
  if (!content.trim()) {
    return {
      error: 'No content could be extracted',
      status: 400,
    };
  }
  return null;
}

/**
 * Create a validation error response
 */
export function createValidationResponse(error: ValidationError): Response {
  return new Response(JSON.stringify({ error: error.error }), {
    status: error.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

