import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["better-sqlite3"], // Keep for future if we fix it, or remove. 
  // Actually, let's just remove specific experimental keys if they are wrong.
  // The warning said `experimental.serverComponentsExternalPackages` moved to `serverExternalPackages`.
  // So:
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
