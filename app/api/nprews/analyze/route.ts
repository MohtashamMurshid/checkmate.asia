/**
 * NPREWS Analysis API Route
 * 
 * Orchestrates all NPREWS agents to analyze documents for narrative risk.
 * 
 * POST /api/nprews/analyze
 * 
 * Input:
 * - documents: Array of documents to analyze
 * - OR url: URL to fetch and analyze
 * - OR text: Plain text to analyze
 * 
 * Output:
 * - signals: All detected signals from agents
 * - brief: Narrative brief if warranted
 * - metadata: Analysis statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { getOrchestrator, type TextCorpus, type Document, type NPREWSResult } from '@/lib/agents';

// Route segment config
export const maxDuration = 60;
export const runtime = 'nodejs';

// Initialize Convex client for saving results
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface AnalyzeRequest {
  documents?: Array<{
    text: string;
    source: string;
    url?: string;
    publishedAt?: string;
    sourceType?: 'parliamentary' | 'regulatory' | 'media' | 'social';
  }>;
  url?: string;
  text?: string;
  source?: string;
  sourceType?: 'parliamentary' | 'regulatory' | 'media' | 'social';
}

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRequest = await req.json();

    // Build corpus from input
    let corpus: TextCorpus;

    if (body.documents && body.documents.length > 0) {
      // Direct document input
      corpus = {
        documents: body.documents.map((d) => ({
          text: d.text,
          source: d.source,
          url: d.url,
          publishedAt: d.publishedAt,
          sourceType: d.sourceType || 'media',
        })),
      };
    } else if (body.url) {
      // Fetch content from URL using Exa
      const document = await fetchFromUrl(body.url);
      if (!document) {
        return NextResponse.json(
          { error: 'Failed to fetch content from URL' },
          { status: 400 }
        );
      }
      corpus = { documents: [document] };
    } else if (body.text) {
      // Plain text input
      corpus = {
        documents: [
          {
            text: body.text,
            source: body.source || 'Manual Input',
            sourceType: body.sourceType || 'media',
          },
        ],
      };
    } else {
      return NextResponse.json(
        { error: 'No input provided. Send documents, url, or text.' },
        { status: 400 }
      );
    }

    // Run the NPREWS analysis
    const orchestrator = getOrchestrator();
    const result = await orchestrator.analyze(corpus);

    // Save results to Convex
    await saveToConvex(result);

    // Return the result
    return NextResponse.json({
      success: true,
      ...result,
      agents: orchestrator.getAgentNames(),
    });
  } catch (error) {
    console.error('[NPREWS API] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Analysis failed',
      },
      { status: 500 }
    );
  }
}

/**
 * Fetch content from a URL using Exa API
 */
async function fetchFromUrl(url: string): Promise<Document | null> {
  const exaApiKey = process.env.EXA_API_KEY;
  if (!exaApiKey) {
    console.error('[NPREWS API] EXA_API_KEY not configured');
    return null;
  }

  try {
    const response = await fetch('https://api.exa.ai/contents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': exaApiKey,
      },
      body: JSON.stringify({
        urls: [url],
        text: {
          max_characters: 10000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Exa API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.results?.[0];

    if (!result || !result.text) {
      return null;
    }

    // Determine source type from URL
    let sourceType: 'parliamentary' | 'regulatory' | 'media' | 'social' = 'media';
    const lowerUrl = url.toLowerCase();

    if (
      lowerUrl.includes('parliament') ||
      lowerUrl.includes('hansard') ||
      lowerUrl.includes('gov.my')
    ) {
      sourceType = 'parliamentary';
    } else if (
      lowerUrl.includes('bnm.gov') ||
      lowerUrl.includes('sc.com') ||
      lowerUrl.includes('mcmc.gov')
    ) {
      sourceType = 'regulatory';
    } else if (
      lowerUrl.includes('twitter') ||
      lowerUrl.includes('facebook') ||
      lowerUrl.includes('x.com')
    ) {
      sourceType = 'social';
    }

    return {
      text: result.text,
      source: result.title || new URL(url).hostname,
      url,
      publishedAt: result.publishedDate,
      sourceType,
    };
  } catch (error) {
    console.error('[NPREWS API] Error fetching URL:', error);
    return null;
  }
}

/**
 * Save analysis results to Convex
 */
async function saveToConvex(result: NPREWSResult): Promise<void> {
  try {
    // Save narrative signals
    for (const signal of result.signals.narrative) {
      await convex.mutation(api.signals.createNarrativeSignal, {
        agentName: signal.agentName,
        hypothesis: signal.hypothesis,
        confidence: signal.confidence,
        frame: signal.frame,
        frameType: signal.frameType,
        previousFrame: signal.previousFrame,
        sectors: signal.sectors,
        riskTypes: signal.riskTypes,
        nationalPriorities: signal.nationalPriorities,
        evidence: signal.evidence.map((e) => ({
          source: e.source,
          quote: e.quote,
          url: e.url,
          publishedAt: e.publishedAt,
          sourceType: e.sourceType,
        })),
      });

      // Log to audit trail
      await convex.mutation(api.auditLog.logAction, {
        action: 'narrative_detected',
        entityType: 'narrative',
        entityId: signal.id,
        details: {
          frame: signal.frame,
          frameType: signal.frameType,
          confidence: signal.confidence,
        },
      });
    }

    // Save actor signals
    for (const signal of result.signals.actor) {
      await convex.mutation(api.signals.createActorSignal, {
        agentName: signal.agentName,
        hypothesis: signal.hypothesis,
        confidence: signal.confidence,
        actors: signal.actors.map((a) => ({
          name: a.name,
          category: a.category,
          role: a.role,
          legitimacyScore: a.legitimacyScore,
          quote: a.quote,
        })),
        legitimacyTransfer: signal.legitimacyTransfer,
        evidence: signal.evidence.map((e) => ({
          source: e.source,
          quote: e.quote,
          url: e.url,
          sourceType: e.sourceType,
        })),
      });

      // Log to audit trail
      await convex.mutation(api.auditLog.logAction, {
        action: 'actor_identified',
        entityType: 'actor',
        entityId: signal.id,
        details: {
          actorCount: signal.actors.length,
          hasLegitimacyTransfer: !!signal.legitimacyTransfer,
        },
      });
    }

    // Save brief if generated
    if (result.brief) {
      await convex.mutation(api.briefs.createNarrativeBrief, {
        title: result.brief.title,
        summary: result.brief.summary,
        whyItMatters: result.brief.whyItMatters,
        sectors: result.brief.sectors,
        riskTypes: result.brief.riskTypes,
        nationalPriorities: result.brief.nationalPriorities,
        regimeBand: result.brief.regimeBand,
        confidence: result.brief.confidence,
        contributingSignalIds: result.brief.contributingSignals,
        actors: result.brief.actors.map((a) => ({
          name: a.name,
          category: a.category,
          role: a.role,
          legitimacyScore: a.legitimacyScore,
        })),
        evidence: result.brief.evidence.map((e) => ({
          source: e.source,
          quote: e.quote,
          url: e.url,
          sourceType: e.sourceType,
        })),
        recommendedAction: result.brief.recommendedAction,
      });

      // Log to audit trail
      await convex.mutation(api.auditLog.logAction, {
        action: 'brief_generated',
        entityType: 'brief',
        entityId: result.brief.id,
        details: {
          regimeBand: result.brief.regimeBand,
          recommendedAction: result.brief.recommendedAction,
          signalCount: result.brief.contributingSignals.length,
        },
      });
    }
  } catch (error) {
    console.error('[NPREWS API] Error saving to Convex:', error);
    // Don't throw - we still want to return the result even if saving fails
  }
}

/**
 * GET handler for health check
 */
export async function GET() {
  const orchestrator = getOrchestrator();
  return NextResponse.json({
    status: 'ok',
    service: 'NPREWS Analysis API',
    agents: orchestrator.getAgentNames(),
    mandates: orchestrator.getAgentMandates(),
  });
}
