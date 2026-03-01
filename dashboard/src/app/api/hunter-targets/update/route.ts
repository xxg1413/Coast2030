import { updateHunterTarget } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const id = typeof data.id === 'string' ? data.id : '';
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const success = await updateHunterTarget(id, {
            name: typeof data.name === 'string' ? data.name : '',
            platform: typeof data.platform === 'string' ? data.platform : '',
            url: typeof data.url === 'string' ? data.url : '',
            priority: typeof data.priority === 'string' ? data.priority : 'P1',
            status: typeof data.status === 'string' ? data.status : 'watch',
            bountyEstimate: Number(data.bountyEstimate || 0),
            thesis: typeof data.thesis === 'string' ? data.thesis : '',
            oddsNote: typeof data.oddsNote === 'string' ? data.oddsNote : '',
            lastAction: typeof data.lastAction === 'string' ? data.lastAction : '',
            lastActionDate: typeof data.lastActionDate === 'string' ? data.lastActionDate : '',
            nextStep: typeof data.nextStep === 'string' ? data.nextStep : '',
            notes: typeof data.notes === 'string' ? data.notes : '',
        });

        if (!success) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        return NextResponse.json({ success });
    } catch {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
