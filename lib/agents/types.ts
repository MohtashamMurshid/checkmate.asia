/**
 * NPREWS Type Definitions
 * 
 * All signal types, actor categories, and domain-specific types
 * for the Narrative & Policy Regime Early-Warning System.
 */

import type { AgentSignal, Evidence } from './base';

// ============================================
// NARRATIVE SIGNAL TYPES (Module 5.1)
// ============================================

/**
 * Types of narrative frames detected
 */
export type FrameType = 'emergence' | 'reframing' | 'responsibility' | 'solution';

/**
 * Signal produced by NarrativeAgent
 */
export interface NarrativeSignal extends AgentSignal {
  type: 'narrative';
  /** The narrative frame being established */
  frame: string;
  /** Type of framing detected */
  frameType: FrameType;
  /** Previous frame if this is a reframing */
  previousFrame?: string;
  /** Khazanah sectors affected */
  sectors: string[];
  /** Risk types this narrative may translate into */
  riskTypes: RiskType[];
  /** National priorities touched */
  nationalPriorities: NationalPriority[];
}

// ============================================
// ACTOR SIGNAL TYPES (Module 5.3)
// ============================================

/**
 * Categories of actors in Malaysian policy discourse
 */
export type ActorCategory =
  | 'minister'
  | 'regulator'
  | 'mp'
  | 'central_bank'
  | 'ngo_major'
  | 'industry_body'
  | 'tier1_media'
  | 'academic'
  | 'analyst';

/**
 * Role an actor plays in narrative propagation
 */
export type ActorRole = 'originator' | 'amplifier' | 'legitimiser';

/**
 * Actor information extracted from documents
 */
export interface ActorInfo {
  /** Name of the actor */
  name: string;
  /** Category classification */
  category: ActorCategory;
  /** Role in the narrative */
  role: ActorRole;
  /** Calculated legitimacy score (0-100) */
  legitimacyScore: number;
  /** Key quote from this actor */
  quote?: string;
}

/**
 * Legitimacy transfer event - critical signal
 */
export interface LegitimacyTransfer {
  /** Who originated the narrative */
  from: string;
  /** Who legitimised it */
  to: string;
  /** The narrative being transferred */
  narrative: string;
}

/**
 * Signal produced by ActorLegitimacyAgent
 */
export interface ActorSignal extends AgentSignal {
  type: 'actor';
  /** Actors identified in the discourse */
  actors: ActorInfo[];
  /** Legitimacy transfer if detected */
  legitimacyTransfer?: LegitimacyTransfer;
}

// ============================================
// CLUSTER SIGNAL TYPES (Module 5.2)
// ============================================

/**
 * Signal produced by ClusterAgent
 */
export interface ClusterSignal extends AgentSignal {
  type: 'cluster';
  /** Core thesis of the cluster */
  coreThesis: string;
  /** Arguments supporting the thesis */
  supportingArguments: string[];
  /** Counter-arguments identified */
  counterArguments: string[];
  /** Moral framing (fairness, security, efficiency, etc.) */
  moralFraming: string;
  /** IDs of narratives in this cluster */
  narrativeIds: string[];
  /** Size of the cluster */
  clusterSize: number;
}

// ============================================
// NARRATIVE BRIEF (Synthesizer Output)
// ============================================

/**
 * Regime bands indicating narrative maturity
 */
export type RegimeBand = 'dormant' | 'emerging' | 'normalising' | 'pre_formal' | 'imminent';

/**
 * Recommended actions based on regime band
 */
export type RecommendedAction = 'monitor' | 'review' | 'escalate';

/**
 * Risk types for Khazanah
 */
export type RiskType = 'regulatory' | 'reputational' | 'strategic' | 'operational';

/**
 * National priorities that may be affected
 */
export type NationalPriority =
  | 'food_security'
  | 'energy_security'
  | 'digital_sovereignty'
  | 'economic_growth'
  | 'social_welfare'
  | 'environmental_sustainability'
  | 'national_security';

/**
 * Narrative Brief - the main output for risk leadership
 */
export interface NarrativeBrief {
  /** Unique identifier */
  id: string;
  /** Clear, neutral headline */
  title: string;
  /** 2-3 sentence summary */
  summary: string;
  /** Khazanah-specific implications */
  whyItMatters: string;
  /** Affected sectors */
  sectors: string[];
  /** Risk types */
  riskTypes: RiskType[];
  /** National priorities touched */
  nationalPriorities: NationalPriority[];
  /** Current regime band */
  regimeBand: RegimeBand;
  /** Confidence in the assessment */
  confidence: number;
  /** IDs of signals that contributed */
  contributingSignals: string[];
  /** Key actors involved */
  actors: ActorInfo[];
  /** Supporting evidence */
  evidence: Evidence[];
  /** Recommended action */
  recommendedAction: RecommendedAction;
  /** Detection timestamp */
  createdAt: number;
  /** Human review status */
  reviewStatus: 'pending' | 'approved' | 'dismissed' | 'escalated';
  /** Who reviewed it */
  reviewedBy?: string;
  /** When it was reviewed */
  reviewedAt?: number;
}

// ============================================
// INPUT TYPES
// ============================================

/**
 * Document in a text corpus
 */
export interface Document {
  /** Document text content */
  text: string;
  /** Source name */
  source: string;
  /** URL if available */
  url?: string;
  /** Publication date */
  publishedAt?: string;
  /** Source type classification */
  sourceType: 'parliamentary' | 'regulatory' | 'media' | 'social';
}

/**
 * Text corpus input for agents
 */
export interface TextCorpus {
  documents: Document[];
}

/**
 * Input for ClusterAgent
 */
export interface NarrativeInput {
  narratives: Array<{
    id: string;
    frame: string;
    frameType: string;
  }>;
}

/**
 * Input for SynthesizerAgent
 */
export interface SignalInput {
  narrativeSignals: NarrativeSignal[];
  actorSignals: ActorSignal[];
  clusterSignals: ClusterSignal[];
}

// ============================================
// AUDIT LOG TYPES
// ============================================

/**
 * Actions that can be logged
 */
export type AuditAction =
  | 'narrative_detected'
  | 'actor_identified'
  | 'cluster_created'
  | 'brief_generated'
  | 'human_review'
  | 'escalation';

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  /** Unique identifier */
  id: string;
  /** Action performed */
  action: AuditAction;
  /** Type of entity affected */
  entityType: 'narrative' | 'actor' | 'cluster' | 'brief';
  /** ID of the entity */
  entityId: string;
  /** Additional details */
  details: Record<string, unknown>;
  /** User who performed action (for manual actions) */
  userId?: string;
  /** Timestamp */
  timestamp: number;
}
