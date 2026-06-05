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
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 md:px-8">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <Image
            src="/coast-logo.svg"
            alt="Coast2030 Logo"
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg border border-white/80 bg-white shadow-sm"
          />
          <span className="hidden text-sm font-black tracking-tight text-stone-900 sm:block">
            COAST<span className="text-emerald-700">2030</span>
          </span>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex h-full items-center gap-1 overflow-x-auto scrollbar-none sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex h-full items-center gap-1.5 px-3 text-xs font-bold transition-all md:px-4 md:text-sm ${
                  item.active
                    ? "text-emerald-800"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${item.active ? "text-emerald-700" : "text-stone-400"}`} />
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
