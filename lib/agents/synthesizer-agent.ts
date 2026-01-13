/**
 * SynthesizerAgent (The Boss)
 * 
 * Mandate: "Decide whether signals warrant a Narrative Brief for human review."
 * 
 * This agent:
 * 1. Receives signals from all other agents
 * 2. Checks for corroboration (multiple agents agreeing)
 * 3. Determines regime band based on signal strength
 * 4. Generates board-appropriate Narrative Briefs
 * 5. Recommends actions (monitor, review, escalate)
 */

import { generateObject } from 'ai';
import { z } from 'zod';
import type { RiskAgent } from './base';
import { generateId } from './base';
import type {
  SignalInput,
  NarrativeBrief,
  NarrativeSignal,
  ActorSignal,
  ClusterSignal,
  RegimeBand,
  RecommendedAction,
  RiskType,
  NationalPriority,
} from './types';
import { getOpenRouterProvider, getModelConfig } from '../ai/config';

/**
 * Schema for narrative brief generation
 */
const NarrativeBriefSchema = z.object({
  title: z.string().describe('Clear, neutral headline for the brief'),
  summary: z.string().describe('2-3 sentence summary of what is happening'),
  whyItMatters: z.string().describe('Khazanah-specific implications'),
});

export class SynthesizerAgent implements RiskAgent<SignalInput, NarrativeBrief | null> {
  name = 'SynthesizerAgent';
  mandate = 'Decide whether signals warrant a Narrative Brief for human review.';

  /** Minimum corroboration score to generate a brief */
  private MIN_CORROBORATION_SCORE = 0.4;

  async observe(input: SignalInput): Promise<NarrativeBrief | null> {
    const { narrativeSignals, actorSignals, clusterSignals } = input;

    // 1. Filter signals above confidence threshold
    const significantNarratives = narrativeSignals.filter((s) => s.confidence > 0.7);
    const significantActors = actorSignals.filter((s) => s.confidence > 0.7);
    const significantClusters = clusterSignals.filter((s) => s.confidence > 0.6);

    // 2. Check for corroboration (multiple agents agreeing)
    const hasLegitimacyTransfer = significantActors.some((s) => s.legitimacyTransfer);
    const hasReframing = significantNarratives.some((s) => s.frameType === 'reframing');
    const hasClusterGrowth = significantClusters.some((s) => s.clusterSize >= 3);
    const hasResponsibilityFrame = significantNarratives.some(
      (s) => s.frameType === 'responsibility'
    );
    const hasSolutionFrame = significantNarratives.some((s) => s.frameType === 'solution');

    // 3. Calculate corroboration score
    const corroborationScore =
      (hasLegitimacyTransfer ? 0.3 : 0) +
      (hasReframing ? 0.25 : 0) +
      (hasClusterGrowth ? 0.2 : 0) +
      (hasResponsibilityFrame ? 0.1 : 0) +
      (hasSolutionFrame ? 0.1 : 0) +
      (significantNarratives.length > 0 ? 0.1 : 0) +
      (significantActors.length > 0 ? 0.05 : 0);

    // 4. Check if brief is warranted
    if (corroborationScore < this.MIN_CORROBORATION_SCORE) {
      return null;
    }

    try {
      // 5. Collect all evidence
      const allEvidence = [
        ...significantNarratives.flatMap((s) => s.evidence),
        ...significantActors.flatMap((s) => s.evidence),
      ];

      // 6. Collect all actors
      const allActors = significantActors.flatMap((s) => s.actors);

      // 7. Collect all sectors, risk types, and national priorities
      const sectors = [...new Set(significantNarratives.flatMap((s) => s.sectors))];
      const riskTypes = [
        ...new Set(significantNarratives.flatMap((s) => s.riskTypes)),
      ] as RiskType[];
      const nationalPriorities = [
        ...new Set(significantNarratives.flatMap((s) => s.nationalPriorities)),
      ] as NationalPriority[];

      // 8. Generate the brief using LLM
      const provider = getOpenRouterProvider();
      const modelConfig = getModelConfig();

      const result = await generateObject({
        model: provider.chat(modelConfig.model),
        prompt: this.buildPrompt(
          significantNarratives,
          significantActors,
          significantClusters,
          hasLegitimacyTransfer
        ),
        schema: NarrativeBriefSchema,
      });

      // 9. Determine regime band
      const regimeBand = this.determineRegimeBand(
        corroborationScore,
        hasLegitimacyTransfer,
        hasSolutionFrame
      );

      // 10. Determine recommended action
      const recommendedAction = this.determineAction(regimeBand, hasLegitimacyTransfer);

      // 11. Collect contributing signal IDs
      const contributingSignalIds = [
        ...significantNarratives.map((s) => s.id),
        ...significantActors.map((s) => s.id),
        ...significantClusters.map((s) => s.id),
      ];

      return {
        id: generateId(),
        title: result.object.title,
        summary: result.object.summary,
        whyItMatters: result.object.whyItMatters,
        sectors,
        riskTypes,
        nationalPriorities,
        regimeBand,
        confidence: corroborationScore,
        contributingSignals: contributingSignalIds,
        actors: allActors.map((a) => ({
          name: a.name,
          category: a.category,
          role: a.role,
          legitimacyScore: a.legitimacyScore,
        })),
        evidence: allEvidence.slice(0, 10), // Top 10 evidence items
        recommendedAction,
        reviewStatus: 'pending',
        createdAt: Date.now(),
      };
    } catch (error) {
      console.error('[SynthesizerAgent] Error generating brief:', error);
      return null;
    }
  }

  /**
   * Determine regime band based on signals
   */
  private determineRegimeBand(
    score: number,
    hasLegitimacyTransfer: boolean,
    hasSolutionFrame: boolean
  ): RegimeBand {
    // Pre-formal: legitimacy transfer + high corroboration
    if (hasLegitimacyTransfer && score > 0.7) return 'pre_formal';

    // Imminent: solution framing + legitimacy transfer
    if (hasSolutionFrame && hasLegitimacyTransfer) return 'imminent';

    // Normalising: high corroboration
    if (score > 0.7) return 'normalising';

    // Emerging: medium corroboration
    if (score > 0.5) return 'emerging';

    // Dormant: low corroboration
    return 'dormant';
  }

  /**
   * Determine recommended action based on regime band
   */
  private determineAction(
    band: RegimeBand,
    hasLegitimacyTransfer: boolean
  ): RecommendedAction {
    // Escalate for pre-formal or imminent
    if (band === 'pre_formal' || band === 'imminent') return 'escalate';

    // Review for normalising or any legitimacy transfer
    if (band === 'normalising' || hasLegitimacyTransfer) return 'review';

    // Monitor for emerging or dormant
    return 'monitor';
  }

  /**
   * Build prompt for brief generation
   */
  private buildPrompt(
    narratives: NarrativeSignal[],
    actors: ActorSignal[],
    clusters: ClusterSignal[],
    hasLegitimacyTransfer: boolean
  ): string {
    return `You are generating a Narrative Brief for Khazanah Nasional's risk leadership.

## DETECTED SIGNALS

### NARRATIVES
${narratives.map((n) => `- ${n.hypothesis} (${n.frameType}, confidence: ${(n.confidence * 100).toFixed(0)}%)`).join('\n')}

### ACTORS
${actors.map((a) => `- ${a.hypothesis} (confidence: ${(a.confidence * 100).toFixed(0)}%)`).join('\n')}

### CLUSTERS
${clusters.map((c) => `- ${c.hypothesis} (size: ${c.clusterSize})`).join('\n')}

${hasLegitimacyTransfer ? '\n⚠️ LEGITIMACY TRANSFER DETECTED: A high-legitimacy actor has adopted a lower-legitimacy actor\'s narrative. This is a significant signal.\n' : ''}

## GENERATE A BRIEF

Create a board-appropriate Narrative Brief with:

1. **Title**: Clear, neutral headline (not alarmist)
   - Example: "Energy Pricing Narrative Shift: From Market Efficiency to Public Welfare"

2. **Summary**: 2-3 sentences on what is happening
   - What narrative is forming?
   - Who is involved?
   - What's the trajectory?

3. **Why It Matters**: Khazanah-specific implications
   - Which portfolio holdings could be affected?
   - What regulatory risks might emerge?
   - What reputational considerations exist?

## TONE REQUIREMENTS

- Neutral and non-alarmist
- Decision-supportive (helps leadership decide what to do)
- Documentable (could be presented to the Board)
- Specific (avoid vague language)

Do NOT:
- Use sensationalist language
- Make predictions about stock prices
- Recommend specific trades
- Speculate beyond the evidence`;
  }
}
