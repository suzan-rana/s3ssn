import { NextRequest, NextResponse } from 'next/server';
import { apiGet } from '@/lib/api';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const workspaceId = req.nextUrl.searchParams.get('workspaceId');
  if (!workspaceId) return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });
  const res = await apiGet<{ url: string }>(
    `/integrations/github/authorize-url?workspaceId=${encodeURIComponent(workspaceId)}`,
  );
  if (!res) return NextResponse.redirect(new URL('/login', req.url));
  return NextResponse.redirect(res.url);
}
