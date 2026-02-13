import type { Metadata } from "next";
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
    <html lang="zh-CN" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
