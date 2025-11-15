/**
 * Type definitions for AI configuration and tools
 */

export interface ModelOption {
  name: string;
  value: string;
}

export interface AIConfig {
  defaultModel: string;
  availableModels: ModelOption[];
  maxDuration: number;
  systemPrompt: string;
}

export interface ToolParameter {
  type: string;
  description?: string;
  [key: string]: unknown;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, ToolParameter>;
    required?: string[];
  };
}

export interface APIRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model?: string;
}

