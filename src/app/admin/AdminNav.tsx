"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ClipboardList, LogOut, Sparkles, Users } from "lucide-react";
import { logout } from "./actions";

const LINKS = [
  { href: "/admin", label: "Lịch hẹn", icon: ClipboardList },
  { href: "/admin/calendar", label: "Lịch tuần", icon: CalendarDays },
  { href: "/admin/services", label: "Dịch vụ", icon: Sparkles },
  { href: "/admin/staff", label: "Nhân viên", icon: Users },
];

export default function AdminNav({ name }: { name: string }) {
  const pathname = usePathname() || "/admin";

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <nav aria-label="Menu quản trị" className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
        {LINKS.map((l) => {
          const active = pathname === l.href;
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition ${
                active
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{l.label}</span>
            </Link>
          );
        })}
      </nav>
      <form action={logout} className="flex items-center gap-3 text-sm">
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
          {name}
        </span>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Đăng xuất</span>
        </button>
      </form>
    </header>
  );
}
