"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarPlus, Scissors, Search, ShieldCheck } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Trang chủ", match: (p: string) => p === "/" },
  { href: "/book", label: "Đặt lịch", match: (p: string) => p.startsWith("/book") },
  { href: "/lookup", label: "Tra cứu", match: (p: string) => p.startsWith("/lookup") },
  { href: "/admin", label: "Quản trị", match: (p: string) => p.startsWith("/admin") },
];

export default function SiteHeader() {
  const pathname = usePathname() || "/";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 text-white shadow-lg shadow-slate-950/15 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5 font-bold tracking-tight text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30 transition-transform duration-200 group-hover:scale-105 group-hover:rotate-[-6deg]">
            <Scissors className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-base sm:text-lg">Studio Booking</span>
        </Link>

        <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/90 p-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/40"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/lookup"
            className="btn-interactive inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 hover:bg-slate-800 hover:text-white md:hidden"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>Tra cứu</span>
          </Link>
          <Link
            href="/admin"
            className="btn-interactive inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 hover:bg-slate-800 hover:text-white md:hidden"
            aria-label="Quản trị"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/book"
            className="btn-interactive group inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:from-indigo-400 hover:to-violet-500"
          >
            <CalendarPlus className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
            <span>Đặt lịch ngay</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
