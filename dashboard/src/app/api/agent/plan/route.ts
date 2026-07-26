import { NextResponse } from "next/server";
import {
  getAIBountyGoalProgress,
  getDailyTasks,
  getExternalSourceHealth,
  getExternalTasks,
  getMorningLog,
  getYearIncome,
} from "@/lib/api";
import { createDailyAdvisorPlan, type AgentGoalArea } from "@/lib/agent";
import { BUSINESS_LINE_TARGETS_2026 } from "@/lib/targets";

const CORE_ACTIONS: Array<{ key: string; goalArea: AgentGoalArea }> = [
  { key: "aibounty", goalArea: "Hunter" },
  { key: "saas", goalArea: "SaaS" },
  { key: "ai_notes", goalArea: "Media" },
];

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const date = typeof body.date === "string" ? body.date.slice(0, 10) : "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "date 必须为 YYYY-MM-DD" }, { status: 400 });
    }

    const [
      dailyTasks,
      morningLog,
      externalTasks,
      sourceHealth,
      aiBounty,
      hunterIncome,
      saasIncome,
      mediaIncome,
    ] = await Promise.all([
      getDailyTasks(date),
      getMorningLog(date),
      getExternalTasks(),
      getExternalSourceHealth(),
      getAIBountyGoalProgress(),
      getYearIncome(2026, "Hunter"),
      getYearIncome(2026, "SaaS"),
      getYearIncome(2026, "Media"),
    ]);

    const overview = await createDailyAdvisorPlan({
      date,
      dailyTasks,
      coreActions: CORE_ACTIONS.map(({ key, goalArea }) => {
        const item = morningLog.items.find((candidate) => candidate.key === key);
        return {
          goalArea,
          label: item?.label || "",
          completed: item?.completed || false,
        };
      }),
      externalTasks,
      sourceHealth,
      income: {
        Hunter: { current: hunterIncome, target: BUSINESS_LINE_TARGETS_2026.Hunter },
        SaaS: { current: saasIncome, target: BUSINESS_LINE_TARGETS_2026.SaaS },
        Media: { current: mediaIncome, target: BUSINESS_LINE_TARGETS_2026.Media },
      },
      aiBounty,
    });

    return NextResponse.json({ success: true, overview });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Agent 计划生成失败" },
      { status: 500 },
    );
  }
}
