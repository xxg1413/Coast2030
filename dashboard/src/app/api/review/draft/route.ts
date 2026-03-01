import { getMonthlyReviewDraft } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const month = typeof data.month === 'string' ? data.month : undefined;
        const draft = await getMonthlyReviewDraft(month);
        return NextResponse.json({ success: true, draft });
    } catch {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
