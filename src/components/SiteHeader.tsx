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
    <header className="sticky top-0 z-40 border-b border-stone-200/90 bg-[#faf7f2]/90 text-stone-900 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5 tracking-tight text-stone-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-amber-100 shadow-xs transition-transform duration-200 group-hover:scale-105 group-hover:rotate-[-6deg]">
            <Scissors className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-bold sm:text-lg">Studio Booking</span>
            <span className="block text-[10px] font-medium tracking-wider text-stone-500 uppercase">Hair & Scalp Studio</span>
          </span>
        </Link>

        <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 rounded-full border border-stone-200 bg-white/80 p-1 shadow-2xs md:flex">
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-600 hover:bg-stone-200/60 hover:text-stone-900"
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
            className="btn-interactive inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 md:hidden"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>Tra cứu</span>
          </Link>
          <Link
            href="/admin"
            className="btn-interactive inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-2.5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 md:hidden"
            aria-label="Quản trị"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/book"
            className="btn-interactive group inline-flex items-center gap-1.5 rounded-full bg-amber-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-900"
          >
            <CalendarPlus className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
            <span>Đặt lịch hẹn</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
