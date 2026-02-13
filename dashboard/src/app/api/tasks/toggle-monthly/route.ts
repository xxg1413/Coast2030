import { toggleMonthlyTask } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { text, completed } = await request.json();

        const success = await toggleMonthlyTask(text, completed);
        return NextResponse.json({ success });
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
