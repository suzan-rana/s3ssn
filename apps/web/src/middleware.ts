import { NextRequest, NextResponse } from 'next/server';

const APP_ROUTES = [
  '/dashboard',
  '/today',
  '/sessions',
  '/repositories',
  '/commits',
  '/pulls',
  '/settings',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!APP_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }
  if (req.cookies.get('s3ssn_token')) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/today/:path*',
    '/sessions/:path*',
    '/repositories/:path*',
    '/commits/:path*',
    '/pulls/:path*',
    '/settings',
    '/settings/:path*',
  ],
};
