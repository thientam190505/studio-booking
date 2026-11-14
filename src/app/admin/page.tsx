import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/format";
import { logout, updateBookingStatus } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ cọc",
  CONFIRMED: "Đã xác nhận",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-zinc-200 text-zinc-600",
};
const NEXT: Record<string, { to: string; label: string }[]> = {
  PENDING: [{ to: "CONFIRMED", label: "Xác nhận" }, { to: "CANCELLED", label: "Hủy" }],
  CONFIRMED: [{ to: "COMPLETED", label: "Hoàn thành" }, { to: "CANCELLED", label: "Hủy" }],
};

const fmtDay = (d: Date) =>
  new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }).format(d);
const fmtTime = (d: Date) =>
  new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }).format(d);

export default async function AdminPage() {
  const session = await requireAdmin();
  const bookings = await prisma.booking.findMany({
    orderBy: { startTime: "asc" },
    include: { staff: { include: { user: true } }, items: { include: { service: true } } },
  });

  const revenue = bookings.filter((b) => b.status === "COMPLETED").reduce((s, b) => s + b.totalPrice, 0);
  const deposits = bookings.filter((b) => b.status === "CONFIRMED").reduce((s, b) => s + b.depositAmount, 0);
  const count = (st: string) => bookings.filter((b) => b.status === st).length;

  const serviceCount = new Map<string, number>();
  bookings.filter((b) => b.status !== "CANCELLED").forEach((b) =>
    b.items.forEach((i) => serviceCount.set(i.service.name, (serviceCount.get(i.service.name) ?? 0) + 1))
  );
  const top = [...serviceCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  const byDay = new Map<string, typeof bookings>();
  bookings.forEach((b) => {
    const k = fmtDay(b.startTime);
    byDay.set(k, [...(byDay.get(k) ?? []), b]);
  });

  const stat = (label: string, value: string) => (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  );

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard quản trị</h1>
        <form action={logout} className="flex items-center gap-3 text-sm">
          <span className="text-zinc-500">{session.name}</span>
          <button className="rounded-lg border border-zinc-300 px-3 py-1.5">Đăng xuất</button>
        </form>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stat("Doanh thu (hoàn thành)", formatVND(revenue))}
        {stat("Tiền cọc đã nhận", formatVND(deposits))}
        {stat("Chờ cọc / Đã xác nhận", `${count("PENDING")} / ${count("CONFIRMED")}`)}
        {stat("Hoàn thành / Đã hủy", `${count("COMPLETED")} / ${count("CANCELLED")}`)}
      </section>

      {top.length > 0 && (
        <p className="text-sm text-zinc-600">
          Dịch vụ được chọn nhiều nhất: {top.map(([n, c]) => `${n} (${c})`).join(" · ")}
        </p>
      )}

      {bookings.length === 0 && <p className="text-zinc-500">Chưa có lịch hẹn nào.</p>}

      {[...byDay.entries()].map(([day, list]) => (
        <section key={day} className="rounded-xl border border-zinc-200 bg-white shadow-sm">
          <h2 className="border-b px-4 py-2 text-sm font-semibold capitalize">{day}</h2>
          <ul className="divide-y">
            {list.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                <span className="w-24 font-mono">{fmtTime(b.startTime)}–{fmtTime(b.endTime)}</span>
                <div className="min-w-48 flex-1">
                  <div className="font-medium">{b.customerName} · {b.customerPhone}</div>
                  <div className="text-xs text-zinc-500">
                    {b.items.map((i) => i.service.name).join(", ")} · NV {b.staff.user.name} · #{b.code}
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLOR[b.status]}`}>{STATUS_LABEL[b.status]}</span>
                <div className="flex gap-2">
                  {(NEXT[b.status] ?? []).map((a) => (
                    <form key={a.to} action={updateBookingStatus.bind(null, b.id, a.to)}>
                      <button className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs hover:bg-zinc-50">{a.label}</button>
                    </form>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
