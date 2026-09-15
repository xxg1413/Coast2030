/* Hallmark · component: navigation · genre: modern-minimal · nav: N5 floating pill
 * states: default · hover · focus · active · disabled
 * rationale: 首页/工作台双主入口；业务线与 Operator 收进次级菜单
 */
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Cake,
  CalendarCheck,
  ChevronDown,
  FileText,
  Home,
  Layers,
  Menu,
  Shield,
  X,
} from "lucide-react";

const PRIMARY_ITEMS = [
  { name: "2030", href: "/", icon: Home, match: (pathname: string) => pathname === "/" },
  {
    name: "2026",
    href: "/2026",
    icon: CalendarCheck,
    match: (pathname: string) => pathname === "/2026" || pathname.startsWith("/2026/"),
  },
] as const;

const MOBILE_PRIMARY_LABELS: Record<string, string> = {
  "2030": "2030 总览",
  "2026": "2026 工作台",
};

const MORE_ITEMS = [
  { name: "Product Lab", href: "/productlab", icon: Layers, group: "projects" as const },
  { name: "AIBounty", href: "/aibounty", icon: Shield, group: "projects" as const },
  { name: "AI Notes", href: "/ainotes", icon: FileText, group: "projects" as const },
  { name: "38 岁财年", href: "/38", icon: Cake, group: "plans" as const },
  { name: "Operator", href: "/operator", icon: Bot, group: "tools" as const },
] as const;

const MOBILE_GROUP_LABELS: Record<string, string> = {
  projects: "业务线",
  plans: "规划",
  tools: "工具",
};

const MOBILE_GROUPS = ["projects", "plans", "tools"] as const;

export function Navigation() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const moreIsActive = MORE_ITEMS.some((item) => pathname.startsWith(item.href));

  useEffect(() => {
    if (!moreOpen && !mobileOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMoreOpen(false);
        setMobileOpen(false);
      }
    };
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("pointerdown", closeOnOutsidePress);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("pointerdown", closeOnOutsidePress);
    };
  }, [mobileOpen, moreOpen]);

  if (pathname === "/login") {
    return null;
  }

  const closeMenus = () => {
    setMoreOpen(false);
    setMobileOpen(false);
  };

  return (
    <header ref={navRef} className="coast-nav-frame">
      <div className="coast-nav">
        <Link href="/" className="coast-brand" onClick={closeMenus} aria-label="Coast2030 主页">
          <Image src="/coast-logo.svg" alt="" width={32} height={32} priority />
          <span>
            COAST<b>2030</b>
          </span>
        </Link>

        <nav className="coast-nav-desktop" aria-label="主导航">
          {PRIMARY_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="coast-nav-link"
                data-active={active ? "true" : undefined}
                aria-current={active ? "page" : undefined}
              >
                <Icon aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
          <div className="coast-project-menu">
            <button
              type="button"
              className="coast-nav-link"
              data-active={moreIsActive ? "true" : undefined}
              aria-expanded={moreOpen}
              aria-controls="coast-more-links"
              onClick={() => setMoreOpen((open) => !open)}
            >
              更多
              <ChevronDown aria-hidden="true" data-open={moreOpen ? "true" : undefined} />
            </button>
            {moreOpen ? (
              <div id="coast-more-links" className="coast-project-popover">
                {MORE_ITEMS.map((item, index) => {
                  const Icon = item.icon;
                  const active = pathname.startsWith(item.href);
                  const showDivider = index > 0 && item.group !== MORE_ITEMS[index - 1]?.group;
                  return (
                    <div key={item.href} className={showDivider ? "coast-project-popover__group" : undefined}>
                      <Link
                        href={item.href}
                        onClick={closeMenus}
                        aria-current={active ? "page" : undefined}
                        data-active={active ? "true" : undefined}
                      >
                        <Icon aria-hidden="true" />
                        {item.name}
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </nav>

        <button
          type="button"
          className="coast-mobile-toggle"
          aria-expanded={mobileOpen}
          aria-controls="coast-mobile-menu"
          aria-label={mobileOpen ? "关闭导航" : "打开导航"}
          onClick={() => {
            setMoreOpen(false);
            setMobileOpen((open) => !open);
          }}
        >
          {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      {mobileOpen ? (
        <nav id="coast-mobile-menu" className="coast-mobile-menu" aria-label="移动导航">
          {PRIMARY_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenus}
                aria-current={active ? "page" : undefined}
              >
                <Icon aria-hidden="true" />
                {MOBILE_PRIMARY_LABELS[item.name] ?? item.name}
              </Link>
            );
          })}
          {MOBILE_GROUPS.map((group) => {
            const items = MORE_ITEMS.filter((item) => item.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <div className="coast-mobile-menu__section" role="presentation">
                  {MOBILE_GROUP_LABELS[group]}
                </div>
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenus}
                      aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                    >
                      <Icon aria-hidden="true" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}
