import Link from "next/link";
import { CalendarCheck, CircleDollarSign, Clock, RotateCcw, Scissors, TrendingUp, Wallet } from "lucide-react";
import { requireStaffOrAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/format";
import { resetFullDemo, resetTestBookings, updateBookingStatus } from "./actions";
import AdminNav from "./AdminNav";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ cọc",
  CONFIRMED: "Đã xác nhận",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: "border-amber-700/40 bg-amber-100 text-amber-950",
  CONFIRMED: "border-blue-700/40 bg-blue-100 text-blue-950",
  COMPLETED: "border-emerald-700/40 bg-emerald-100 text-emerald-950",
  CANCELLED: "border-stone-500/40 bg-stone-200 text-stone-900",
};
const NEXT: Record<string, { to: string; label: string; cls: string }[]> = {
  PENDING: [
    { to: "CONFIRMED", label: "Xác nhận", cls: "border-blue-600 bg-blue-50 text-blue-900 hover:bg-blue-100" },
    { to: "CANCELLED", label: "Hủy", cls: "border-stone-400 bg-white text-stone-800 hover:border-red-600 hover:bg-red-50 hover:text-red-800" },
  ],
  CONFIRMED: [
    { to: "COMPLETED", label: "Hoàn thành", cls: "border-emerald-700 bg-emerald-50 text-emerald-900 hover:bg-emerald-100" },
    { to: "CANCELLED", label: "Hủy", cls: "border-stone-400 bg-white text-stone-800 hover:border-red-600 hover:bg-red-50 hover:text-red-800" },
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
        { label: "Ca sắp làm (Đã xác nhận)", value: `${count("CONFIRMED")} ca`, icon: Scissors, tone: "bg-stone-900 text-amber-100", border: "border-l-stone-900" },
        { label: "Đang chờ khách cọc", value: `${count("PENDING")} ca`, icon: Clock, tone: "bg-amber-700 text-white", border: "border-l-amber-700" },
        { label: "Ca đã hoàn thành", value: `${count("COMPLETED")} ca`, icon: CalendarCheck, tone: "bg-emerald-700 text-white", border: "border-l-emerald-700" },
        { label: "Tổng lịch của tôi", value: `${bookings.filter((b) => b.status !== "CANCELLED").length} lịch`, icon: TrendingUp, tone: "bg-amber-900 text-amber-100", border: "border-l-amber-900" },
      ]
    : [
        { label: "Doanh thu (hoàn thành)", value: formatVND(revenue), icon: CircleDollarSign, tone: "bg-emerald-700 text-white", border: "border-l-emerald-700" },
        { label: "Tiền cọc đang giữ", value: formatVND(deposits), icon: Wallet, tone: "bg-amber-800 text-white", border: "border-l-amber-800" },
        { label: "Chờ cọc / Đã xác nhận", value: `${count("PENDING")} / ${count("CONFIRMED")}`, icon: Clock, tone: "bg-stone-900 text-amber-100", border: "border-l-stone-900" },
        { label: "Hoàn thành / Đã hủy", value: `${count("COMPLETED")} / ${count("CANCELLED")}`, icon: CalendarCheck, tone: "bg-stone-700 text-white", border: "border-l-stone-700" },
      ];

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <AdminNav name={session.name} role={session.role} />

      <div className="reveal-up flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-950">
            {isStaff ? `Lịch làm việc của ${session.name}` : "Sổ lịch & quản lý tiệm"}
          </h1>
          <p className="text-sm font-medium text-stone-800">
            {isStaff
              ? "Hiển thị các lịch hẹn khách đã đặt riêng với bạn — xem rõ khung giờ, dịch vụ và cập nhật trạng thái."
              : "Theo dõi doanh thu toàn tiệm, lịch hẹn của các stylist và cập nhật tiến độ phục vụ."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {bookings.length > 0 && (
            <form action={resetTestBookings}>
              <button
                type="submit"
                className="btn-interactive inline-flex items-center gap-1.5 rounded-full border-2 border-red-300 bg-red-50 px-3.5 py-2 text-sm font-bold text-red-800 hover:bg-red-600 hover:text-white"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Reset lịch test ({bookings.length})</span>
              </button>
            </form>
          )}
          {!isStaff && (
            <form action={resetFullDemo}>
              <button
                type="submit"
                className="btn-interactive inline-flex items-center gap-1.5 rounded-full border-2 border-amber-700/40 bg-amber-50 px-3.5 py-2 text-sm font-bold text-amber-950 hover:border-amber-800 hover:bg-amber-800 hover:text-white"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Khôi phục mẫu gốc</span>
              </button>
            </form>
          )}
          <Link
            href="/admin/calendar"
            className="btn-interactive rounded-full border-2 border-stone-400 bg-white px-4 py-2 text-sm font-bold text-stone-950 shadow-2xs hover:border-stone-900 hover:bg-stone-900 hover:text-white"
          >
            {isStaff ? "Xem lịch tuần của tôi →" : "Xem lịch tuần dạng lưới →"}
          </Link>
        </div>
      </div>

      {/* KPI */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((st, idx) => {
          const Icon = st.icon;
          const delayCls = idx === 1 ? "delay-1" : idx === 2 ? "delay-2" : idx === 3 ? "delay-3" : "";
          return (
            <div
              key={st.label}
              className={`card-interactive reveal-up ${delayCls} flex items-center gap-4 rounded-2xl border-2 border-l-4 border-stone-300 ${st.border} bg-white p-4 shadow-xs`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${st.tone}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-stone-700">{st.label}</div>
                <div className="mt-0.5 truncate text-xl font-extrabold text-stone-950">{st.value}</div>
              </div>
            </div>
          );
        })}
      </section>

      {top.length > 0 && (
        <section className="reveal-up delay-1 flex flex-wrap items-center gap-2 rounded-2xl border-2 border-stone-300 bg-white px-4 py-3 text-sm shadow-2xs">
          <span className="inline-flex items-center gap-1.5 font-extrabold text-stone-950">
            <TrendingUp className="h-4 w-4 text-amber-800" aria-hidden="true" />
            {isStaff ? "Dịch vụ bạn làm nhiều nhất:" : "Dịch vụ được đặt nhiều:"}
          </span>
          {top.map(([n, c]) => (
            <span key={n} className="rounded-full border border-amber-700/30 bg-amber-100 px-3 py-1 text-xs font-bold text-amber-950">
              {n} ({c} lượt)
            </span>
          ))}
        </section>
      )}

      {bookings.length === 0 && (
        <div className="reveal-up rounded-2xl border-2 border-dashed border-stone-400 bg-white p-10 text-center text-sm font-medium text-stone-800">
          {isStaff ? (
            <>
              Hiện chưa có khách nào đặt lịch với <b>{session.name}</b>. Hãy thử qua trang{" "}
              <Link href="/book" className="font-bold text-amber-900 underline">
                Đặt lịch
              </Link>{" "}
              và chọn stylist <b>{session.name}</b> để kiểm tra!
            </>
          ) : (
            <>
              Chưa có lịch hẹn nào trong hệ thống. Hãy thử{" "}
              <Link href="/book" className="font-bold text-amber-900 underline">
                đặt một lịch mẫu
              </Link>{" "}
              để kiểm tra!
            </>
          )}
        </div>
      )}

      <div className="space-y-4">
        {[...byDay.entries()].map(([day, list]) => (
          <section key={day} className="reveal-up delay-1 overflow-hidden rounded-2xl border-2 border-stone-300 bg-white shadow-xs">
            <div className="flex items-center justify-between border-b-2 border-stone-300 bg-[#e9dfd0] px-5 py-3 text-stone-950">
              <h2 className="text-sm font-extrabold capitalize text-stone-950">{day}</h2>
              <span className="rounded-full bg-stone-900 px-3 py-0.5 text-xs font-bold text-white">
                {list.length} ca hẹn
              </span>
            </div>
            <ul className="divide-y divide-stone-200">
              {list.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center gap-4 px-5 py-4 text-sm transition-colors hover:bg-[#faf6ef]">
                  <div className="w-34 shrink-0 rounded-xl border-2 border-stone-300 bg-[#f6f0e6] px-3 py-2 text-center">
                    <div className="font-mono text-sm font-extrabold text-stone-950">
                      {fmtTime(b.startTime)} – {fmtTime(b.endTime)}
                    </div>
                    <div className="font-mono text-[11px] font-bold text-amber-900">#{b.code}</div>
                  </div>
                  <div className="min-w-52 flex-1 space-y-1.5">
                    <div className="font-extrabold text-stone-950">
                      Khách: {b.customerName} <span className="font-semibold text-stone-700">· {b.customerPhone}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {b.items.map((i) => (
                        <span key={i.id} className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-stone-200/80 px-2.5 py-0.5 text-xs font-bold text-stone-900">
                          <Scissors className="h-3 w-3 text-amber-900" aria-hidden="true" />
                          {i.service.name} ({i.duration}p)
                        </span>
                      ))}
                      {!isStaff && (
                        <span className="text-xs font-semibold text-stone-800">
                          · Stylist: <b className="text-stone-950">{b.staff.user.name}</b> · Tổng: <b className="text-stone-950">{formatVND(b.totalPrice)}</b>
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`rounded-full border-2 px-3 py-1 text-xs font-extrabold ${STATUS_COLOR[b.status]}`}>
                    {STATUS_LABEL[b.status]}
                  </span>
                  <div className="flex gap-2">
                    {(NEXT[b.status] ?? []).map((a) => (
                      <form key={a.to} action={updateBookingStatus.bind(null, b.id, a.to)}>
                        <button type="submit" className={`btn-interactive rounded-full border-2 px-3.5 py-1.5 text-xs font-bold ${a.cls}`}>
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
