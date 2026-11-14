import Link from "next/link";
import { CalendarCheck, CircleDollarSign, Clock, TrendingUp, Wallet } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/format";
import { updateBookingStatus } from "./actions";
import AdminNav from "./AdminNav";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ cọc",
  CONFIRMED: "Đã xác nhận",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  CONFIRMED: "border-blue-200 bg-blue-50 text-blue-800",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  CANCELLED: "border-slate-200 bg-slate-100 text-slate-600",
};
const NEXT: Record<string, { to: string; label: string; cls: string }[]> = {
  PENDING: [
    { to: "CONFIRMED", label: "Xác nhận", cls: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100" },
    { to: "CANCELLED", label: "Hủy", cls: "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700" },
  ],
  CONFIRMED: [
    { to: "COMPLETED", label: "Hoàn thành", cls: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
    { to: "CANCELLED", label: "Hủy", cls: "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700" },
  ],
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

  const stats = [
    { label: "Doanh thu (hoàn thành)", value: formatVND(revenue), icon: CircleDollarSign, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Tiền cọc đang giữ", value: formatVND(deposits), icon: Wallet, tone: "bg-indigo-50 text-indigo-600" },
    { label: "Chờ cọc / Đã xác nhận", value: `${count("PENDING")} / ${count("CONFIRMED")}`, icon: Clock, tone: "bg-amber-50 text-amber-600" },
    { label: "Hoàn thành / Đã hủy", value: `${count("COMPLETED")} / ${count("CANCELLED")}`, icon: CalendarCheck, tone: "bg-blue-50 text-blue-600" },
  ];

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <AdminNav name={session.name} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard quản trị</h1>
          <p className="text-sm text-slate-600">Theo dõi doanh thu, trạng thái lịch hẹn và cập nhật tiến độ phục vụ.</p>
        </div>
        <Link
          href="/admin/calendar"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Xem lịch tuần dạng lưới →
        </Link>
      </div>

      {/* KPI */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((st) => {
          const Icon = st.icon;
          return (
            <div key={st.label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${st.tone}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-500">{st.label}</div>
                <div className="mt-0.5 truncate text-xl font-bold text-slate-900">{st.value}</div>
              </div>
            </div>
          );
        })}
      </section>

      {top.length > 0 && (
        <section className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
            <TrendingUp className="h-4 w-4 text-indigo-600" aria-hidden="true" />
            Dịch vụ phổ biến:
          </span>
          {top.map(([n, c]) => (
            <span key={n} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {n} ({c} lượt)
            </span>
          ))}
        </section>
      )}

      {bookings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Chưa có lịch hẹn nào trong hệ thống. Hãy thử{" "}
          <Link href="/book" className="font-semibold text-indigo-600 underline">
            đặt một lịch mẫu
          </Link>{" "}
          để kiểm tra!
        </div>
      )}

      <div className="space-y-4">
        {[...byDay.entries()].map(([day, list]) => (
          <section key={day} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3">
              <h2 className="text-sm font-semibold capitalize text-slate-900">{day}</h2>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600 border border-slate-200">
                {list.length} lịch hẹn
              </span>
            </div>
            <ul className="divide-y divide-slate-100">
              {list.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center gap-4 px-5 py-4 text-sm transition hover:bg-slate-50/50">
                  <div className="w-28 shrink-0">
                    <div className="font-mono text-sm font-bold text-slate-900">
                      {fmtTime(b.startTime)} – {fmtTime(b.endTime)}
                    </div>
                    <div className="font-mono text-xs text-slate-500">#{b.code}</div>
                  </div>
                  <div className="min-w-52 flex-1 space-y-0.5">
                    <div className="font-semibold text-slate-900">
                      {b.customerName} <span className="font-normal text-slate-500">· {b.customerPhone}</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      {b.items.map((i) => i.service.name).join(", ")} · NV: <b>{b.staff.user.name}</b> · Tổng: <b>{formatVND(b.totalPrice)}</b>
                    </div>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_COLOR[b.status]}`}>
                    {STATUS_LABEL[b.status]}
                  </span>
                  <div className="flex gap-2">
                    {(NEXT[b.status] ?? []).map((a) => (
                      <form key={a.to} action={updateBookingStatus.bind(null, b.id, a.to)}>
                        <button type="submit" className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${a.cls}`}>
                          {a.label}
                        </button>
                      </form>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
