import { CalendarOff, Clock, Trash2 } from "lucide-react";
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
  const inputCls =
    "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500";

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <AdminNav name={session.name} />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nhân viên & ca làm</h1>
        <p className="text-sm text-slate-600">Cập nhật giờ làm việc và ngày nghỉ phép; lịch trống của khách tự động tính lại theo cài đặt này.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {staff.map((s) => (
          <section key={s.id} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-base font-bold text-indigo-700">
                {s.user.name.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">{s.user.name}</h2>
                <div className="text-xs text-slate-500">{s.specialty}</div>
              </div>
            </div>

            <form action={updateStaffHours} className="space-y-2 rounded-xl bg-slate-50/70 p-3.5 text-sm">
              <input type="hidden" name="staffId" value={s.id} />
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Clock className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
                <span>Khung giờ làm việc</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor={`start-${s.id}`} className="sr-only">Giờ bắt đầu của {s.user.name}</label>
                <input id={`start-${s.id}`} type="time" name="workStart" step={1800} defaultValue={hhmm(s.workStart)} className={inputCls} />
                <span className="text-slate-400">→</span>
                <label htmlFor={`end-${s.id}`} className="sr-only">Giờ kết thúc của {s.user.name}</label>
                <input id={`end-${s.id}`} type="time" name="workEnd" step={1800} defaultValue={hhmm(s.workEnd)} className={inputCls} />
                <button type="submit" className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700">
                  Lưu ca làm
                </button>
              </div>
            </form>

            <form action={createTimeOff} className="space-y-2 rounded-xl bg-slate-50/70 p-3.5 text-sm">
              <input type="hidden" name="staffId" value={s.id} />
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <CalendarOff className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
                <span>Đăng ký ngày nghỉ</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor={`off-date-${s.id}`} className="sr-only">Ngày nghỉ của {s.user.name}</label>
                <input id={`off-date-${s.id}`} type="date" name="date" required className={inputCls} />
                <label htmlFor={`off-reason-${s.id}`} className="sr-only">Lý do nghỉ của {s.user.name}</label>
                <input id={`off-reason-${s.id}`} name="reason" placeholder="Lý do (tùy chọn)" className={inputCls + " min-w-36 flex-1"} />
                <button type="submit" className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                  Thêm ngày nghỉ
                </button>
              </div>
            </form>

            {s.timeOffs.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-500">Ngày nghỉ sắp tới</div>
                <ul className="space-y-1.5 text-sm">
                  {s.timeOffs.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-900">
                      <span>
                        <b>{fmtDate(t.start)}</b> {t.reason && `– ${t.reason}`}
                      </span>
                      <form action={deleteTimeOff.bind(null, t.id)}>
                        <button
                          type="submit"
                          aria-label={`Xóa ngày nghỉ ${fmtDate(t.start)}`}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Xóa</span>
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
