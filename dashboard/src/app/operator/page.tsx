import { OperatorConnectPanel } from "@/components/dashboard/operator-connect-panel";
import { PageHeader } from "@/components/dashboard/page-header";
import { listOperatorAccessTokens } from "@/lib/operator-auth";
import { listOperatorActionRequests } from "@/lib/operator";

export const dynamic = "force-dynamic";

export default async function OperatorPage() {
  const [tokens, actions] = await Promise.all([
    listOperatorAccessTokens(),
    listOperatorActionRequests(),
  ]);

  return (
    <main className="min-h-screen px-4 py-4 text-stone-900 md:px-6 md:py-6">
      <div className="mx-auto w-full max-w-[1280px] space-y-4">
        <PageHeader
          title="Coast Operator"
          subtitle="0.3 · 让 Codex 通过一个受控链接读数据、做计划和执行内部动作"
        />
        <OperatorConnectPanel initialTokens={tokens} initialActions={actions} />
      </div>
    </main>
  );
}
