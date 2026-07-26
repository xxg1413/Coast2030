import { EmbeddedDashboard } from "@/components/dashboard/embedded-dashboard";

export const dynamic = "force-dynamic";

export default function AIBountyPage() {
  const aibountyUrl = process.env.NEXT_PUBLIC_AIBOUNTY_URL || "https://aibounty.pxiaoer.blog/";

  return <EmbeddedDashboard src={aibountyUrl} title="AIBounty 现金主攻" />;
}
