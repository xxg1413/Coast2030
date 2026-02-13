import { addTransaction } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const amount = Number(data.amount);

        if (!data.date || !Number.isFinite(amount) || amount <= 0) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const success = await addTransaction({
            date: data.date,
            type: data.type || 'Other',
            project: data.project || data.type || 'Other',
            amount,
            memo: data.memo || ''
        });

        return NextResponse.json({ success });
    } catch {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
