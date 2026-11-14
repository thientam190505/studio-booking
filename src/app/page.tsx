import Link from "next/link";
import { ArrowRight, CalendarCheck2, Clock, CreditCard, Scissors, Search, Sparkles, UserCheck } from "lucide-react";
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
    { icon: Clock, title: "Đặt lịch trong 1 phút", desc: "Chọn dịch vụ & thợ quen chỉ với vài chạm" },
    { icon: CalendarCheck2, title: "Đúng giờ, không phải đợi", desc: "Khung giờ được giữ riêng cho bạn ngay khi đặt" },
    { icon: Scissors, title: "Stylist tận tâm", desc: "Tư vấn kiểu tóc & chăm sóc hợp khuôn mặt" },
    { icon: CreditCard, title: "Giữ lịch linh hoạt", desc: "Giữ chỗ 10 phút, xác nhận cọc 20% nhanh chóng" },
  ];

  return (
    <main className="mx-auto max-w-6xl space-y-14 px-4 py-8 sm:px-6 sm:py-12">
      {/* Hero Warm Salon */}
      <section className="reveal-up relative overflow-hidden rounded-3xl border border-stone-200/90 bg-gradient-to-br from-[#f5efe6] via-[#faf7f2] to-[#efe5d5] p-7 text-stone-900 shadow-sm sm:p-12">
        <div
          className="float-glow pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-300/25 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-white/80 px-4 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
            <span>Tiệm tóc & Chăm sóc da đầu · Mở cửa 09:00 – 18:00</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-5xl sm:leading-tight">
            Thư giãn & làm mới mái tóc của bạn,{" "}
            <span className="text-amber-800">đặt lịch trước không cần chờ đợi</span>
          </h1>
          <p className="text-base leading-relaxed text-stone-600 sm:text-lg">
            Chọn dịch vụ cắt tạo kiểu hoặc gội đầu dưỡng sinh cùng stylist yêu thích. Khung giờ còn trống cập nhật tức thì, dễ dàng đặt và tra cứu mọi lúc.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/book"
              className="btn-interactive group inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-900"
            >
              <span>Đặt lịch hẹn ngay</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link
              href="/lookup"
              className="btn-interactive inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-3.5 text-sm font-semibold text-stone-800 hover:border-stone-400 hover:bg-stone-50"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>Tra cứu lịch hẹn</span>
            </Link>
          </div>
        </div>

        <div className="relative mt-10 grid gap-3.5 border-t border-stone-200/80 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-2xl border border-stone-200/80 bg-white/80 p-4 backdrop-blur-xs transition duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-white"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100/80 text-amber-900">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-bold text-stone-900">{item.title}</div>
                  <div className="mt-0.5 text-xs text-stone-600">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Menu dịch vụ */}
      <section className="reveal-up delay-1 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">Menu dịch vụ</h2>
            <p className="mt-1 text-sm text-stone-600">Có thể kết hợp nhiều dịch vụ trong một lần hẹn, tổng thời lượng được tính sẵn giúp bạn.</p>
          </div>
          <Link
            href="/book"
            className="btn-interactive group inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:border-stone-900 hover:bg-stone-900 hover:text-white"
          >
            <span>Xem & đặt dịch vụ</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const paused = Boolean(s.unavailableReason);
            return (
              <div
                key={s.id}
                className={`card-interactive group flex flex-col justify-between rounded-2xl border p-5 shadow-xs ${
                  paused
                    ? "border-amber-300 bg-amber-50/40"
                    : "border-stone-200/90 bg-white hover:border-amber-700/50"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">
                      {s.category}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700">
                      <Clock className="h-3 w-3 text-stone-500" aria-hidden="true" />
                      {s.durationMinutes} phút
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900 transition-colors group-hover:text-amber-900">{s.name}</h3>
                  <p className="text-sm text-stone-600">{s.description || "Dịch vụ chăm sóc chuyên nghiệp theo lịch hẹn."}</p>
                </div>
                <div className="mt-5 flex items-center justify-between gap-2 border-t border-stone-100 pt-4">
                  <span className="text-lg font-bold text-stone-900">{formatVND(s.price)}</span>
                  {paused ? (
                    <span className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                      Tạm ngưng: {s.unavailableReason}
                    </span>
                  ) : (
                    <Link
                      href="/book"
                      className="btn-interactive inline-flex items-center gap-1 rounded-full bg-stone-100 px-3.5 py-1.5 text-xs font-semibold text-stone-900 transition-colors hover:bg-stone-900 hover:text-white"
                    >
                      <span>Đặt món này</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Đội ngũ Stylist */}
      <section className="reveal-up delay-2 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">Đội ngũ Stylist</h2>
          <p className="mt-1 text-sm text-stone-600">Lịch rảnh được cập nhật riêng theo ca làm việc của từng thợ để bạn dễ chọn người quen.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {staff.map((st) => (
            <div
              key={st.id}
              className="card-interactive flex items-center gap-4 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs hover:border-amber-700/50"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-stone-900 text-lg font-bold text-amber-100 shadow-xs">
                {st.user.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-900">
                  <span className="truncate">{st.user.name}</span>
                  <UserCheck className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                </div>
                <div className="truncate text-sm font-medium text-amber-800">{st.specialty || "Stylist"}</div>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700">
                  <Clock className="h-3 w-3 text-stone-500" aria-hidden="true" />
                  Ca làm: {hhmm(st.workStart)} – {hhmm(st.workEnd)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Banner hướng dẫn Admin Demo */}
      <section className="reveal-up delay-3 flex flex-col justify-between gap-5 rounded-3xl border border-stone-800 bg-stone-900 p-6 text-stone-100 shadow-md sm:flex-row sm:items-center sm:p-8">
        <div className="space-y-1.5">
          <div className="text-xs font-bold tracking-wider text-amber-300 uppercase">Dành cho chủ tiệm & nhân viên</div>
          <h2 className="text-xl font-bold text-white">Xem sổ quản lý lịch hẹn & menu tiệm</h2>
          <p className="text-sm text-stone-300">
            Đăng nhập nhanh với tài khoản mẫu <code className="rounded bg-stone-800 px-1.5 py-0.5 font-mono text-amber-200">admin@demo.com</code> /{" "}
            <code className="rounded bg-stone-800 px-1.5 py-0.5 font-mono text-amber-200">admin123</code> để xem lịch tuần, chỉnh menu hoặc theo dõi lịch từng thợ.
          </p>
        </div>
        <Link
          href="/admin"
          className="btn-interactive group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-stone-900 hover:bg-amber-50"
        >
          <span>Mở trang Quản trị</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
