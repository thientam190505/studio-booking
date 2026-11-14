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
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-200">
            <Scissors className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-base sm:text-lg">Studio Booking</span>
        </Link>

        <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 md:hidden"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>Tra cứu</span>
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 md:hidden"
            aria-label="Quản trị"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/book"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            <span>Đặt lịch ngay</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
