import Link from "next/link";
import Image from "next/image";

interface NavItem {
  label: string;
  href: string;
  variant?: "default" | "cyan" | "amber" | "emerald";
  external?: boolean;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  navItems?: NavItem[];
}

const variantStyles: Record<string, string> = {
  default: "bg-stone-100 text-stone-700 hover:bg-stone-200",
  cyan: "bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
  amber: "bg-amber-50 text-amber-700 hover:bg-amber-100",
  emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
};

export function PageHeader({ title, subtitle, navItems }: PageHeaderProps) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white/84 p-4 shadow-[0_10px_32px_rgba(72,50,22,0.06)] backdrop-blur md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Image
            src="/coast-logo.svg"
            alt="Coast2030 Logo"
            width={52}
            height={52}
            className="h-11 w-11 rounded-xl border border-stone-200 bg-white"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-500">
              {subtitle ?? "Coast2030"}
            </p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight bg-gradient-to-r from-stone-950 via-stone-800 to-emerald-700 bg-clip-text text-transparent md:text-3xl">
              {title}
            </h1>
          </div>
        </div>
        {navItems && navItems.length > 0 && (
          <div className="flex flex-wrap gap-2 lg:justify-end">
            {navItems.map((item) => {
              const className = `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${variantStyles[item.variant ?? "default"]}`;
              if (item.external) {
                return (
                  <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
                    {item.label}
                  </a>
                );
              }
              return (
                <Link key={item.label} href={item.href} className={className}>
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
