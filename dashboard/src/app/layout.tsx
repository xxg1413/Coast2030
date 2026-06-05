import type { Metadata } from "next";
import { Navigation } from "@/components/dashboard/navigation";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://coast.pxiaoer.blog"),
  title: {
    default: "Coast2030个人计划",
    template: "%s | Coast2030",
  },
  description: "Coast2030 年度个人计划与收入任务跟踪看板",
  applicationName: "Coast2030",
  icons: {
    icon: "/coast-logo.svg",
    shortcut: "/coast-logo.svg",
    apple: "/coast-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-[#faf7f2] min-h-screen flex flex-col text-stone-900">
        <Navigation />
        <div className="flex-1 w-full flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
