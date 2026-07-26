/* Hallmark · component: navigation · genre: modern-minimal · nav: N5 floating pill
 * states: default · hover · focus · active · disabled · loading · error · success
 * rationale: personal workbench needs two primary destinations and a compact project disclosure
 */
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  CalendarCheck,
  ChevronDown,
  FileText,
  Home,
  Layers,
  Menu,
  Shield,
  X,
} from "lucide-react";

const PROJECT_ITEMS = [
  { name: "Product Lab", href: "/productlab", icon: Layers },
  { name: "AIBounty", href: "/aibounty", icon: Shield },
  { name: "AI Notes", href: "/ainotes", icon: FileText },
] as const;

export function Navigation() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const projectIsActive = PROJECT_ITEMS.some((item) => pathname.startsWith(item.href));

  useEffect(() => {
    if (!projectsOpen && !mobileOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProjectsOpen(false);
        setMobileOpen(false);
      }
    };
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setProjectsOpen(false);
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("pointerdown", closeOnOutsidePress);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("pointerdown", closeOnOutsidePress);
    };
  }, [mobileOpen, projectsOpen]);

  if (pathname === "/login") {
    return null;
  }

  const closeMenus = () => {
    setProjectsOpen(false);
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
          <Link
            href="/"
            className="coast-nav-link"
            data-active={pathname === "/" ? "true" : undefined}
            aria-current={pathname === "/" ? "page" : undefined}
          >
            <Home aria-hidden="true" />
            2030
          </Link>
          <Link
            href="/2026"
            className="coast-nav-link"
            data-active={pathname === "/2026" ? "true" : undefined}
            aria-current={pathname === "/2026" ? "page" : undefined}
          >
            <CalendarCheck aria-hidden="true" />
            2026 工作台
          </Link>
          <Link
            href="/operator"
            className="coast-nav-link"
            data-active={pathname === "/operator" ? "true" : undefined}
            aria-current={pathname === "/operator" ? "page" : undefined}
          >
            <Bot aria-hidden="true" />
            Operator
          </Link>
          <div className="coast-project-menu">
            <button
              type="button"
              className="coast-nav-link"
              data-active={projectIsActive ? "true" : undefined}
              aria-expanded={projectsOpen}
              aria-controls="coast-project-links"
              onClick={() => setProjectsOpen((open) => !open)}
            >
              项目
              <ChevronDown aria-hidden="true" data-open={projectsOpen ? "true" : undefined} />
            </button>
            {projectsOpen ? (
              <div id="coast-project-links" className="coast-project-popover">
                {PROJECT_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenus}
                      aria-current={active ? "page" : undefined}
                      data-active={active ? "true" : undefined}
                    >
                      <Icon aria-hidden="true" />
                      {item.name}
                    </Link>
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
            setProjectsOpen(false);
            setMobileOpen((open) => !open);
          }}
        >
          {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      {mobileOpen ? (
        <nav id="coast-mobile-menu" className="coast-mobile-menu" aria-label="移动导航">
          <Link href="/" onClick={closeMenus} aria-current={pathname === "/" ? "page" : undefined}>
            <Home aria-hidden="true" />
            2030 总览
          </Link>
          <Link href="/2026" onClick={closeMenus} aria-current={pathname === "/2026" ? "page" : undefined}>
            <CalendarCheck aria-hidden="true" />
            2026 工作台
          </Link>
          <Link
            href="/operator"
            onClick={closeMenus}
            aria-current={pathname === "/operator" ? "page" : undefined}
          >
            <Bot aria-hidden="true" />
            Coast Operator
          </Link>
          {PROJECT_ITEMS.map((item) => {
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
        </nav>
      ) : null}
    </header>
  );
}
