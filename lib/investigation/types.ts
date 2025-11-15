/**
 * Type definitions for the investigation system
 */

export type InvestigationType =
  | 'business'
  | 'finance'
  | 'science'
  | 'factual'
  | 'history';

export type ContentType = 'text' | 'link' | 'file';

export type LinkPlatform = 'tiktok' | 'twitter' | 'blog' | 'unknown';

export type FileType = 'pdf' | 'ppt' | 'pptx' | 'unknown';

export interface ContentExtractionResult {
  type: ContentType;
  content: string;
  metadata?: {
    platform?: LinkPlatform;
    fileType?: FileType;
    url?: string;
    filename?: string;
    transcription?: string;
  };
}

export interface InvestigationResult {
  investigationType: InvestigationType;
  truthfulnessScore: number; // 0-100
  verdict: 'true' | 'false' | 'unverified' | 'partially-true';
  summary: string;
  evidence: Evidence[];
  reasoning: string;
  sources: Source[];
  agentActions: AgentAction[];
}

export interface Evidence {
  claim: string;
  verification: 'verified' | 'disputed' | 'unverified';
  source: string;
  explanation: string;
}

export interface Source {
  name: string;
  url?: string;
  type: 'api' | 'website' | 'document';
  reliability: 'high' | 'medium' | 'low';
}

export interface AgentAction {
  timestamp: string;
  action: string;
  tool?: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: string;
  error?: string;
}

export interface InvestigationRequest {
  content: string;
  contentType: ContentType;
  files?: File[];
  links?: string[];
}

