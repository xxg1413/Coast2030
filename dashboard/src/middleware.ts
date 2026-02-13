import { NextRequest, NextResponse } from 'next/server';

export const config = {
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};

export function middleware(req: NextRequest) {
    const authToken = req.cookies.get('auth_token')?.value;
    const { pathname } = req.nextUrl;

    // If authenticated and trying to access login page, redirect to home.
    if (authToken && pathname === '/login') {
        return NextResponse.redirect(new URL('/', req.url));
    }

    // If not authenticated and trying to access protected pages, redirect to login.
    if (!authToken && pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
}
