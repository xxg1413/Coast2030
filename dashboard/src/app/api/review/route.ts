import { saveMonthlyReview } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const month = typeof data.month === 'string' ? data.month : undefined;
        const wins = typeof data.wins === 'string' ? data.wins : '';
        const losses = typeof data.losses === 'string' ? data.losses : '';
        const blockers = typeof data.blockers === 'string' ? data.blockers : '';
        const nextSteps = typeof data.nextSteps === 'string' ? data.nextSteps : '';

        const success = await saveMonthlyReview(month, {
            wins,
            losses,
            blockers,
            nextSteps,
        });

        if (!success) {
            return NextResponse.json({ error: 'Invalid month format' }, { status: 400 });
        }

        return NextResponse.json({ success });
    } catch {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
