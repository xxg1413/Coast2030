import { EmbeddedDashboard } from "@/components/dashboard/embedded-dashboard";

export const dynamic = "force-dynamic";

export default function AINotesPage() {
  const ainotesUrl = process.env.NEXT_PUBLIC_AI_NOTES_URL || "https://ainote.pxiaoer.blog/";

  return <EmbeddedDashboard src={ainotesUrl} title="AI Notes 内容支持" />;
}
