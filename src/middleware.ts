import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/session';

export async function middleware(request: NextRequest) {
  // Update session expiration if valid
  await updateSession(request);

  const session = request.cookies.get('session')?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');

  // Allow access to login page
  if (isLoginPage) {
    if (session) {
      // If already logged in, redirect to dashboard
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // If no session, redirect to login for all other routes
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // We need to parse the session to check role
  const { decrypt } = await import('@/lib/session');
  const parsed = await decrypt(session);

  if (parsed) {
    if (!parsed.businessId) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }

    const isSuperAdminRoute = request.nextUrl.pathname.startsWith('/superadmin');
    const isSuperAdminUser = parsed.role === 'SUPER_ADMIN';

    if (isSuperAdminRoute && !isSuperAdminUser) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Optional: if super admin tries to access normal routes (like /crm), redirect them to /superadmin
    if (isSuperAdminUser && !isSuperAdminRoute) {
      return NextResponse.redirect(new URL('/superadmin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - /uploads (user uploaded files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|uploads).*)',
  ],
};
