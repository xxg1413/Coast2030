import { deleteMonthlyTask } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { id, series } = await request.json();
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const success = await deleteMonthlyTask(id, Boolean(series));
        return NextResponse.json({ success });
    } catch (error) {
        console.error('Delete Error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
