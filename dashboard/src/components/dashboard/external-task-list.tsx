import { ExternalLink } from "lucide-react";
import type { ExternalTask } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "./empty-state";

const SOURCE_CLASS: Record<ExternalTask["source"], string> = {
  "Product Lab": "border-cyan-200 bg-cyan-50 text-cyan-700",
  "AI Notes": "border-amber-200 bg-amber-50 text-amber-700",
  AIBounty: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function ExternalTaskList({ tasks }: { tasks: ExternalTask[] }) {
  const visibleTasks = tasks.slice(0, 12);

  return (
    <Card className="w-full border-stone-200 bg-white/78 shadow-[0_8px_30px_rgba(84,61,31,0.06)] xl:col-span-3">
      <CardHeader className="space-y-2 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm text-stone-500">三线同步</p>
            <CardTitle className="text-base">Product Lab / AI Notes / AIBounty 待推进</CardTitle>
          </div>
          <div className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-500">
            {tasks.length} 项
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {visibleTasks.length === 0 ? (
          <EmptyState message="三个子系统暂时没有待推进任务。" />
        ) : (
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {visibleTasks.map((task) => (
              <a
                key={task.id}
                href={task.href}
                target="_blank"
                rel="noreferrer"
                className="group rounded-lg border border-stone-200 bg-stone-50 px-3 py-3 text-sm no-underline transition hover:border-emerald-200 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${SOURCE_CLASS[task.source]}`}>
                    {task.source}
                  </span>
                  <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400 transition group-hover:text-emerald-600" />
                </div>
                <p className="mt-2 line-clamp-2 font-medium leading-5 text-stone-950">{task.text}</p>
                <p className="mt-2 truncate text-xs text-stone-500">
                  {task.project} · {task.status}
                  {task.priority ? ` · ${task.priority}` : ""}
                  {task.dueDate ? ` · ${task.dueDate}` : ""}
                </p>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
