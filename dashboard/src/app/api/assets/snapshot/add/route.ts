import { addAssetSnapshot } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const snapshotDate = typeof data.snapshotDate === 'string' ? data.snapshotDate : '';
        const notes = typeof data.notes === 'string' ? data.notes.trim() : '';
        const totalAssets = Number(data.totalAssets);
        const totalLiabilities = Number(data.totalLiabilities);
        const netWorth = Number(data.netWorth);

        if (
            !snapshotDate ||
            !Number.isFinite(totalAssets) ||
            !Number.isFinite(totalLiabilities) ||
            !Number.isFinite(netWorth)
        ) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const success = await addAssetSnapshot({
            snapshotDate,
            totalAssets,
            totalLiabilities,
            netWorth,
            notes,
        });

        return NextResponse.json({ success });
    } catch {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
