export const dynamic = "force-dynamic";

export default function AINotesPage() {
  const ainotesUrl = process.env.NEXT_PUBLIC_AI_NOTES_URL || "https://ainote.pxiaoer.blog/";

  return (
    <main className="w-full bg-[#faf7f2] overflow-hidden">
      <iframe
        src={ainotesUrl}
        className="w-full h-[calc(100vh-64px)] border-0 m-0 p-0 block"
        title="AI Notes"
        allow="clipboard-write"
      />
    </main>
  );
}
