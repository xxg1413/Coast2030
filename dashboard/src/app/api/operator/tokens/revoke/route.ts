import { NextResponse } from "next/server";
import { revokeOperatorAccessToken } from "@/lib/operator-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) {
      return NextResponse.json({ error: "id 不能为空" }, { status: 400 });
    }

    const revoked = await revokeOperatorAccessToken(id);
    if (!revoked) {
      return NextResponse.json({ error: "Token 不存在或已撤销" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Operator Token 撤销失败" },
      { status: 500 },
    );
  }
}
