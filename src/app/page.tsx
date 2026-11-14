import Link from "next/link";
import { ArrowRight, CalendarCheck2, Clock, CreditCard, Search, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/format";

export const dynamic = "force-dynamic";

const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export default async function Home() {
  const [services, staff] = await Promise.all([
    prisma.service.findMany({ where: { active: true }, orderBy: { price: "asc" } }),
    prisma.staff.findMany({ include: { user: { select: { name: true } } } }),
  ]);

  const highlights = [
    { icon: Clock, title: "30 phút / slot", desc: "Tự động tính tổng thời lượng dịch vụ" },
    { icon: ShieldCheck, title: "Zero Conflict", desc: "Khóa khung giờ tức thì bằng Transaction" },
    { icon: CalendarCheck2, title: "Giữ chỗ 10 phút", desc: "Tự nhả khung giờ nếu chưa cọc" },
    { icon: CreditCard, title: "Cọc 20% linh hoạt", desc: "Xác nhận và nhận email tự động" },
  ];

  return (
    <main className="mx-auto max-w-6xl space-y-16 px-4 py-10 sm:px-6 sm:py-14">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-100/70 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Đặt lịch thông minh · Khung giờ trống Real-time</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl sm:leading-tight">
            Đặt lịch hẹn dịch vụ nhanh gọn, không lo trùng giờ
          </h1>
          <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
            Chọn dịch vụ, chuyên viên yêu thích và khung giờ còn trống theo thời gian thực. Giữ chỗ tự động trong 10 phút, xác nhận tức thì và tra cứu mọi lúc.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700"
            >
              <span>Đặt lịch hẹn ngay</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/lookup"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>Tra cứu lịch hẹn</span>
            </Link>
          </div>
        </div>

        <div className="relative mt-10 grid gap-3 border-t border-slate-100 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                  <div className="mt-0.5 text-xs text-slate-600">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dịch vụ nổi bật */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Bảng dịch vụ</h2>
            <p className="mt-1 text-sm text-slate-600">Có thể kết hợp nhiều dịch vụ trong một lần đặt, hệ thống tự động cộng thời lượng.</p>
          </div>
          <Link href="/book" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            <span>Chọn dịch vụ & đặt lịch</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const paused = Boolean(s.unavailableReason);
            return (
              <div
                key={s.id}
                className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition ${
                  paused ? "border-amber-200 bg-amber-50/20" : "border-slate-200 hover:border-indigo-200 hover:shadow-md"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                      {s.category}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {s.durationMinutes} phút
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900">{s.name}</h3>
                  <p className="text-sm text-slate-600">{s.description || "Dịch vụ chăm sóc chuyên nghiệp theo lịch hẹn."}</p>
                </div>
                <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                  <span className="text-lg font-bold text-indigo-600">{formatVND(s.price)}</span>
                  {paused ? (
                    <span className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      Tạm ngưng: {s.unavailableReason}
                    </span>
                  ) : (
                    <Link
                      href="/book"
                      className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                    >
                      Đặt lịch →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Đội ngũ chuyên viên */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Đội ngũ chuyên viên</h2>
          <p className="mt-1 text-sm text-slate-600">Lịch rảnh được tính riêng theo ca làm việc và ngày nghỉ của từng người.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {staff.map((st) => (
            <div key={st.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-base font-bold text-white">
                {st.user.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <span className="truncate">{st.user.name}</span>
                  <UserCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                </div>
                <div className="truncate text-sm text-slate-600">{st.specialty || "Chuyên viên"}</div>
                <div className="mt-1 text-xs text-slate-500">
                  Ca làm: {hhmm(st.workStart)} – {hhmm(st.workEnd)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Banner hướng dẫn Admin Demo */}
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <div className="space-y-1.5">
          <div className="text-xs font-semibold tracking-wider text-indigo-300 uppercase">Dành cho trải nghiệm & kiểm thử</div>
          <h2 className="text-xl font-bold">Xem bảng điều khiển Quản trị viên (Admin)</h2>
          <p className="text-sm text-slate-300">
            Đăng nhập bằng tài khoản demo <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-indigo-200">admin@demo.com</code> /{" "}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-indigo-200">admin123</code> để xem lịch tuần, doanh thu và quản lý ca làm.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
        >
          <span>Mở trang Quản trị</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
