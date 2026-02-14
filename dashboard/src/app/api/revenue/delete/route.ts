import { deleteTransaction } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const id = Number(data.id);

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
        }

        const success = await deleteTransaction(id);
        return NextResponse.json({ success });
    } catch {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
