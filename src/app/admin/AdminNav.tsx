import Link from "next/link";
import { logout } from "./actions";

const LINKS = [
  { href: "/admin", label: "Lịch hẹn" },
  { href: "/admin/calendar", label: "Lịch tuần" },
  { href: "/admin/services", label: "Dịch vụ" },
  { href: "/admin/staff", label: "Nhân viên" },
];

export default function AdminNav({ name }: { name: string }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
      <nav className="flex gap-4 text-sm font-medium">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-indigo-600">
            {l.label}
          </Link>
        ))}
      </nav>
      <form action={logout} className="flex items-center gap-3 text-sm">
        <span className="text-zinc-500">{name}</span>
        <button className="rounded-lg border border-zinc-300 px-3 py-1.5">Đăng xuất</button>
      </form>
    </header>
  );
}
