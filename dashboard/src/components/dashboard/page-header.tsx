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
    <section className="coast-page-header">
      <div className="coast-page-header__inner">
        <div className="coast-page-header__title">
          <Image
            src="/coast-logo.svg"
            alt=""
            width={52}
            height={52}
          />
          <div className="min-w-0">
            <p>
              {subtitle ?? "Coast2030"}
            </p>
            <h1>{title}</h1>
          </div>
        </div>
        {navItems && navItems.length > 0 && (
          <div className="coast-page-header__links">
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
