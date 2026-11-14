import Link from "next/link";
import { CalendarCheck, CircleDollarSign, Clock, RotateCcw, Scissors, TrendingUp, Wallet } from "lucide-react";
import { requireStaffOrAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/format";
import { resetTestBookings, updateBookingStatus } from "./actions";
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
  const session = await requireStaffOrAdmin();
  const isStaff = session.role === "STAFF";

  const bookings = await prisma.booking.findMany({
    where: isStaff ? { staffId: session.staffId ?? "__none__" } : undefined,
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

  const stats = isStaff
    ? [
        { label: "Ca sắp làm (Đã xác nhận)", value: `${count("CONFIRMED")} ca`, icon: Scissors, tone: "bg-blue-50 text-blue-600" },
        { label: "Đang chờ khách cọc", value: `${count("PENDING")} ca`, icon: Clock, tone: "bg-amber-50 text-amber-600" },
        { label: "Ca đã hoàn thành", value: `${count("COMPLETED")} ca`, icon: CalendarCheck, tone: "bg-emerald-50 text-emerald-600" },
        { label: "Tổng lịch của tôi", value: `${bookings.filter((b) => b.status !== "CANCELLED").length} lịch`, icon: TrendingUp, tone: "bg-indigo-50 text-indigo-600" },
      ]
    : [
        { label: "Doanh thu (hoàn thành)", value: formatVND(revenue), icon: CircleDollarSign, tone: "bg-emerald-50 text-emerald-600" },
        { label: "Tiền cọc đang giữ", value: formatVND(deposits), icon: Wallet, tone: "bg-indigo-50 text-indigo-600" },
        { label: "Chờ cọc / Đã xác nhận", value: `${count("PENDING")} / ${count("CONFIRMED")}`, icon: Clock, tone: "bg-amber-50 text-amber-600" },
        { label: "Hoàn thành / Đã hủy", value: `${count("COMPLETED")} / ${count("CANCELLED")}`, icon: CalendarCheck, tone: "bg-blue-50 text-blue-600" },
      ];

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <AdminNav name={session.name} role={session.role} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isStaff ? `Lịch làm việc của ${session.name}` : "Dashboard quản trị"}
          </h1>
          <p className="text-sm text-slate-600">
            {isStaff
              ? "Chỉ hiển thị các lịch hẹn khách đã chọn bạn — xem rõ khung giờ, dịch vụ cần thực hiện và cập nhật trạng thái."
              : "Theo dõi doanh thu toàn tiệm, trạng thái lịch hẹn của tất cả nhân viên và cập nhật tiến độ phục vụ."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {bookings.length > 0 && (
            <form action={resetTestBookings}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Reset lịch test ({bookings.length})</span>
              </button>
            </form>
          )}
          <Link
            href="/admin/calendar"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            {isStaff ? "Xem lịch tuần của tôi →" : "Xem lịch tuần dạng lưới →"}
          </Link>
        </div>
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
            {isStaff ? "Dịch vụ bạn làm nhiều nhất:" : "Dịch vụ phổ biến:"}
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
          {isStaff ? (
            <>
              Hiện chưa có khách nào đặt lịch với <b>{session.name}</b>. Hãy thử qua trang{" "}
              <Link href="/book" className="font-semibold text-indigo-600 underline">
                Đặt lịch
              </Link>{" "}
              và chọn chuyên viên <b>{session.name}</b> để kiểm tra!
            </>
          ) : (
            <>
              Chưa có lịch hẹn nào trong hệ thống. Hãy thử{" "}
              <Link href="/book" className="font-semibold text-indigo-600 underline">
                đặt một lịch mẫu
              </Link>{" "}
              để kiểm tra!
            </>
          )}
        </div>
      )}

      <div className="space-y-4">
        {[...byDay.entries()].map(([day, list]) => (
          <section key={day} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3">
              <h2 className="text-sm font-semibold capitalize text-slate-900">{day}</h2>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {list.length} ca hẹn
              </span>
            </div>
            <ul className="divide-y divide-slate-100">
              {list.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center gap-4 px-5 py-4 text-sm transition hover:bg-slate-50/50">
                  <div className="w-32 shrink-0 rounded-xl bg-indigo-50/70 px-3 py-2 text-center">
                    <div className="font-mono text-sm font-bold text-indigo-950">
                      {fmtTime(b.startTime)} – {fmtTime(b.endTime)}
                    </div>
                    <div className="font-mono text-[11px] text-indigo-600">#{b.code}</div>
                  </div>
                  <div className="min-w-52 flex-1 space-y-1.5">
                    <div className="font-semibold text-slate-900">
                      Khách: {b.customerName} <span className="font-normal text-slate-500">· {b.customerPhone}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {b.items.map((i) => (
                        <span key={i.id} className="inline-flex items-center gap-1 rounded-lg border border-indigo-100 bg-indigo-50/60 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                          <Scissors className="h-3 w-3" aria-hidden="true" />
                          {i.service.name} ({i.duration}p)
                        </span>
                      ))}
                      {!isStaff && (
                        <span className="text-xs text-slate-600">
                          · Thợ: <b>{b.staff.user.name}</b> · Tổng: <b>{formatVND(b.totalPrice)}</b>
                        </span>
                      )}
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
