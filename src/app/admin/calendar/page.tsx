import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
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
  PENDING: "bg-amber-50 border-amber-500 text-amber-950",
  CONFIRMED: "bg-blue-50 border-blue-500 text-blue-950",
  COMPLETED: "bg-emerald-50 border-emerald-500 text-emerald-950",
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; staff?: string }>;
}) {
  const session = await requireAdmin();
  const sp = await searchParams;
  const todayStr = ymd(new Date());
  const base = /^\d{4}-\d{2}-\d{2}$/.test(sp.week ?? "") ? sp.week! : todayStr;
  const monday = mondayOf(base);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const from = dayStart(monday);
  const to = dayStart(addDays(monday, 7));

  const [staff, bookings] = await Promise.all([
    prisma.staff.findMany({ include: { user: true } }),
    prisma.booking.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
        startTime: { gte: from, lt: to },
        ...(sp.staff ? { staffId: sp.staff } : {}),
      },
      include: { staff: { include: { user: true } }, items: { include: { service: true } } },
    }),
  ]);

  const hours = Array.from({ length: HOUR_TO - HOUR_FROM }, (_, i) => HOUR_FROM + i);
  const q = (week: string) => `?week=${week}${sp.staff ? `&staff=${sp.staff}` : ""}`;

  return (
    <main className="mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-6">
      <AdminNav name={session.name} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Lịch tuần ({days[0].slice(8)}/{days[0].slice(5, 7)} – {days[6].slice(8)}/{days[6].slice(5, 7)})
          </h1>
          <p className="text-sm text-slate-600">Theo dõi mật độ lịch hẹn theo từng khung giờ (UTC+7).</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <Link href={q(addDays(monday, -7))} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span>Tuần trước</span>
          </Link>
          <Link href={q(todayStr)} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">
            Hôm nay
          </Link>
          <Link href={q(addDays(monday, 7))} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">
            <span>Tuần sau</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Bộ lọc nhân viên */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="text-slate-500">Nhân viên:</span>
          <Link
            href={`?week=${monday}`}
            className={`rounded-full px-3 py-1.5 transition ${!sp.staff ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            Tất cả NV
          </Link>
          {staff.map((s) => (
            <Link
              key={s.id}
              href={`?week=${monday}&staff=${s.id}`}
              className={`rounded-full px-3 py-1.5 transition ${sp.staff === s.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
            >
              {s.user.name}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-500" /> Chờ cọc</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-blue-500" /> Đã xác nhận</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Hoàn thành</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid min-w-[820px] grid-cols-[60px_repeat(7,1fr)]">
          <div className="border-b border-slate-200 bg-slate-50" />
          {days.map((d, i) => {
            const isToday = d === todayStr;
            return (
              <div
                key={d}
                className={`border-b border-l border-slate-200 px-2 py-2.5 text-center text-xs font-semibold ${
                  isToday ? "bg-indigo-50 text-indigo-700" : "bg-slate-50 text-slate-700"
                }`}
              >
                {DAY_NAMES[(i + 1) % 7]} {d.slice(8)}/{d.slice(5, 7)}
              </div>
            );
          })}

          <div className="relative bg-slate-50/40" style={{ height: hours.length * PX_PER_HOUR }}>
            {hours.map((h, i) => (
              <div key={h} className="absolute right-2 -translate-y-2 font-mono text-[11px] text-slate-400" style={{ top: i * PX_PER_HOUR }}>
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>
          {days.map((d) => {
            const list = bookings.filter((b) => ymd(b.startTime) === d);
            return (
              <div key={d} className="relative border-l border-slate-200" style={{ height: hours.length * PX_PER_HOUR }}>
                {hours.map((h, i) => (
                  <div key={h} className="absolute inset-x-0 border-t border-slate-100" style={{ top: i * PX_PER_HOUR }} />
                ))}
                {list.map((b) => {
                  const top = ((minutesOfDay(b.startTime) - HOUR_FROM * 60) / 60) * PX_PER_HOUR;
                  const height = Math.max(((b.endTime.getTime() - b.startTime.getTime()) / 3600_000) * PX_PER_HOUR, 26);
                  return (
                    <div
                      key={b.id}
                      title={`#${b.code} · ${b.customerName} · ${b.customerPhone}`}
                      className={`absolute inset-x-1 overflow-hidden rounded-lg border border-l-4 px-1.5 py-0.5 text-[11px] leading-tight shadow-xs ${COLORS[b.status]}`}
                      style={{ top, height }}
                    >
                      <div className="truncate font-semibold">
                        {hhmm(b.startTime)} · {b.customerName}
                      </div>
                      <div className="truncate text-[10px] opacity-80">
                        {b.items.map((i) => i.service.name).join(", ")} · {b.staff.user.name}
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
