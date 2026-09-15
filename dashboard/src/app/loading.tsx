export default function Loading() {
  return (
    <main className="coast-loading" role="status" aria-live="polite">
      <span className="coast-loading__dot" aria-hidden="true" />
      <span>加载中…</span>
    </main>
  );
}
