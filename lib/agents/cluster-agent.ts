/**
 * ClusterAgent (Module 5.2 - Simple Implementation)
 * 
 * Mandate: "Group narratives by meaning to reveal coordinated messaging."
 * 
 * Uses:
 * - OpenAI embeddings API for generating embeddings
 * - Cosine similarity for measuring similarity
 * - Simple threshold-based clustering (no ML libraries)
 * 
 * When multiple narratives cluster together, it indicates:
 * - Coordinated messaging
 * - Emerging consensus
 * - Potential regime formation
 */

import { generateObject } from 'ai';
import { z } from 'zod';
import OpenAI from 'openai';
import type { RiskAgent } from './base';
import { generateId } from './base';
import type { ClusterSignal, NarrativeInput } from './types';
import { getOpenRouterProvider, getModelConfig } from '../ai/config';

// Initialize OpenAI client for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Schema for cluster analysis
 */
const ClusterAnalysisSchema = z.object({
  coreThesis: z.string().describe('What all these narratives are essentially saying'),
  supportingArguments: z.array(z.string()).describe('Arguments used to support this thesis'),
  counterArguments: z.array(z.string()).describe('Counter-arguments that exist'),
  moralFraming: z.string().describe('The moral framing (fairness, security, efficiency, sovereignty, etc.)'),
});

/**
 * Internal cluster structure during processing
 */
interface InternalCluster {
  narrativeIds: string[];
  frames: string[];
  centroid: number[];
}

export class ClusterAgent implements RiskAgent<NarrativeInput, ClusterSignal[]> {
  name = 'ClusterAgent';
  mandate = 'Group narratives by meaning to reveal coordinated messaging.';

  /** Similarity threshold for clustering (0.75 = semantically similar) */
  private SIMILARITY_THRESHOLD = 0.75;

  /** Minimum cluster size to emit a signal */
  private MIN_CLUSTER_SIZE = 2;

  async observe(input: NarrativeInput): Promise<ClusterSignal[] | null> {
    // Need at least 2 narratives to form clusters
    if (!input.narratives || input.narratives.length < 2) {
      return null;
    }

    try {
      // 1. Generate embeddings for all narrative frames using OpenAI
      const embeddings = await this.generateEmbeddings(
        input.narratives.map((n) => n.frame)
      );
      
      if (!embeddings || embeddings.length !== input.narratives.length) {
        console.error('[ClusterAgent] Failed to generate embeddings');
        return null;
      }

      // 2. Simple threshold-based clustering
      const clusters: InternalCluster[] = [];

      for (let i = 0; i < input.narratives.length; i++) {
        let assigned = false;

        // Try to assign to existing cluster
        for (const cluster of clusters) {
          const similarity = this.cosineSimilarity(embeddings[i], cluster.centroid);
          if (similarity > this.SIMILARITY_THRESHOLD) {
            cluster.narrativeIds.push(input.narratives[i].id);
            cluster.frames.push(input.narratives[i].frame);
            // Update centroid (simple average of current centroid and new embedding)
            cluster.centroid = this.averageVectors([cluster.centroid, embeddings[i]]);
            assigned = true;
            break;
          }
        }

        // Create new cluster if no match
        if (!assigned) {
          clusters.push({
            narrativeIds: [input.narratives[i].id],
            frames: [input.narratives[i].frame],
            centroid: embeddings[i],
          });
        }
      }

      // 3. Only emit signals for clusters with minimum size
      const significantClusters = clusters.filter(
        (c) => c.narrativeIds.length >= this.MIN_CLUSTER_SIZE
      );

      if (significantClusters.length === 0) {
        return null;
      }

      // 4. Use LLM to analyze each significant cluster
      const provider = getOpenRouterProvider();
      const modelConfig = getModelConfig();
      const signals: ClusterSignal[] = [];

      for (const cluster of significantClusters) {
        try {
          const analysis = await generateObject({
            model: provider.chat(modelConfig.model),
            prompt: this.buildAnalysisPrompt(cluster.frames),
            schema: ClusterAnalysisSchema,
          });

          // Confidence increases with cluster size
          const confidence = Math.min(0.5 + cluster.narrativeIds.length * 0.1, 0.95);

          signals.push({
            id: generateId(),
            agentName: this.name,
            type: 'cluster',
            hypothesis: `${cluster.narrativeIds.length} narratives cluster around: "${analysis.object.coreThesis}"`,
            coreThesis: analysis.object.coreThesis,
            supportingArguments: analysis.object.supportingArguments,
            counterArguments: analysis.object.counterArguments,
            moralFraming: analysis.object.moralFraming,
            narrativeIds: cluster.narrativeIds,
            clusterSize: cluster.narrativeIds.length,
            confidence,
            evidence: cluster.frames.map((f) => ({
              source: 'Narrative',
              quote: f,
              sourceType: 'analysis' as const,
            })),
            createdAt: Date.now(),
          });
        } catch (error) {
          console.error('[ClusterAgent] Error analyzing cluster:', error);
          // Continue with other clusters
        }
      }

      return signals.length > 0 ? signals : null;
    } catch (error) {
      console.error('[ClusterAgent] Error clustering narratives:', error);
      return null;
    }
  }

  /**
   * Calculate average of vectors (simple centroid update)
   */
  private averageVectors(vectors: number[][]): number[] {
    if (vectors.length === 0) return [];
    const dimensions = vectors[0].length;
    const result = new Array(dimensions).fill(0);

    for (const vec of vectors) {
      for (let i = 0; i < dimensions; i++) {
        result[i] += vec[i];
      }
    }

    return result.map((v) => v / vectors.length);
  }

  /**
   * Generate embeddings using OpenAI API
   */
  private async generateEmbeddings(texts: string[]): Promise<number[][] | null> {
    try {
      // Check if API key is available
      if (!process.env.OPENAI_API_KEY) {
        console.error('[ClusterAgent] OPENAI_API_KEY not configured');
        return null;
      }

      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts,
      });

      return response.data.map((d) => d.embedding);
    } catch (error) {
      console.error('[ClusterAgent] Error generating embeddings:', error);
      return null;
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  /**
   * Build prompt for cluster analysis
   */
  private buildAnalysisPrompt(frames: string[]): string {
    return `You are analyzing a cluster of related narratives that have been grouped by semantic similarity.

## NARRATIVES IN THIS CLUSTER

${frames.map((f, i) => `${i + 1}. "${f}"`).join('\n')}

## YOUR TASK

Analyze what these narratives have in common and identify:

1. **Core Thesis**: What are all these narratives essentially saying? (One sentence)

2. **Supporting Arguments**: What arguments are being used to support this thesis?

3. **Counter-Arguments**: What counter-arguments exist or could be made?

4. **Moral Framing**: What moral frame is being used?
   - Fairness (equity, justice)
   - Security (safety, protection)
   - Efficiency (markets, optimization)
   - Sovereignty (national control, independence)
   - Welfare (public good, social benefit)
   - Other

## IMPORTANT

- Be specific and concrete
- The core thesis should capture what unites all these narratives
- Moral framing is critical for understanding how the narrative appeals to values`;
  }
}
