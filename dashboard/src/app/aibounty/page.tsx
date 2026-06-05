export const dynamic = "force-dynamic";

export default function AIBountyPage() {
  const aibountyUrl = process.env.NEXT_PUBLIC_AIBOUNTY_URL || "https://aibounty.pxiaoer.blog/";

  return (
    <main className="flex-1 w-full h-[calc(100vh-64px)] bg-[#faf7f2] overflow-hidden">
      <iframe
        src={aibountyUrl}
        className="w-full h-full border-0 m-0 p-0 block"
        title="AIBounty Plan"
        allow="clipboard-write"
      />
    </main>
  );
}
