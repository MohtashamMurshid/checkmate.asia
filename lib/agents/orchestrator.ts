/**
 * NPREWS Orchestrator
 * 
 * Coordinates all agents in the correct sequence:
 * 1. NarrativeAgent - Detects narrative frames
 * 2. ActorAgent - Maps actors for each narrative
 * 3. ClusterAgent - Groups related narratives
 * 4. SynthesizerAgent - Generates briefs if warranted
 */

import { NarrativeAgent } from './narrative-agent';
import { ActorLegitimacyAgent, type ActorAgentInput } from './actor-agent';
import { ClusterAgent } from './cluster-agent';
import { SynthesizerAgent } from './synthesizer-agent';
import type {
  TextCorpus,
  NarrativeSignal,
  ActorSignal,
  ClusterSignal,
  NarrativeBrief,
} from './types';
import type { AgentSignal } from './base';

/**
 * Result of running the NPREWS analysis
 */
export interface NPREWSResult {
  /** All signals detected by agents */
  signals: {
    narrative: NarrativeSignal[];
    actor: ActorSignal[];
    cluster: ClusterSignal[];
  };
  /** Narrative brief if warranted */
  brief: NarrativeBrief | null;
  /** Metadata about the analysis */
  metadata: {
    documentsAnalyzed: number;
    narrativesDetected: number;
    actorsIdentified: number;
    clustersFormed: number;
    legitimacyTransfersDetected: number;
    processingTimeMs: number;
  };
}

export class NPREWSOrchestrator {
  private narrativeAgent: NarrativeAgent;
  private actorAgent: ActorLegitimacyAgent;
  private clusterAgent: ClusterAgent;
  private synthesizer: SynthesizerAgent;

  constructor() {
    this.narrativeAgent = new NarrativeAgent();
    this.actorAgent = new ActorLegitimacyAgent();
    this.clusterAgent = new ClusterAgent();
    this.synthesizer = new SynthesizerAgent();
  }

  /**
   * Run the full NPREWS analysis pipeline
   */
  async analyze(documents: TextCorpus): Promise<NPREWSResult> {
    const startTime = Date.now();

    // 1. Run NarrativeAgent first
    console.log('[NPREWS] Running NarrativeAgent...');
    const narrativeSignals = (await this.narrativeAgent.observe(documents)) || [];
    console.log(`[NPREWS] Detected ${narrativeSignals.length} narratives`);

    // 2. Run ActorAgent for each narrative (with context)
    console.log('[NPREWS] Running ActorLegitimacyAgent...');
    const actorSignals: ActorSignal[] = [];

    for (const narrative of narrativeSignals) {
      const actorInput: ActorAgentInput = {
        documents: documents.documents,
        narrativeContext: narrative.frame,
      };

      const actorSignal = await this.actorAgent.observe(actorInput);
      if (actorSignal) {
        actorSignals.push(actorSignal);
      }
    }
    console.log(`[NPREWS] Identified actors in ${actorSignals.length} contexts`);

    // 3. Run ClusterAgent on detected narratives
    console.log('[NPREWS] Running ClusterAgent...');
    const clusterSignals =
      (await this.clusterAgent.observe({
        narratives: narrativeSignals.map((n) => ({
          id: n.id,
          frame: n.frame,
          frameType: n.frameType,
        })),
      })) || [];
    console.log(`[NPREWS] Formed ${clusterSignals.length} clusters`);

    // 4. Run Synthesizer to judge if brief is warranted
    console.log('[NPREWS] Running SynthesizerAgent...');
    const brief = await this.synthesizer.observe({
      narrativeSignals,
      actorSignals,
      clusterSignals,
    });
    console.log(`[NPREWS] Brief generated: ${brief ? 'Yes' : 'No'}`);

    const processingTimeMs = Date.now() - startTime;

    // Calculate metadata
    const legitimacyTransfersDetected = actorSignals.filter(
      (s) => s.legitimacyTransfer
    ).length;

    return {
      signals: {
        narrative: narrativeSignals,
        actor: actorSignals,
        cluster: clusterSignals,
      },
      brief,
      metadata: {
        documentsAnalyzed: documents.documents.length,
        narrativesDetected: narrativeSignals.length,
        actorsIdentified: actorSignals.reduce((acc, s) => acc + s.actors.length, 0),
        clustersFormed: clusterSignals.length,
        legitimacyTransfersDetected,
        processingTimeMs,
      },
    };
  }

  /**
   * Run only narrative detection (quick analysis)
   */
  async detectNarratives(documents: TextCorpus): Promise<NarrativeSignal[]> {
    return (await this.narrativeAgent.observe(documents)) || [];
  }

  /**
   * Run actor analysis for a specific narrative
   */
  async analyzeActors(
    documents: TextCorpus,
    narrativeContext: string
  ): Promise<ActorSignal | null> {
    return this.actorAgent.observe({
      documents: documents.documents,
      narrativeContext,
    });
  }

  /**
   * Get all agent names for transparency
   */
  getAgentNames(): string[] {
    return [
      this.narrativeAgent.name,
      this.actorAgent.name,
      this.clusterAgent.name,
      this.synthesizer.name,
    ];
  }

  /**
   * Get agent mandates for documentation
   */
  getAgentMandates(): Record<string, string> {
    return {
      [this.narrativeAgent.name]: this.narrativeAgent.mandate,
      [this.actorAgent.name]: this.actorAgent.mandate,
      [this.clusterAgent.name]: this.clusterAgent.mandate,
      [this.synthesizer.name]: this.synthesizer.mandate,
    };
  }
}

/**
 * Singleton orchestrator instance
 */
let orchestratorInstance: NPREWSOrchestrator | null = null;

export function getOrchestrator(): NPREWSOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new NPREWSOrchestrator();
  }
  return orchestratorInstance;
}
