/**
 * NPREWS Agent Exports
 * 
 * Central export point for all agent-related modules.
 */

// Base infrastructure
export { type RiskAgent, type AgentSignal, type Evidence, generateId, AgentRegistry, agentRegistry } from './base';

// Types
export type {
  // Narrative types
  FrameType,
  NarrativeSignal,
  // Actor types
  ActorCategory,
  ActorRole,
  ActorInfo,
  LegitimacyTransfer,
  ActorSignal,
  // Cluster types
  ClusterSignal,
  // Brief types
  RegimeBand,
  RecommendedAction,
  RiskType,
  NationalPriority,
  NarrativeBrief,
  // Input types
  Document,
  TextCorpus,
  NarrativeInput,
  SignalInput,
  // Audit types
  AuditAction,
  AuditLogEntry,
} from './types';

// Sector mapping
export {
  KHAZANAH_SECTORS,
  SECTOR_KEYWORDS,
  NATIONAL_PRIORITIES,
  SECTOR_PRIORITY_MAP,
  RISK_TYPE_KEYWORDS,
  SAMPLE_HOLDINGS,
  detectSectors,
  detectNationalPriorities,
  detectRiskTypes,
  getAffectedHoldings,
  getPrioritiesFromSectors,
  type KhazanahSector,
} from './khazanah-sectors';

// Agents
export { NarrativeAgent } from './narrative-agent';
export { ActorLegitimacyAgent, ACTOR_WEIGHTS, type ActorAgentInput } from './actor-agent';
export { ClusterAgent } from './cluster-agent';
export { SynthesizerAgent } from './synthesizer-agent';

// Orchestrator
export { NPREWSOrchestrator, getOrchestrator, type NPREWSResult } from './orchestrator';
