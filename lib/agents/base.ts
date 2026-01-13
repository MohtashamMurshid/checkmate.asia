/**
 * Base Agent Infrastructure for NPREWS
 * 
 * Provides the foundational interface and types for all risk agents.
 * Agents are specialists that detect uncertainty and produce signals.
 */

import { nanoid } from 'nanoid';

/**
 * Base interface for all risk agents
 * Each agent has a narrow mandate and produces structured signals
 */
export interface RiskAgent<I, O> {
  /** Unique name for the agent */
  name: string;
  /** One-sentence description of what this agent detects */
  mandate: string;
  /** 
   * Observe input and produce output signal(s)
   * Returns null if no significant signal detected
   */
  observe(input: I): Promise<O | null>;
}

/**
 * Source types for evidence tracking
 */
export type SourceType = 'parliamentary' | 'regulatory' | 'media' | 'social' | 'analysis';

/**
 * Evidence structure - every signal must have traceable evidence
 */
export interface Evidence {
  /** Source name (e.g., "Minister of Finance Speech") */
  source: string;
  /** Exact quote or reference */
  quote: string;
  /** URL if available */
  url?: string;
  /** Publication date if known */
  publishedAt?: string;
  /** Type of source for categorization */
  sourceType: SourceType;
}

/**
 * Base signal interface - all agent outputs extend this
 */
export interface AgentSignal {
  /** Unique identifier */
  id: string;
  /** Name of the agent that produced this signal */
  agentName: string;
  /** Human-readable hypothesis about what's happening */
  hypothesis: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Supporting evidence */
  evidence: Evidence[];
  /** Timestamp of detection */
  createdAt: number;
}

/**
 * Generate a unique ID for signals and entities
 */
export function generateId(): string {
  return nanoid();
}

/**
 * Agent registry for orchestration
 * Tracks all available agents and their capabilities
 */
export class AgentRegistry {
  private agents: Map<string, RiskAgent<unknown, unknown>> = new Map();

  /**
   * Register an agent with the registry
   */
  register<I, O>(agent: RiskAgent<I, O>): void {
    this.agents.set(agent.name, agent as RiskAgent<unknown, unknown>);
  }

  /**
   * Get an agent by name
   */
  get<I, O>(name: string): RiskAgent<I, O> | undefined {
    return this.agents.get(name) as RiskAgent<I, O> | undefined;
  }

  /**
   * List all registered agents
   */
  list(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Get all agents
   */
  getAll(): RiskAgent<unknown, unknown>[] {
    return Array.from(this.agents.values());
  }
}

/**
 * Singleton registry instance
 */
export const agentRegistry = new AgentRegistry();
