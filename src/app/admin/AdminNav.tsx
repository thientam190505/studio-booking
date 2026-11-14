"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ClipboardList, LogOut, Sparkles, Users } from "lucide-react";
import { logout } from "./actions";

export default function AdminNav({ name, role = "ADMIN" }: { name: string; role?: string }) {
  const pathname = usePathname() || "/admin";
  const isStaff = role === "STAFF";

  const links = isStaff
    ? [
        { href: "/admin", label: "Lịch của tôi", icon: ClipboardList },
        { href: "/admin/calendar", label: "Lịch tuần cá nhân", icon: CalendarDays },
        { href: "/admin/staff", label: "Ca làm & Nghỉ phép", icon: Users },
      ]
    : [
        { href: "/admin", label: "Lịch hẹn", icon: ClipboardList },
        { href: "/admin/calendar", label: "Lịch tuần", icon: CalendarDays },
        { href: "/admin/services", label: "Dịch vụ", icon: Sparkles },
        { href: "/admin/staff", label: "Nhân viên", icon: Users },
      ];

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-4 py-3 text-white shadow-xl shadow-slate-950/15">
      <nav aria-label="Menu quản trị" className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
        {links.map((l) => {
          const active = pathname === l.href;
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`btn-interactive inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 ${
                active
                  ? "bg-indigo-600 font-semibold text-white shadow-md shadow-indigo-500/35"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{l.label}</span>
            </Link>
          );
        })}
      </nav>
      <form action={logout} className="flex items-center gap-2.5 text-sm">
        <span
          className={`rounded-lg px-2.5 py-1 text-xs font-bold ring-1 ${
            isStaff
              ? "bg-emerald-500/20 text-emerald-300 ring-emerald-400/40"
              : "bg-indigo-500/25 text-indigo-200 ring-indigo-400/40"
          }`}
        >
          {isStaff ? `Thợ: ${name}` : `Chủ quán: ${name}`}
        </span>
        <button
          type="submit"
          className="btn-interactive inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:border-red-400/60 hover:bg-red-500/25 hover:text-red-200"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Đăng xuất</span>
        </button>
      </form>
    </header>
  );
}
