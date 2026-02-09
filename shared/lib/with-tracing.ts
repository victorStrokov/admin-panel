import { NextRequest, NextResponse } from 'next/server';

export interface TraceContext<P> {
  params: P;
  requestId: string;
  start: number;
  latency: number;
}

export function withTracing<P>(
  handler: (req: NextRequest, ctx: TraceContext<P>) => Promise<NextResponse>,
) {
  return async (req: NextRequest, ctx: { params: P }) => {
    const requestId = crypto.randomUUID();
    const start = performance.now();

    const newCtx: TraceContext<P> = {
      params: ctx.params,
      requestId,
      start,
      get latency() {
        return performance.now() - start;
      },
    };

    try {
      const res = await handler(req, newCtx);

      if (!res.headers.get('x-request-id')) {
        res.headers.set('x-request-id', requestId);
      }

      return res;
    } catch (error) {
      console.error('[withTracing] Unhandled error', { requestId, error });

      return NextResponse.json(
        { error: 'Internal server error', requestId },
        { status: 500 },
      );
    }
  };
}
