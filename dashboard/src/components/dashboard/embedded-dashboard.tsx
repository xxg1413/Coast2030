"use client";

import { useEffect, useState } from "react";

interface EmbeddedDashboardProps {
  src: string;
  title: string;
}

const LOAD_TIMEOUT_MS = 12000;

export function EmbeddedDashboard({ src, title }: EmbeddedDashboardProps) {
  // Remount on src change so load state resets without setState-in-effect.
  return <EmbeddedFrame key={src} src={src} title={title} />;
}

function EmbeddedFrame({ src, title }: EmbeddedDashboardProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStatus((current) => (current === "loading" ? "error" : current));
    }, LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="coast-project-frame">
      {status === "loading" && (
        <p className="coast-project-frame__loading" role="status">
          加载中…
        </p>
      )}

      {status === "error" ? (
        <div className="coast-project-frame__error" role="alert">
          <p>嵌入页面未能加载。</p>
        </div>
      ) : (
        <iframe
          src={src}
          className="coast-project-frame__content"
          data-loaded={status === "loaded"}
          title={title}
          allow="clipboard-write"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      )}
    </main>
  );
}
