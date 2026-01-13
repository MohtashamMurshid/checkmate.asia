/**
 * ActorLegitimacyAgent (Module 5.3)
 * 
 * Mandate: "Identify who is speaking and whether institutional legitimacy is being transferred."
 * 
 * Detects:
 * - Originators: First to articulate a narrative
 * - Amplifiers: Repeating/spreading the narrative
 * - Legitimisers: Institutional figures validating it
 * 
 * Key Signal: When a legitimiser (minister, regulator) picks up an originator's (NGO, MP) 
 * narrative, that's a regime shift signal.
 */

import { generateObject } from 'ai';
import { z } from 'zod';
import type { RiskAgent } from './base';
import { generateId } from './base';
import type { ActorSignal, ActorInfo, ActorCategory, TextCorpus, LegitimacyTransfer } from './types';
import { getOpenRouterProvider, getModelConfig } from '../ai/config';

/**
 * Input type for ActorLegitimacyAgent
 */
export interface ActorAgentInput extends TextCorpus {
  /** The narrative being tracked (provides context) */
  narrativeContext?: string;
}

/**
 * Khazanah-specific legitimacy weights for actor categories
 */
const ACTOR_WEIGHTS: Record<ActorCategory, { authority: number; influence: number; credibility: number }> = {
  minister: { authority: 95, influence: 90, credibility: 80 },
  regulator: { authority: 90, influence: 85, credibility: 85 },
  central_bank: { authority: 95, influence: 95, credibility: 90 },
  mp: { authority: 70, influence: 60, credibility: 60 },
  ngo_major: { authority: 50, influence: 65, credibility: 70 },
  industry_body: { authority: 60, influence: 70, credibility: 65 },
  tier1_media: { authority: 40, influence: 75, credibility: 75 },
  academic: { authority: 70, influence: 40, credibility: 85 },
  analyst: { authority: 50, influence: 50, credibility: 60 },
};

/**
 * Schema for actor extraction
 */
const ActorExtractionSchema = z.object({
  actors: z.array(
    z.object({
      name: z.string().describe('Name of the actor'),
      category: z.enum([
        'minister',
        'regulator',
        'mp',
        'central_bank',
        'ngo_major',
        'industry_body',
        'tier1_media',
        'academic',
        'analyst',
      ]),
      role: z.enum(['originator', 'amplifier', 'legitimiser']),
      quote: z.string().optional().describe('Key quote from this actor'),
    })
  ),
});

export class ActorLegitimacyAgent implements RiskAgent<ActorAgentInput, ActorSignal | null> {
  name = 'ActorLegitimacyAgent';
  mandate = 'Identify who is speaking and whether institutional legitimacy is being transferred.';

  async observe(input: ActorAgentInput): Promise<ActorSignal | null> {
    if (!input.documents || input.documents.length === 0) {
      return null;
    }

    try {
      const provider = getOpenRouterProvider();
      const modelConfig = getModelConfig();

      // Extract actors from documents
      const result = await generateObject({
        model: provider.chat(modelConfig.model),
        prompt: this.buildPrompt(input),
        schema: ActorExtractionSchema,
      });

      if (result.object.actors.length === 0) {
        return null;
      }

      // Calculate legitimacy scores for each actor
      const actors: ActorInfo[] = result.object.actors.map((a) => ({
        ...a,
        legitimacyScore: this.calculateLegitimacy(a.category),
      }));

      // Detect legitimacy transfer (key signal!)
      const legitimacyTransfer = this.detectLegitimacyTransfer(
        actors,
        input.narrativeContext
      );

      // Build hypothesis based on findings
      let hypothesis: string;
      let confidence: number;

      if (legitimacyTransfer) {
        // High-confidence signal: legitimacy transfer detected
        hypothesis = `Legitimacy transfer detected: ${legitimacyTransfer.from} narrative adopted by ${legitimacyTransfer.to}`;
        confidence = 0.9;
      } else {
        const legitimiser = actors.find((a) => a.role === 'legitimiser');
        if (legitimiser) {
          hypothesis = `${legitimiser.name} (${legitimiser.category}) legitimising narrative`;
          confidence = 0.75;
        } else {
          hypothesis = `${actors.length} actors identified in narrative discourse`;
          confidence = 0.6;
        }
      }

      return {
        id: generateId(),
        agentName: this.name,
        type: 'actor',
        hypothesis,
        actors,
        legitimacyTransfer,
        confidence,
        evidence: actors
          .filter((a) => a.quote)
          .map((a) => ({
            source: a.name,
            quote: a.quote || '',
            sourceType: 'analysis' as const,
          })),
        createdAt: Date.now(),
      };
    } catch (error) {
      console.error('[ActorLegitimacyAgent] Error extracting actors:', error);
      return null;
    }
  }

  /**
   * Calculate legitimacy score from actor category
   */
  private calculateLegitimacy(category: ActorCategory): number {
    const weights = ACTOR_WEIGHTS[category];
    return Math.round((weights.authority + weights.influence + weights.credibility) / 3);
  }

  /**
   * Detect legitimacy transfer between actors
   * 
   * Key signal: when a high-legitimacy actor adopts a low-legitimacy actor's narrative
   */
  private detectLegitimacyTransfer(
    actors: ActorInfo[],
    narrativeContext?: string
  ): LegitimacyTransfer | undefined {
    const originator = actors.find((a) => a.role === 'originator');
    const legitimiser = actors.find((a) => a.role === 'legitimiser');

    // Legitimacy transfer occurs when:
    // 1. There's both an originator and a legitimiser
    // 2. The legitimiser has significantly higher legitimacy (>20 points)
    if (
      originator &&
      legitimiser &&
      legitimiser.legitimacyScore > originator.legitimacyScore + 20
    ) {
      return {
        from: `${originator.name} (${originator.category})`,
        to: `${legitimiser.name} (${legitimiser.category})`,
        narrative: narrativeContext || 'Unknown narrative',
      };
    }

    return undefined;
  }

  private buildPrompt(input: ActorAgentInput): string {
    const documentsText = input.documents
      .map((d) => `[${d.sourceType.toUpperCase()}] ${d.source}:\n"${d.text}"`)
      .join('\n\n---\n\n');

    return `You are an actor legitimacy analyst for Khazanah Nasional, Malaysia's sovereign wealth fund.

Your task is to identify all actors (speakers, sources) in these documents and classify their role in the narrative.

## DOCUMENTS TO ANALYZE

${documentsText}

${input.narrativeContext ? `## NARRATIVE CONTEXT\n\nThe narrative being tracked: "${input.narrativeContext}"\n` : ''}

## ACTOR CATEGORIES

Use ONLY these categories:

**High Legitimacy (Government)**
- minister: Government ministers (Cabinet members)
- regulator: Regulatory bodies (SC, BNM, MCMC, Suruhanjaya Tenaga, etc.)
- central_bank: Bank Negara Malaysia

**Medium Legitimacy (Parliament & Institutions)**
- mp: Members of Parliament (both government and opposition)
- academic: University researchers, professors
- industry_body: Industry associations (FMM, REHDA, etc.)

**Variable Legitimacy (Civil Society & Media)**
- ngo_major: Major NGOs (established organizations)
- tier1_media: Major news outlets (The Star, NST, Malaysiakini, etc.)
- analyst: Financial/market analysts

## ACTOR ROLES

- **originator**: First to articulate this narrative (often NGOs, opposition MPs, academics)
- **amplifier**: Repeating/spreading the narrative (often media, industry bodies)
- **legitimiser**: Institutional figure validating it (often ministers, regulators)

## KEY INSIGHT

When a high-legitimacy actor (minister, regulator) adopts a narrative first articulated by a lower-legitimacy actor (NGO, opposition MP), this signals potential regime shift.

## OUTPUT REQUIREMENTS

For each actor identified:
1. **Name**: Full name or organization name
2. **Category**: One of the categories above
3. **Role**: originator, amplifier, or legitimiser
4. **Quote**: A key quote from this actor (if available)

Be specific about actor names. If the speaker is "Minister of Energy", try to identify the actual name if mentioned.`;
  }
}

/**
 * Export the legitimacy weights for use in other modules
 */
export { ACTOR_WEIGHTS };
