import { updateDailyTask } from "@/lib/api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { id, text } = await request.json();
        if (!id || !text || !text.trim()) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const success = await updateDailyTask(id, text);
        if (!success) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        return NextResponse.json({ success });
    } catch {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
