import { addTransaction } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const amount = Number(data.amount);
        const fxRate = Number(data.fxRate);
        const project = typeof data.project === 'string' ? data.project.trim() : '';
        const memo = typeof data.memo === 'string' ? data.memo.trim() : '';
        const type = typeof data.type === 'string' && data.type ? data.type : 'Other';
        const currency = data.currency === 'USD' ? 'USD' : 'CNY';

        if (!data.date || !project || !Number.isFinite(amount) || amount <= 0) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const success = await addTransaction({
            date: data.date,
            type,
            project,
            amount,
            currency,
            fxRate: Number.isFinite(fxRate) && fxRate > 0 ? fxRate : undefined,
            memo
        });

        return NextResponse.json({ success });
    } catch {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
