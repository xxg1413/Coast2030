import { addMorningLogPomodoro } from "@/lib/api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const entry = await addMorningLogPomodoro({
            date: payload?.date,
            key: payload?.key,
            label: payload?.label,
            duration: payload?.duration,
        });
        return NextResponse.json({ success: true, entry });
    } catch (error) {
        console.error("[morning-log/pomodoro/add] failed:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
