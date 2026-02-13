import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();
        const isProd = process.env.NODE_ENV === 'production';

        // Hardcoded credentials: pxiaoer / Coast2030@1413
        if (username === 'pxiaoer' && password === 'Coast2030@1413') {
            const cookieStore = await cookies();

            // Set a simple auth cookie
            cookieStore.set('auth_token', 'valid_session', {
                httpOnly: true,
                secure: isProd,
                sameSite: isProd ? 'none' : 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
