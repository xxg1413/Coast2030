import { NextResponse } from "next/server";
import { decideAgentWorkItem } from "@/lib/agent";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const decision = body.decision;

    if (!id || !["approve", "reject"].includes(decision)) {
      return NextResponse.json({ error: "id/decision 参数错误" }, { status: 400 });
    }

    const result = await decideAgentWorkItem(id, decision);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Agent 审批失败" },
      { status: 400 },
    );
  }
}
