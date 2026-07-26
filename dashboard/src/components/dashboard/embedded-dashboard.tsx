interface EmbeddedDashboardProps {
  src: string;
  title: string;
}

export function EmbeddedDashboard({ src, title }: EmbeddedDashboardProps) {
  return (
    <main className="coast-project-frame">
      <iframe
        src={src}
        className="coast-project-frame__content"
        title={title}
        allow="clipboard-write"
      />
    </main>
  );
}
