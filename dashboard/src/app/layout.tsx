import type { Metadata, Viewport } from "next";
import { Navigation } from "@/components/dashboard/navigation";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#007373",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://coast.pxiaoer.blog"),
  title: {
    default: "Coast2030个人计划",
    template: "%s | Coast2030",
  },
  description: "Coast2030 年度个人计划与收入任务跟踪看板",
  applicationName: "Coast2030",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Coast2030",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/coast-logo.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/coast-logo.svg",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-svh flex flex-col antialiased">
        <Navigation />
        <div className="flex-1 w-full flex flex-col">
          {children}
        </div>
        <PwaRegister />
      </body>
    </html>
  );
}
