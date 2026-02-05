import { NextRequest, NextResponse } from 'next/server';

export interface TraceContext<P = unknown> {
  requestId: string;
  start: number;
  latency: number;
  params: P;
}

export function withTracing<P = unknown>(
  handler: (req: NextRequest, ctx: TraceContext<P>) => Promise<NextResponse>,
) {
  return async (req: NextRequest, context: { params: P }) => {
    const requestId = crypto.randomUUID();
    const start = performance.now();

    const ctx: TraceContext<P> = {
      requestId,
      start,
      get latency() {
        return performance.now() - start;
      },
      params: context.params,
    };

    try {
      const res = await handler(req, ctx);

      if (res.headers.get('x-request-id') === null) {
        res.headers.set('x-request-id', requestId);
      }

      return res;
    } catch (error) {
      console.error('[withTracing] Unhandled error', {
        requestId,
        error,
      });

      return NextResponse.json(
        {
          error: 'Internal server error',
          requestId,
        },
        { status: 500 },
      );
    }
  };
}
