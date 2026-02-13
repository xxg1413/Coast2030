import { addMonthlyTask } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { text } = await request.json();
        if (!text) return NextResponse.json({ error: 'Text required' }, { status: 400 });

        const success = await addMonthlyTask(text);
        return NextResponse.json({ success });
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
