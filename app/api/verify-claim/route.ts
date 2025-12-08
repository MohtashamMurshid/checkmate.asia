import { verifyClaimWithWebSearch } from '@/lib/ai/tools/fact-verification';

export const runtime = 'nodejs';
export const maxDuration = 45;

export interface VerifyClaimRequest {
  claim: string;
  context?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<VerifyClaimRequest>;

    if (!body || typeof body.claim !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Request body must include a claim string.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const claim = body.claim ?? '';
    const context =
      typeof body.context === 'string' ? body.context : undefined;

    const result = await verifyClaimWithWebSearch({ claim, context });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in /api/verify-claim:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'Failed to verify claim.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}


