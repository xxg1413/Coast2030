export const dynamic = "force-dynamic";

export default function AIBountyPage() {
  const aibountyUrl = process.env.NEXT_PUBLIC_AIBOUNTY_URL || "https://aibounty.pxiaoer.blog/";

  return (
    <main className="w-full bg-[#faf7f2] overflow-hidden">
      <iframe
        src={aibountyUrl}
        className="w-full h-[calc(100vh-64px)] border-0 m-0 p-0 block"
        title="AIBounty Plan"
        allow="clipboard-write"
      />
    </main>
  );
}
