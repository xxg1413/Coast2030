import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCloudflareContext } from '@opennextjs/cloudflare';

const AUTH_USERNAME_KEY = 'AUTH_USERNAME';
const AUTH_PASSWORD_SALT_KEY = 'AUTH_PASSWORD_SALT';
const AUTH_PASSWORD_HASH_KEY = 'AUTH_PASSWORD_HASH';

function readRuntimeEnv(key: string): string | undefined {
    const fromProcess = process.env[key];
    if (typeof fromProcess === 'string' && fromProcess.length > 0) {
        return fromProcess;
    }

    try {
        const env = getCloudflareContext()?.env as Record<string, unknown> | undefined;
        const value = env?.[key];
        if (typeof value === 'string' && value.length > 0) {
            return value;
        }
    } catch {
        // Ignore when Cloudflare context is unavailable.
    }

    return undefined;
}

async function sha256Hex(input: string): Promise<string> {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
        .map((part) => part.toString(16).padStart(2, '0'))
        .join('');
}

function secureCompare(left: string, right: string): boolean {
    const encoder = new TextEncoder();
    const leftBytes = encoder.encode(left);
    const rightBytes = encoder.encode(right);

    let mismatch = leftBytes.length === rightBytes.length ? 0 : 1;
    const maxLength = Math.max(leftBytes.length, rightBytes.length);

    for (let index = 0; index < maxLength; index += 1) {
        const leftByte = index < leftBytes.length ? leftBytes[index] : 0;
        const rightByte = index < rightBytes.length ? rightBytes[index] : 0;
        mismatch |= leftByte ^ rightByte;
    }

    return mismatch === 0;
}

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();
        const isProd = process.env.NODE_ENV === 'production';
        const configuredUsername = readRuntimeEnv(AUTH_USERNAME_KEY);
        const configuredPasswordSalt = readRuntimeEnv(AUTH_PASSWORD_SALT_KEY) ?? '';
        const configuredPasswordHash = readRuntimeEnv(AUTH_PASSWORD_HASH_KEY);

        if (!configuredUsername || !configuredPasswordHash) {
            return NextResponse.json(
                { error: 'Auth config missing. Set AUTH_USERNAME and AUTH_PASSWORD_HASH.' },
                { status: 500 }
            );
        }

        const usernameInput = typeof username === 'string' ? username : '';
        const passwordInput = typeof password === 'string' ? password : '';
        const calculatedHash = await sha256Hex(`${configuredPasswordSalt}:${passwordInput}`);

        if (secureCompare(usernameInput, configuredUsername) && secureCompare(calculatedHash, configuredPasswordHash)) {
            const cookieStore = await cookies();
            cookieStore.set('auth_token', 'valid_session', {
                httpOnly: true,
                secure: isProd,
                sameSite: isProd ? 'none' : 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 1 week
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
