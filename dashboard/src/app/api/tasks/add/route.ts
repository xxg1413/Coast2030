import { addTask } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { text } = await request.json();
        if (!text || !text.trim()) return NextResponse.json({ error: 'Text required' }, { status: 400 });

        const success = await addTask(text);
        return NextResponse.json({ success });
    } catch {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
