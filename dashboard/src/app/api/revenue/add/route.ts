import { addTransaction } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Validate
        if (!data.date || !data.amount) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const success = await addTransaction({
            date: data.date,
            type: data.type,
            project: data.project,
            amount: data.amount,
            memo: data.memo
        });

        return NextResponse.json({ success });
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
