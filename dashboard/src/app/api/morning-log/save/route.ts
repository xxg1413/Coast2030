import { saveMorningLog } from "@/lib/api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const result = await saveMorningLog({
            date: payload?.date,
            items: payload?.items,
            customItems: payload?.customItems,
        });
        return NextResponse.json({ success: true, log: result });
    } catch {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
