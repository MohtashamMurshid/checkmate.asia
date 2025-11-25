import { analyzeRow } from '@/lib/ai/tools/dataset-analysis';

// Route segment config
export const maxDuration = 59;
export const runtime = 'nodejs';

export interface AnalyzeRequest {
  rows: string[];
  options?: {
    checkBias?: boolean;
    checkSentiment?: boolean;
    checkFacts?: boolean;
  };
}

export interface RowResult {
  index: number;
  text: string;
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
  error?: string;
}

/**
 * POST /api/analyze
 * Streaming endpoint that processes rows through parallel agents
 * Returns Server-Sent Events with real-time progress
 */
export async function POST(req: Request) {
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

    const { checkBias = true, checkSentiment = true, checkFacts = true } = options;

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

        // Process rows with concurrency limit (3 at a time to avoid rate limits)
        const concurrencyLimit = 3;
        const results: RowResult[] = [];

        for (let i = 0; i < rows.length; i += concurrencyLimit) {
          const batch = rows.slice(i, i + concurrencyLimit);
          const batchPromises = batch.map(async (text, batchIndex) => {
            const globalIndex = i + batchIndex;
            
            try {
              const result = await analyzeRow(text, {
                checkBias,
                checkSentiment,
                checkFacts,
              });

              const rowResult: RowResult = {
                index: globalIndex,
                text: result.text,
                bias: result.bias,
                sentiment: result.sentiment,
                factCheck: result.factCheck,
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
                text,
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

        // Calculate aggregated stats
        const stats = calculateStats(results);

        // Send completion event with aggregated stats
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'complete',
              stats,
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
 * Calculate aggregated statistics from results
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
  };
}

