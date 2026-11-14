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
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-stone-300 bg-white px-4 py-3 text-stone-950 shadow-xs">
      <nav aria-label="Menu quản trị" className="flex flex-wrap items-center gap-1.5 text-sm font-bold">
        {links.map((l) => {
          const active = pathname === l.href;
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`btn-interactive inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 ${
                active
                  ? "bg-stone-900 font-bold text-white shadow-xs"
                  : "text-stone-800 hover:bg-stone-200 hover:text-stone-950"
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
          className={`rounded-full border-2 px-3 py-1 text-xs font-bold ${
            isStaff
              ? "border-emerald-700/30 bg-emerald-100 text-emerald-950"
              : "border-amber-700/30 bg-amber-100 text-amber-950"
          }`}
        >
          {isStaff ? `Stylist: ${name}` : `Chủ tiệm: ${name}`}
        </span>
        <button
          type="submit"
          className="btn-interactive inline-flex items-center gap-1.5 rounded-full border-2 border-stone-300 bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-900 hover:border-red-500 hover:bg-red-50 hover:text-red-800"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Đăng xuất</span>
        </button>
      </form>
    </header>
  );
}
