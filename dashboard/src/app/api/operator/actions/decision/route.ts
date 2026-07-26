import { NextResponse } from "next/server";
import { decideOperatorActionRequest } from "@/lib/operator";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = typeof body.id === "string" ? body.id : "";
    const decision = body.decision === "approve" || body.decision === "reject"
      ? body.decision
      : "";

    if (!id || !decision) {
      return NextResponse.json(
        { error: "id 和 decision（approve/reject）不能为空" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      request: await decideOperatorActionRequest(id, decision),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Operator 审批失败" },
      { status: 500 },
    );
  }
}
