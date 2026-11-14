import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SHOP_TZ_OFFSET, dayStart } from "@/lib/availability";
import AdminNav from "../AdminNav";

export const dynamic = "force-dynamic";

const HOUR_FROM = 8;
const HOUR_TO = 20;
const PX_PER_HOUR = 56;
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
  PENDING: "bg-amber-100 border-amber-400 text-amber-900",
  CONFIRMED: "bg-blue-100 border-blue-400 text-blue-900",
  COMPLETED: "bg-emerald-100 border-emerald-400 text-emerald-900",
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; staff?: string }>;
}) {
  const session = await requireAdmin();
  const sp = await searchParams;
  const base = /^\d{4}-\d{2}-\d{2}$/.test(sp.week ?? "") ? sp.week! : ymd(new Date());
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
    <main className="mx-auto max-w-6xl space-y-4 px-4 py-8">
      <AdminNav name={session.name} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          Lịch tuần {days[0].slice(5)} → {days[6].slice(5)}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link href={q(addDays(monday, -7))} className="rounded-lg border px-3 py-1.5">← Tuần trước</Link>
          <Link href={q(ymd(new Date()))} className="rounded-lg border px-3 py-1.5">Hôm nay</Link>
          <Link href={q(addDays(monday, 7))} className="rounded-lg border px-3 py-1.5">Tuần sau →</Link>
          <Link href={`?week=${monday}`} className={`rounded-lg border px-3 py-1.5 ${!sp.staff ? "bg-zinc-900 text-white" : ""}`}>Tất cả NV</Link>
          {staff.map((s) => (
            <Link key={s.id} href={`?week=${monday}&staff=${s.id}`}
              className={`rounded-lg border px-3 py-1.5 ${sp.staff === s.id ? "bg-zinc-900 text-white" : ""}`}>
              {s.user.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="grid min-w-[800px] grid-cols-[56px_repeat(7,1fr)]">
          <div />
          {days.map((d, i) => (
            <div key={d} className="border-l px-2 py-2 text-center text-xs font-semibold">
              {DAY_NAMES[(i + 1) % 7]} {d.slice(8)}/{d.slice(5, 7)}
            </div>
          ))}

          <div className="relative" style={{ height: hours.length * PX_PER_HOUR }}>
            {hours.map((h, i) => (
              <div key={h} className="absolute right-1 -translate-y-2 text-[10px] text-zinc-400" style={{ top: i * PX_PER_HOUR }}>
                {h}:00
              </div>
            ))}
          </div>
          {days.map((d) => {
            const list = bookings.filter((b) => ymd(b.startTime) === d);
            return (
              <div key={d} className="relative border-l" style={{ height: hours.length * PX_PER_HOUR }}>
                {hours.map((h, i) => (
                  <div key={h} className="absolute inset-x-0 border-t border-zinc-100" style={{ top: i * PX_PER_HOUR }} />
                ))}
                {list.map((b) => {
                  const top = ((minutesOfDay(b.startTime) - HOUR_FROM * 60) / 60) * PX_PER_HOUR;
                  const height = Math.max(((b.endTime.getTime() - b.startTime.getTime()) / 3600_000) * PX_PER_HOUR, 22);
                  return (
                    <div key={b.id} title={`#${b.code} · ${b.customerPhone}`}
                      className={`absolute inset-x-0.5 overflow-hidden rounded border-l-4 px-1 text-[11px] leading-tight ${COLORS[b.status]}`}
                      style={{ top, height }}>
                      <b>{hhmm(b.startTime)}</b> {b.customerName}
                      <div className="truncate opacity-80">{b.items.map((i) => i.service.name).join(", ")} · {b.staff.user.name}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-xs text-zinc-500">Vàng: chờ cọc · Xanh dương: đã xác nhận · Xanh lá: hoàn thành</p>
    </main>
  );
}
