import { analyzeFactBiasSentimentSpans } from '@/lib/ai/tools/fact-bias-sentiment';

export const runtime = 'nodejs';
export const maxDuration = 30;

export interface AnalyzeTextRequest {
  text: string;
}

export interface AnalyzeTextResponse {
  text: string;
  spans: Awaited<ReturnType<typeof analyzeFactBiasSentimentSpans>>;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<AnalyzeTextRequest>;

    if (!body || typeof body.text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Request body must include a text string.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const text = body.text ?? '';
    const spans = await analyzeFactBiasSentimentSpans(text);

    const response: AnalyzeTextResponse = {
      text,
      spans,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in /api/analyze-text:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'Failed to analyze text.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}


