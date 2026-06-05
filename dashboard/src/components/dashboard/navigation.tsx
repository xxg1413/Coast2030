"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Home, CalendarCheck, Shield, FileText, Layers } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  const navItems = [
    {
      name: "退休主页",
      href: "/",
      icon: Home,
      active: pathname === "/",
    },
    {
      name: "2026工作台",
      href: "/2026",
      icon: CalendarCheck,
      active: pathname === "/2026",
    },
    {
      name: "Product Lab",
      href: "/productlab",
      icon: Layers,
      active: pathname.startsWith("/productlab"),
    },
    {
      name: "AIBounty",
      href: "/aibounty",
      icon: Shield,
      active: pathname.startsWith("/aibounty"),
    },
    {
      name: "AI Notes",
      href: "/ainotes",
      icon: FileText,
      active: pathname.startsWith("/ainotes"),
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/60 bg-[#faf7f2]/80 backdrop-blur-md">
      <div className="mx-auto flex flex-col gap-2 py-2.5 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:py-0 px-4 md:px-8 max-w-[1280px]">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90 justify-center sm:justify-start">
          <Image
            src="/coast-logo.svg"
            alt="Coast2030 Logo"
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg border border-white/80 bg-white shadow-sm"
          />
          <span className="text-sm font-black tracking-tight text-stone-900">
            COAST<span className="text-emerald-700">2030</span>
          </span>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none sm:gap-2 w-full sm:w-auto flex-nowrap whitespace-nowrap justify-center sm:justify-end pb-1 sm:pb-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex shrink-0 items-center gap-1.5 px-3 py-1.5 sm:py-0 text-xs font-bold transition-all sm:h-16 md:px-4 md:text-sm whitespace-nowrap ${
                  item.active
                    ? "text-emerald-800"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${item.active ? "text-emerald-700" : "text-stone-400"}`} />
                <span>{item.name}</span>
                {item.active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.75 bg-emerald-700 rounded-t-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
