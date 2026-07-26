import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, verifyAuthSessionToken } from '@/lib/auth-session';

export const config = {
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    if (pathname === '/mcp') {
        return NextResponse.next();
    }

    const authToken = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    const isAuthenticated = await verifyAuthSessionToken(authToken);

    // If authenticated and trying to access login page, redirect to home.
    if (isAuthenticated && pathname === '/login') {
        return NextResponse.redirect(new URL('/', req.url));
    }

    // If not authenticated and trying to access protected pages, redirect to login.
    if (!isAuthenticated && pathname !== '/login') {
        if (pathname.startsWith('/api/')) {
            const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            response.cookies.delete(AUTH_COOKIE_NAME);
            return response;
        }

        const response = NextResponse.redirect(new URL('/login', req.url));
        response.cookies.delete(AUTH_COOKIE_NAME);
        return response;
    }

    return NextResponse.next();
}
