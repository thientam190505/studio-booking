import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { requireStaffOrAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SHOP_TZ_OFFSET, dayStart } from "@/lib/availability";
import AdminNav from "../AdminNav";

export const dynamic = "force-dynamic";

const HOUR_FROM = 8;
const HOUR_TO = 20;
const PX_PER_HOUR = 60;
const DAY_NAMES = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const ymd = (d: Date) => new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 10);
const addDays = (date: string, n: number) =>
  ymd(new Date(dayStart(date).getTime() + n * 24 * 3600_000));
/** Thứ Hai của tuần chứa `date` (theo múi giờ cửa hàng). */
function mondayOf(date: string) {
  const dow = new Date(`${date}T12:00:00${SHOP_TZ_OFFSET}`).getUTCDay();
  return addDays(date, dow === 0 ? -6 : 1 - dow);
}
const minutesOfDay = (d: Date) => {
  const l = new Date(d.getTime() + 7 * 3600_000);
  return l.getUTCHours() * 60 + l.getUTCMinutes();
};
const hhmm = (d: Date) => {
  const l = new Date(d.getTime() + 7 * 3600_000);
  return `${String(l.getUTCHours()).padStart(2, "0")}:${String(l.getUTCMinutes()).padStart(2, "0")}`;
};

const COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 border-amber-700 text-amber-950",
  CONFIRMED: "bg-blue-100 border-blue-700 text-blue-950",
  COMPLETED: "bg-emerald-100 border-emerald-700 text-emerald-950",
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; staff?: string }>;
}) {
  const session = await requireStaffOrAdmin();
  const isStaff = session.role === "STAFF";
  const sp = await searchParams;
  const todayStr = ymd(new Date());
  const base = /^\d{4}-\d{2}-\d{2}$/.test(sp.week ?? "") ? sp.week! : todayStr;
  const monday = mondayOf(base);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const from = dayStart(monday);
  const to = dayStart(addDays(monday, 7));

  const filterStaffId = isStaff ? (session.staffId ?? "__none__") : sp.staff;

  const [staff, bookings] = await Promise.all([
    prisma.staff.findMany({ include: { user: true } }),
    prisma.booking.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
        startTime: { gte: from, lt: to },
        ...(filterStaffId ? { staffId: filterStaffId } : {}),
      },
      include: { staff: { include: { user: true } }, items: { include: { service: true } } },
    }),
  ]);

  const hours = Array.from({ length: HOUR_TO - HOUR_FROM }, (_, i) => HOUR_FROM + i);
  const q = (week: string) => `?week=${week}${!isStaff && sp.staff ? `&staff=${sp.staff}` : ""}`;

  return (
    <main className="mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-6">
      <AdminNav name={session.name} role={session.role} />

      <div className="reveal-up flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-950">
            {isStaff ? `Lịch tuần của ${session.name}` : "Lịch tuần"} ({days[0].slice(8)}/{days[0].slice(5, 7)} – {days[6].slice(8)}/{days[6].slice(5, 7)})
          </h1>
          <p className="text-sm font-medium text-stone-800">
            {isStaff ? "Các khung giờ khách đã đặt riêng với bạn trong tuần (UTC+7)." : "Theo dõi mật độ lịch hẹn theo từng khung giờ (UTC+7)."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <Link href={q(addDays(monday, -7))} className="btn-interactive inline-flex items-center gap-1 rounded-full border-2 border-stone-300 bg-white px-3.5 py-1.5 font-bold text-stone-950 hover:border-stone-900">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span>Tuần trước</span>
          </Link>
          <Link href={q(todayStr)} className="btn-interactive rounded-full border-2 border-stone-900 bg-stone-900 px-4 py-1.5 font-bold text-white hover:bg-amber-800 hover:border-amber-800">
            Hôm nay
          </Link>
          <Link href={q(addDays(monday, 7))} className="btn-interactive inline-flex items-center gap-1 rounded-full border-2 border-stone-300 bg-white px-3.5 py-1.5 font-bold text-stone-950 hover:border-stone-900">
            <span>Tuần sau</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Bộ lọc nhân viên */}
      <div className="reveal-up delay-1 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-stone-300 bg-white px-4 py-3 shadow-xs">
        {isStaff ? (
          <div className="text-xs font-bold text-stone-800">
            Stylist: <span className="rounded-full bg-stone-900 px-3 py-1 text-white">{session.name}</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="text-stone-700">Stylist:</span>
            <Link
              href={`?week=${monday}`}
              className={`btn-interactive rounded-full px-3.5 py-1.5 ${!sp.staff ? "bg-stone-900 text-white shadow-2xs" : "bg-stone-200 text-stone-900 hover:bg-stone-300"}`}
            >
              Tất cả thợ
            </Link>
            {staff.map((s) => (
              <Link
                key={s.id}
                href={`?week=${monday}&staff=${s.id}`}
                className={`btn-interactive rounded-full px-3.5 py-1.5 ${sp.staff === s.id ? "bg-amber-800 text-white shadow-2xs" : "bg-stone-200 text-stone-900 hover:bg-stone-300"}`}
              >
                {s.user.name}
              </Link>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-stone-900">
          <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-amber-600" /> Chờ cọc</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-blue-700" /> Đã xác nhận</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-emerald-700" /> Hoàn thành</span>
        </div>
      </div>

      <div className="reveal-up delay-2 overflow-x-auto rounded-2xl border-2 border-stone-300 bg-white shadow-sm">
        <div className="grid min-w-[820px] grid-cols-[60px_repeat(7,1fr)]">
          <div className="border-b-2 border-stone-300 bg-[#e9dfd0]" />
          {days.map((d, i) => {
            const isToday = d === todayStr;
            return (
              <div
                key={d}
                className={`border-b-2 border-l border-stone-300 px-2 py-2.5 text-center text-xs font-extrabold ${
                  isToday ? "bg-amber-800 text-white" : "bg-[#e9dfd0] text-stone-950"
                }`}
              >
                {DAY_NAMES[(i + 1) % 7]} {d.slice(8)}/{d.slice(5, 7)}
              </div>
            );
          })}

          <div className="relative bg-[#faf6ef]" style={{ height: hours.length * PX_PER_HOUR }}>
            {hours.map((h, i) => (
              <div key={h} className="absolute right-2 -translate-y-2 font-mono text-[11px] font-bold text-stone-800" style={{ top: i * PX_PER_HOUR }}>
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>
          {days.map((d) => {
            const list = bookings.filter((b) => ymd(b.startTime) === d);
            const isTodayCol = d === todayStr;
            return (
              <div
                key={d}
                className={`relative border-l border-stone-200 ${isTodayCol ? "bg-amber-50/35" : ""}`}
                style={{ height: hours.length * PX_PER_HOUR }}
              >
                {hours.map((h, i) => (
                  <div key={h} className="absolute inset-x-0 border-t border-stone-100" style={{ top: i * PX_PER_HOUR }} />
                ))}
                {list.map((b) => {
                  const top = ((minutesOfDay(b.startTime) - HOUR_FROM * 60) / 60) * PX_PER_HOUR;
                  const height = Math.max(((b.endTime.getTime() - b.startTime.getTime()) / 3600_000) * PX_PER_HOUR, 26);
                  return (
                    <div
                      key={b.id}
                      title={`#${b.code} · ${b.customerName} · ${b.customerPhone}`}
                      className={`absolute inset-x-1 overflow-hidden rounded-lg border border-l-4 px-1.5 py-0.5 text-[11px] leading-tight shadow-xs transition-all duration-150 hover:z-10 hover:scale-[1.02] hover:shadow-md ${COLORS[b.status]}`}
                      style={{ top, height }}
                    >
                      <div className="truncate font-bold">
                        {hhmm(b.startTime)} · {b.customerName}
                      </div>
                      <div className="truncate text-[10px] font-medium opacity-85">
                        {b.items.map((i) => i.service.name).join(", ")} {!isStaff && `· ${b.staff.user.name}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
