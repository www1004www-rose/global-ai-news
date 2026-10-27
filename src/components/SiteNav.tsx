"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "오늘" },
  { href: "/history", label: "지난 기록" },
] as const;

export default function SiteNav() {
  const pathname = usePathname();
  return (
    <nav className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 pt-6 sm:px-6">
      <Link href="/" className="font-serif text-lg font-black tracking-tight">
        Daily<span className="text-coral">Five</span>
      </Link>
      <ul className="flex gap-1 text-sm">
        {LINKS.map(({ href, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3.5 py-1.5 font-medium transition ${
                  active ? "bg-peach-strong text-coral-deep" : "text-muted hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
