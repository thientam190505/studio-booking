import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTimeOff, deleteTimeOff, updateStaffHours } from "../actions";
import AdminNav from "../AdminNav";

export const dynamic = "force-dynamic";

const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeZone: "Asia/Ho_Chi_Minh" }).format(d);

export default async function StaffPage() {
  const session = await requireAdmin();
  const staff = await prisma.staff.findMany({
    include: { user: true, timeOffs: { where: { end: { gt: new Date() } }, orderBy: { start: "asc" } } },
  });
  const input = "rounded-lg border border-zinc-300 px-3 py-2 text-sm";

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <AdminNav name={session.name} />
      <h1 className="text-2xl font-bold">Nhân viên & ca làm</h1>

      {staff.map((s) => (
        <section key={s.id} className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div>
            <div className="font-semibold">{s.user.name}</div>
            <div className="text-xs text-zinc-500">{s.specialty}</div>
          </div>

          <form action={updateStaffHours} className="flex flex-wrap items-center gap-2 text-sm">
            <input type="hidden" name="staffId" value={s.id} />
            Giờ làm:
            <input type="time" name="workStart" step={1800} defaultValue={hhmm(s.workStart)} className={input} />
            →
            <input type="time" name="workEnd" step={1800} defaultValue={hhmm(s.workEnd)} className={input} />
            <button className="rounded-lg border px-3 py-2">Lưu</button>
          </form>

          <form action={createTimeOff} className="flex flex-wrap items-center gap-2 text-sm">
            <input type="hidden" name="staffId" value={s.id} />
            Nghỉ ngày:
            <input type="date" name="date" required className={input} />
            <input name="reason" placeholder="Lý do" className={input} />
            <button className="rounded-lg border px-3 py-2">Thêm ngày nghỉ</button>
          </form>

          {s.timeOffs.length > 0 && (
            <ul className="space-y-1 text-sm">
              {s.timeOffs.map((t) => (
                <li key={t.id} className="flex items-center gap-2">
                  <span>{fmtDate(t.start)} {t.reason && `– ${t.reason}`}</span>
                  <form action={deleteTimeOff.bind(null, t.id)}>
                    <button className="text-xs text-red-600 underline">Xóa</button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </main>
  );
}
