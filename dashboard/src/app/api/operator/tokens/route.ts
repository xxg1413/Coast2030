import { NextResponse } from "next/server";
import {
  createOperatorAccessToken,
  listOperatorAccessTokens,
} from "@/lib/operator-auth";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      tokens: await listOperatorAccessTokens(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Operator Token 读取失败" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const label = typeof body.label === "string" ? body.label : "Codex";
    const result = await createOperatorAccessToken(label);
    return NextResponse.json({
      success: true,
      token: result.token,
      record: result.record,
      warning: "Token 只显示这一次，请立即复制并安全保存。",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Operator Token 创建失败" },
      { status: 500 },
    );
  }
}
