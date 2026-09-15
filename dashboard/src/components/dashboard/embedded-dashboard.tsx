"use client";

import { useState } from "react";

interface EmbeddedDashboardProps {
  src: string;
  title: string;
}

export function EmbeddedDashboard({ src, title }: EmbeddedDashboardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <main className="coast-project-frame">
      {!loaded && (
        <p className="coast-project-frame__loading" role="status">
          加载中…
        </p>
      )}
      <iframe
        src={src}
        className="coast-project-frame__content"
        data-loaded={loaded}
        title={title}
        allow="clipboard-write"
        onLoad={() => setLoaded(true)}
      />
    </main>
  );
}
