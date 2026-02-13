import { addMonthlyTask } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { text, month } = await request.json();
        if (!text || !text.trim()) return NextResponse.json({ error: 'Text required' }, { status: 400 });

        const success = await addMonthlyTask(text, month);
        if (!success) return NextResponse.json({ error: 'Invalid month format' }, { status: 400 });
        return NextResponse.json({ success });
    } catch {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
