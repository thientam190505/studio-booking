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
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200/90 bg-white px-4 py-3 text-stone-900 shadow-xs">
      <nav aria-label="Menu quản trị" className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
        {links.map((l) => {
          const active = pathname === l.href;
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`btn-interactive inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 ${
                active
                  ? "bg-stone-900 font-semibold text-white shadow-xs"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
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
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            isStaff
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          {isStaff ? `Stylist: ${name}` : `Chủ tiệm: ${name}`}
        </span>
        <button
          type="submit"
          className="btn-interactive inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Đăng xuất</span>
        </button>
      </form>
    </header>
  );
}
