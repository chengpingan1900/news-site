import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Geo-blocking Logic for China
  // We check standard headers from Render/Cloudflare/Vercel
  const country = request.headers.get('x-render-ip-country') || 
                  request.headers.get('cf-ipcountry') || 
                  request.headers.get('x-vercel-ip-country');

  if (country === 'CN') {
    // To simulate a "Connection Timed Out" or "Network Error", 
    // we can return a 444 No Response (Nginx style) or simply a 403.
    // Since we can't truly drop the TCP connection in Node middleware, 
    // we return a 403 Forbidden which will look like a block.
    // Or, we could try to return a never-ending promise to simulate timeout (but Render might kill it).
    // Let's stick to a hard 403 for now, which is standard for geo-blocking.
    return new NextResponse(null, { status: 403, statusText: 'Forbidden' });
  }

  // 2. Protect /admin routes
  if (path.startsWith('/admin')) {
    const authSession = request.cookies.get('auth_session');

    if (!authSession || authSession.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Apply to all routes to check geo-blocking, but can exclude static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
