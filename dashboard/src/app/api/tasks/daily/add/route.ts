import { addDailyTask } from "@/lib/api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { text, date } = await request.json();
        if (!text || !text.trim()) {
            return NextResponse.json({ error: "Text required" }, { status: 400 });
        }

        const success = await addDailyTask(text, date);
        if (!success) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
