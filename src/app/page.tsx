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
    <main className="mx-auto max-w-6xl space-y-14 px-4 py-8 sm:px-6 sm:py-12">
      {/* Hero High-Contrast Dark Luxury */}
      <section className="reveal-up relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-7 text-white shadow-2xl shadow-slate-950/25 sm:p-12">
        <div
          className="float-glow pointer-events-none absolute -top-28 -right-24 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-4 py-1.5 text-xs font-semibold text-indigo-200 backdrop-blur-sm">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <Sparkles className="h-3.5 w-3.5 text-indigo-300" aria-hidden="true" />
            <span>Đặt lịch thông minh · Khung giờ trống Real-time</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl sm:leading-tight">
            Đặt lịch hẹn dịch vụ{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-violet-200 to-emerald-300 bg-clip-text text-transparent">
              nhanh gọn, không lo trùng giờ
            </span>
          </h1>
          <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
            Chọn dịch vụ, chuyên viên yêu thích và khung giờ còn trống theo thời gian thực. Giữ chỗ tự động trong 10 phút, xác nhận tức thì và tra cứu mọi lúc.
          </p>
          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <Link
              href="/book"
              className="btn-interactive group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-400 hover:to-violet-400"
            >
              <span>Đặt lịch hẹn ngay</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link
              href="/lookup"
              className="btn-interactive inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:border-white/40 hover:bg-white/20"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>Tra cứu lịch hẹn</span>
            </Link>
          </div>
        </div>

        <div className="relative mt-10 grid gap-3.5 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-white/15"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/30 text-indigo-200 ring-1 ring-indigo-300/30">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{item.title}</div>
                  <div className="mt-0.5 text-xs text-slate-300">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dịch vụ nổi bật */}
      <section className="reveal-up delay-1 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Bảng dịch vụ</h2>
            <p className="mt-1 text-sm text-slate-600">Có thể kết hợp nhiều dịch vụ trong một lần đặt, hệ thống tự động cộng thời lượng.</p>
          </div>
          <Link
            href="/book"
            className="btn-interactive group inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-600 hover:text-white"
          >
            <span>Chọn dịch vụ & đặt lịch</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const paused = Boolean(s.unavailableReason);
            return (
              <div
                key={s.id}
                className={`card-interactive group flex flex-col justify-between rounded-2xl border border-t-4 bg-white p-5 shadow-md shadow-slate-900/5 ${
                  paused
                    ? "border-amber-300 border-t-amber-500 bg-amber-50/35"
                    : "border-slate-300/90 border-t-indigo-600 hover:border-indigo-500"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-800">
                      {s.category}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-white">
                      <Clock className="h-3 w-3 text-indigo-300" aria-hidden="true" />
                      {s.durationMinutes} phút
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-indigo-700">{s.name}</h3>
                  <p className="text-sm text-slate-600">{s.description || "Dịch vụ chăm sóc chuyên nghiệp theo lịch hẹn."}</p>
                </div>
                <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-200/80 pt-4">
                  <span className="rounded-xl bg-slate-900 px-3 py-1.5 text-sm font-bold text-white shadow-xs">
                    {formatVND(s.price)}
                  </span>
                  {paused ? (
                    <span className="rounded-lg border border-amber-300 bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                      Tạm ngưng: {s.unavailableReason}
                    </span>
                  ) : (
                    <Link
                      href="/book"
                      className="btn-interactive inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                    >
                      <span>Đặt lịch</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Đội ngũ chuyên viên */}
      <section className="reveal-up delay-2 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Đội ngũ chuyên viên</h2>
          <p className="mt-1 text-sm text-slate-600">Lịch rảnh được tính riêng theo ca làm việc và ngày nghỉ của từng người.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {staff.map((st) => (
            <div
              key={st.id}
              className="card-interactive flex items-center gap-4 rounded-2xl border border-slate-300/90 bg-white p-5 shadow-md shadow-slate-900/5 hover:border-indigo-500"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-900 to-indigo-600 text-lg font-bold text-white shadow-md shadow-indigo-500/25">
                {st.user.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <span className="truncate">{st.user.name}</span>
                  <UserCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                </div>
                <div className="truncate text-sm font-medium text-indigo-700">{st.specialty || "Chuyên viên"}</div>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  <Clock className="h-3 w-3 text-slate-500" aria-hidden="true" />
                  Ca làm: {hhmm(st.workStart)} – {hhmm(st.workEnd)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Banner hướng dẫn Admin Demo */}
      <section className="reveal-up delay-3 flex flex-col justify-between gap-5 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:p-8">
        <div className="space-y-1.5">
          <div className="text-xs font-bold tracking-wider text-indigo-300 uppercase">Dành cho trải nghiệm & kiểm thử</div>
          <h2 className="text-xl font-bold">Xem bảng điều khiển Quản trị viên (Admin)</h2>
          <p className="text-sm text-slate-300">
            Đăng nhập bằng tài khoản demo <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-indigo-200 ring-1 ring-slate-700">admin@demo.com</code> /{" "}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-indigo-200 ring-1 ring-slate-700">admin123</code> để xem lịch tuần, doanh thu và quản lý ca làm.
          </p>
        </div>
        <Link
          href="/admin"
          className="btn-interactive group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-md hover:bg-indigo-50"
        >
          <span>Mở trang Quản trị</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
