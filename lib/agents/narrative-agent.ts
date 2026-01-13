/**
 * NarrativeAgent (Module 5.1)
 * 
 * Mandate: "Detect when public discourse shifts how an issue is framed."
 * 
 * Detects:
 * - Emergence: New issue frames appearing
 * - Reframing: Existing issues being reframed
 * - Responsibility: Blame/credit being assigned
 * - Solution: Policy solutions being normalized
 */

import { generateObject } from 'ai';
import { z } from 'zod';
import type { RiskAgent } from './base';
import { generateId } from './base';
import type { NarrativeSignal, TextCorpus, RiskType, NationalPriority } from './types';
import { getOpenRouterProvider, getModelConfig } from '../ai/config';
import {
  detectSectors,
  detectRiskTypes,
  detectNationalPriorities,
  getPrioritiesFromSectors,
  KHAZANAH_SECTORS,
  type KhazanahSector,
} from './khazanah-sectors';

/**
 * Schema for narrative detection output
 */
const NarrativeDetectionSchema = z.object({
  narratives: z.array(
    z.object({
      frame: z.string().describe('One sentence summary of the narrative frame'),
      frameType: z.enum(['emergence', 'reframing', 'responsibility', 'solution']),
      previousFrame: z.string().optional().describe('Previous frame if this is a reframing'),
      sectors: z.array(z.string()).describe('Khazanah sectors affected'),
      confidence: z.number().min(0).max(1).describe('Confidence score'),
      evidence: z.array(
        z.object({
          source: z.string(),
          quote: z.string(),
          sourceType: z.string(),
        })
      ),
    })
  ),
});

export class NarrativeAgent implements RiskAgent<TextCorpus, NarrativeSignal[]> {
  name = 'NarrativeAgent';
  mandate = 'Detect when public discourse shifts how an issue is framed.';

  async observe(corpus: TextCorpus): Promise<NarrativeSignal[] | null> {
    if (!corpus.documents || corpus.documents.length === 0) {
      return null;
    }

    try {
      const provider = getOpenRouterProvider();
      const modelConfig = getModelConfig();

      // Use LLM with structured output to detect narrative frames
      const result = await generateObject({
        model: provider.chat(modelConfig.model),
        prompt: this.buildPrompt(corpus),
        schema: NarrativeDetectionSchema,
      });

      const signals: NarrativeSignal[] = [];

      for (const detection of result.object.narratives) {
        // Only emit signals above confidence threshold
        if (detection.confidence > 0.6) {
          // Validate and filter sectors to known Khazanah sectors
          const validSectors = detection.sectors.filter((s) =>
            KHAZANAH_SECTORS.includes(s as KhazanahSector)
          );

          // Also detect sectors from the frame text itself
          const detectedSectors = detectSectors(detection.frame);
          const allSectors = [...new Set([...validSectors, ...detectedSectors])];

          // Detect risk types from evidence
          const evidenceText = detection.evidence.map((e) => e.quote).join(' ');
          const riskTypes = detectRiskTypes(detection.frame + ' ' + evidenceText);

          // Detect national priorities
          const nationalPriorities = [
            ...detectNationalPriorities(detection.frame + ' ' + evidenceText),
            ...getPrioritiesFromSectors(allSectors as KhazanahSector[]),
          ];

          signals.push({
            id: generateId(),
            agentName: this.name,
            type: 'narrative',
            hypothesis: `"${detection.frame}" narrative detected`,
            frame: detection.frame,
            frameType: detection.frameType,
            previousFrame: detection.previousFrame,
            sectors: allSectors,
            riskTypes: [...new Set(riskTypes)] as RiskType[],
            nationalPriorities: [...new Set(nationalPriorities)] as NationalPriority[],
            confidence: detection.confidence,
            evidence: detection.evidence.map((e) => ({
              source: e.source,
              quote: e.quote,
              sourceType: e.sourceType as 'parliamentary' | 'regulatory' | 'media' | 'social',
            })),
            createdAt: Date.now(),
          });
        }
      }

      return signals.length > 0 ? signals : null;
    } catch (error) {
      console.error('[NarrativeAgent] Error detecting narratives:', error);
      return null;
    }
  }

  private buildPrompt(corpus: TextCorpus): string {
    const documentsText = corpus.documents
      .map((d) => `[${d.sourceType.toUpperCase()}] ${d.source}:\n"${d.text}"`)
      .join('\n\n---\n\n');

    return `You are a narrative detection specialist for Khazanah Nasional, Malaysia's sovereign wealth fund.

Your task is to analyze documents and identify narrative frames being established in public, political, and policy discourse.

## DOCUMENTS TO ANALYZE

${documentsText}

## WHAT TO DETECT

1. **Emergence**: New issue frames appearing for the first time
   - Example: "Data centers are straining Malaysia's power grid" (new concern)

2. **Reframing**: Existing issues being reframed differently
   - Example: "Energy pricing" reframed from "market efficiency" to "public welfare"

3. **Responsibility**: Blame or credit being assigned to actors
   - Example: "Foreign tech companies are exploiting Malaysian resources"

4. **Solution**: Policy solutions being normalized in discourse
   - Example: "Government intervention in electricity pricing is necessary"

## KHAZANAH SECTORS TO MAP

Only use these sector names:
- energy
- utilities
- infrastructure
- healthcare
- telecommunications
- financial_services
- technology
- real_estate
- aviation
- media

## OUTPUT REQUIREMENTS

For each narrative detected, provide:
1. **Frame**: One sentence summary of the narrative frame
2. **Frame Type**: emergence, reframing, responsibility, or solution
3. **Previous Frame**: If reframing, what was the previous frame?
4. **Sectors**: Which Khazanah sectors are affected?
5. **Confidence**: How confident are you? (0.0 to 1.0)
6. **Evidence**: Exact quotes with sources that support this detection

## QUALITY GUIDELINES

- Be specific and concrete in frame descriptions
- Only detect narratives with clear evidence
- Map to specific Khazanah sectors where possible
- Confidence should reflect strength of evidence
- Reframings are especially important to detect`;
  }
}
