import { deleteMonthlyTask } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { id } = await request.json();
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const success = await deleteMonthlyTask(id);
        return NextResponse.json({ success });
    } catch (error) {
        console.error('Delete Error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
