import { setDailyTaskRecurrence } from "@/lib/api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { id, repeat, anchorDate, time } = await request.json();
        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        const success = await setDailyTaskRecurrence(id, repeat, anchorDate, time);
        return NextResponse.json({ success });
    } catch {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
