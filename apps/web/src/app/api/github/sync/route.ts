import { NextRequest, NextResponse } from 'next/server';
import { apiGet } from '@/lib/api';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const workspaceId = req.nextUrl.searchParams.get('workspaceId');
  if (!workspaceId) return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });
  const result = await apiGet<unknown>(
    `/integrations/github/sync?workspaceId=${encodeURIComponent(workspaceId)}`,
  );
  if (!result) return NextResponse.redirect(new URL('/login', req.url));
  return NextResponse.redirect(new URL(`/settings?synced=1`, req.url));
}
