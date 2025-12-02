import { analyzeRowRouted } from '@/lib/ai/tools/dataset-analysis';
import { preprocessText, generateHash } from '@/lib/ai/utils/preprocessor';
import { calculateAggregateStats, type AggregatedResult } from '@/lib/ai/utils/aggregator';
import { getRoutingStats, estimateCostSavings, type RouterDecision } from '@/lib/ai/tools/router';

// Route segment config
export const maxDuration = 59;
export const runtime = 'nodejs';

export interface AnalyzeRequest {
  rows: string[];
  options?: {
    checkBias?: boolean;
    checkSentiment?: boolean;
    checkFacts?: boolean;
    skipRouting?: boolean; // Option to skip router and run all agents
  };
}

/**
 * Extended RowResult with new fields for routing and risk score
 */
export interface RowResult {
  index: number;
  text: string;
  hash: string;
  bias?: {
    gender: { score: number; direction: string; examples: string[] };
    religion: { score: number; targetReligion?: string; examples: string[] };
    political: { score: number; leaning: string; examples: string[] };
    overallBiasScore: number;
    flagged: boolean;
    summary: string;
  };
  sentiment?: {
    sentiment: string;
    confidence: number;
    scores: { positive: number; negative: number; neutral: number };
    reasoning: string;
  };
  factCheck?: {
    verified: boolean;
    status: string;
    confidence: number;
    findings: Array<{
      claim: string;
      verdict: string;
      source?: string;
      explanation: string;
    }>;
    summary: string;
    skipped?: boolean;
  };
  // New fields for routed pipeline
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  routingDecision: {
    intent: string;
    confidence: number;
    agentsNeeded: string[];
    reasoning: string;
  };
  agentsRun: string[];
  fromCache: boolean;
  error?: string;
}

/**
 * Pipeline metrics for tracking performance
 */
export interface PipelineMetrics {
  routerDecisions: {
    factCheck: number;
    biasCheck: number;
    sentiment: number;
    safe: number;
  };
  cacheHits: number;
  cacheMisses: number;
  avgRiskScore: number;
  highRiskCount: number;
  processingTimeMs: number;
  costSavings: {
    totalPossibleAgentCalls: number;
    actualAgentCalls: number;
    savedCalls: number;
    savingsPercent: number;
  };
}

// Simple in-memory cache for this request (will be replaced by Convex cache)
const requestCache = new Map<string, AggregatedResult>();

/**
 * POST /api/analyze
 * Streaming endpoint that processes rows through the routed pipeline
 * Returns Server-Sent Events with real-time progress
 */
export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    const { rows, options = {} }: AnalyzeRequest = await req.json();

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'rows array is required and must not be empty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Limit to 100 rows for real-time processing
    if (rows.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Maximum 100 rows allowed for real-time analysis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { 
      checkBias = true, 
      checkSentiment = true, 
      checkFacts = true,
      skipRouting = false 
    } = options;

    // Clear request cache for new request
    requestCache.clear();

    // Create a readable stream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial event
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'start', total: rows.length })}\n\n`
          )
        );

        // Track metrics
        let cacheHits = 0;
        let cacheMisses = 0;
        const routingDecisions: RouterDecision[] = [];

        // Process rows with concurrency limit (3 at a time to avoid rate limits)
        const concurrencyLimit = 3;
        const results: RowResult[] = [];

        for (let i = 0; i < rows.length; i += concurrencyLimit) {
          const batch = rows.slice(i, i + concurrencyLimit);
          const batchPromises = batch.map(async (rawText, batchIndex) => {
            const globalIndex = i + batchIndex;
            
            try {
              // Step 1: Pre-process the text
              const preprocessed = preprocessText(rawText);
              const hash = preprocessed.hash;

              // Step 2: Check in-memory cache
              const cached = requestCache.get(hash);
              if (cached) {
                cacheHits++;
                const rowResult: RowResult = {
                  index: globalIndex,
                  text: preprocessed.cleanedText,
                  hash,
                  bias: cached.bias,
                  sentiment: cached.sentiment,
                  factCheck: cached.factCheck,
                  riskScore: cached.riskScore,
                  riskLevel: cached.riskLevel,
                  confidence: cached.confidence,
                  routingDecision: {
                    intent: cached.routingDecision.intent,
                    confidence: cached.routingDecision.confidence,
                    agentsNeeded: cached.routingDecision.agentsNeeded,
                    reasoning: cached.routingDecision.reasoning,
                  },
                  agentsRun: cached.agentsRun,
                  fromCache: true,
                };

                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: 'row', result: rowResult })}\n\n`
                  )
                );

                return rowResult;
              }

              cacheMisses++;

              // Step 3: Run routed analysis
              const result = await analyzeRowRouted(
                preprocessed.cleanedText,
                { checkBias, checkSentiment, checkFacts },
                skipRouting
              );

              // Track routing decision
              routingDecisions.push(result.routingDecision);

              // Cache the result
              requestCache.set(hash, result);

              const rowResult: RowResult = {
                index: globalIndex,
                text: result.text,
                hash,
                bias: result.bias,
                sentiment: result.sentiment,
                factCheck: result.factCheck,
                riskScore: result.riskScore,
                riskLevel: result.riskLevel,
                confidence: result.confidence,
                routingDecision: {
                  intent: result.routingDecision.intent,
                  confidence: result.routingDecision.confidence,
                  agentsNeeded: result.routingDecision.agentsNeeded,
                  reasoning: result.routingDecision.reasoning,
                },
                agentsRun: result.agentsRun,
                fromCache: false,
                error: result.error,
              };

              // Stream this result immediately
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'row', result: rowResult })}\n\n`
                )
              );

              return rowResult;
            } catch (error) {
              const errorResult: RowResult = {
                index: globalIndex,
                text: rawText,
                hash: generateHash(rawText),
                riskScore: 0,
                riskLevel: 'low',
                confidence: 0,
                routingDecision: {
                  intent: 'mixed',
                  confidence: 0,
                  agentsNeeded: [],
                  reasoning: 'Error during processing',
                },
                agentsRun: [],
                fromCache: false,
                error: error instanceof Error ? error.message : 'Unknown error',
              };

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'row', result: errorResult })}\n\n`
                )
              );

              return errorResult;
            }
          });

          const batchResults = await Promise.all(batchPromises);
          results.push(...batchResults);

          // Send progress update
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'progress',
                completed: Math.min(i + concurrencyLimit, rows.length),
                total: rows.length,
              })}\n\n`
            )
          );
        }

        // Calculate aggregated stats (legacy format for backward compatibility)
        const stats = calculateStats(results);
        
        // Calculate routing stats and cost savings
        const routingStats = getRoutingStats(routingDecisions);
        const costSavings = estimateCostSavings(routingDecisions);

        // Calculate pipeline metrics
        const processingTimeMs = Date.now() - startTime;
        const aggregateStats = calculateAggregateStats(
          results.map(r => ({
            text: r.text,
            bias: r.bias as any,
            sentiment: r.sentiment as any,
            factCheck: r.factCheck as any,
            riskScore: r.riskScore,
            riskLevel: r.riskLevel,
            confidence: r.confidence,
            routingDecision: r.routingDecision as any,
            agentsRun: r.agentsRun as any,
            fromCache: r.fromCache,
            error: r.error,
          }))
        );

        const metrics: PipelineMetrics = {
          routerDecisions: {
            factCheck: routingStats.agentCounts.factCheck,
            biasCheck: routingStats.agentCounts.bias,
            sentiment: routingStats.agentCounts.sentiment,
            safe: routingStats.skipCount,
          },
          cacheHits,
          cacheMisses,
          avgRiskScore: aggregateStats.avgRiskScore,
          highRiskCount: aggregateStats.highRiskCount,
          processingTimeMs,
          costSavings,
        };

        // Send completion event with aggregated stats and metrics
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'complete',
              stats,
              metrics,
              totalRows: rows.length,
              processedRows: results.length,
              errorCount: results.filter(r => r.error).length,
            })}\n\n`
          )
        );

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in analyze API:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Analysis failed',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Calculate aggregated statistics from results (legacy format)
 */
function calculateStats(results: RowResult[]) {
  const validResults = results.filter(r => !r.error);

  // Bias stats
  const biasResults = validResults.filter(r => r.bias);
  const avgBiasScore = biasResults.length > 0
    ? biasResults.reduce((sum, r) => sum + (r.bias?.overallBiasScore || 0), 0) / biasResults.length
    : 0;
  const flaggedCount = biasResults.filter(r => r.bias?.flagged).length;

  // Sentiment stats
  const sentimentResults = validResults.filter(r => r.sentiment);
  const sentimentDistribution = {
    positive: sentimentResults.filter(r => r.sentiment?.sentiment === 'positive').length,
    negative: sentimentResults.filter(r => r.sentiment?.sentiment === 'negative').length,
    neutral: sentimentResults.filter(r => r.sentiment?.sentiment === 'neutral').length,
    mixed: sentimentResults.filter(r => r.sentiment?.sentiment === 'mixed').length,
  };

  // Fact check stats
  const factCheckResults = validResults.filter(r => r.factCheck);
  const factCheckDistribution = {
    verified: factCheckResults.filter(r => r.factCheck?.status === 'verified').length,
    disputed: factCheckResults.filter(r => r.factCheck?.status === 'disputed').length,
    unverified: factCheckResults.filter(r => r.factCheck?.status === 'unverified').length,
    mixed: factCheckResults.filter(r => r.factCheck?.status === 'mixed').length,
    noClaims: factCheckResults.filter(r => r.factCheck?.status === 'no_claims').length,
  };

  // Per-category bias breakdown
  const biasBreakdown = {
    gender: {
      avg: biasResults.length > 0 
        ? biasResults.reduce((sum, r) => sum + (r.bias?.gender.score || 0), 0) / biasResults.length 
        : 0,
      flagged: biasResults.filter(r => (r.bias?.gender.score || 0) > 0.5).length,
    },
    religion: {
      avg: biasResults.length > 0
        ? biasResults.reduce((sum, r) => sum + (r.bias?.religion.score || 0), 0) / biasResults.length
        : 0,
      flagged: biasResults.filter(r => (r.bias?.religion.score || 0) > 0.5).length,
    },
    political: {
      avg: biasResults.length > 0
        ? biasResults.reduce((sum, r) => sum + (r.bias?.political.score || 0), 0) / biasResults.length
        : 0,
      flagged: biasResults.filter(r => (r.bias?.political.score || 0) > 0.5).length,
    },
  };

  // Risk score stats (new)
  const riskScores = validResults.map(r => r.riskScore);
  const avgRiskScore = riskScores.length > 0
    ? riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length
    : 0;
  const highRiskCount = validResults.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length;

  return {
    bias: {
      avgScore: avgBiasScore,
      flaggedCount,
      breakdown: biasBreakdown,
    },
    sentiment: {
      distribution: sentimentDistribution,
      avgConfidence: sentimentResults.length > 0
        ? sentimentResults.reduce((sum, r) => sum + (r.sentiment?.confidence || 0), 0) / sentimentResults.length
        : 0,
    },
    factCheck: {
      distribution: factCheckDistribution,
      avgConfidence: factCheckResults.filter(r => r.factCheck?.status !== 'no_claims').length > 0
        ? factCheckResults
            .filter(r => r.factCheck?.status !== 'no_claims')
            .reduce((sum, r) => sum + (r.factCheck?.confidence || 0), 0) /
          factCheckResults.filter(r => r.factCheck?.status !== 'no_claims').length
        : 0,
    },
    // New risk score stats
    risk: {
      avgScore: avgRiskScore,
      highRiskCount,
      distribution: {
        low: validResults.filter(r => r.riskLevel === 'low').length,
        medium: validResults.filter(r => r.riskLevel === 'medium').length,
        high: validResults.filter(r => r.riskLevel === 'high').length,
        critical: validResults.filter(r => r.riskLevel === 'critical').length,
      },
    },
  };
}
