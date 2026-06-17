import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const userRole = token?.role as string | undefined;

    // If not authenticated, redirect handled by withAuth callback
    if (!token) return NextResponse.next();

    // Pages that are accessible to all authenticated users (including VIEW_USER)
    const publicPages = ['/dashboard', '/employees', '/assets/all', '/assets/furniture', '/assets/electronics', '/assets/vehicles', '/qr'];
    const isPublicPage = publicPages.some((p) => pathname === p || pathname.startsWith(p + '/'));

    // VIEW_USER can only access public pages and the login page
    if (userRole === 'VIEW_USER') {
      if (isPublicPage) return NextResponse.next();

      // VIEW_USER trying to access admin / settings / reports — redirect
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // SUPER_ADMIN has access to everything
    if (userRole === 'SUPER_ADMIN') return NextResponse.next();

    // USER role: allowed on public pages + admin pages except delete-requests and settings
    if (userRole === 'USER') {
      // Delete requests page — SUPER_ADMIN only
      if (pathname.startsWith('/admin/delete-requests')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      // Settings — SUPER_ADMIN only
      if (pathname.startsWith('/settings')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      // All other admin pages are allowed for USER
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/assets/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/employees/:path*',
    '/qr/:path*',
  ],
};