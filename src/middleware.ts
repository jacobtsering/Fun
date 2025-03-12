import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip middleware for API routes, especially NextAuth routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const isAuthenticated = !!token;
  
  // Get the pathname from the URL
  const path = request.nextUrl.pathname;
  
  // Public paths that don't require authentication
  const publicPaths = [
    '/auth/login',
    '/auth/error',
    '/_next',
    '/favicon.ico',
  ];
  
  // Check if the current path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path.startsWith(publicPath) || path === publicPath
  );
  
  // Redirect unauthenticated users to login
  if (!isAuthenticated && !isPublicPath) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  if (isAuthenticated) {
    // Redirect authenticated users away from auth pages
    if (path.startsWith('/auth')) {
      if (token.role === 'admin') {
        return NextResponse.redirect(new URL('/dashboard/admin', request.url));
      } else {
        return NextResponse.redirect(new URL('/dashboard/operator', request.url));
      }
    }
    
    // Redirect users to appropriate dashboard based on role
    if (path === '/dashboard' || path === '/') {
      if (token.role === 'admin') {
        return NextResponse.redirect(new URL('/dashboard/admin', request.url));
      } else {
        return NextResponse.redirect(new URL('/dashboard/operator', request.url));
      }
    }
    
    // Prevent operators from accessing admin pages
    if (path.startsWith('/dashboard/admin') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/operator', request.url));
    }
    
    // Prevent admins from accessing operator pages
    if (path.startsWith('/dashboard/operator') && token.role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard/admin', request.url));
    }
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes, especially NextAuth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
