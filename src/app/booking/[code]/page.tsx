import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, CheckCircle2, Clock, Mail, Phone, QrCode, RefreshCw, User, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatVND } from "@/lib/format";
import PayButton from "./PayButton";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; badge: string }> = {
  PENDING: { label: "Chờ thanh toán cọc", badge: "border-amber-700/40 bg-amber-100 text-amber-950" },
  CONFIRMED: { label: "Đã xác nhận", badge: "border-blue-700/40 bg-blue-100 text-blue-950" },
  COMPLETED: { label: "Hoàn thành", badge: "border-emerald-700/40 bg-emerald-100 text-emerald-950" },
  CANCELLED: { label: "Đã hủy", badge: "border-stone-500/40 bg-stone-200 text-stone-900" },
};

const fmtTime = (d: Date) =>
  new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }).format(d);

export default async function BookingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const b = await prisma.booking.findUnique({
    where: { code },
    include: { staff: { include: { user: true } }, items: { include: { service: true } } },
  });
  if (!b) notFound();

  const expired = b.status === "PENDING" && (!b.holdExpiresAt || b.holdExpiresAt < new Date());
  const statusInfo = expired
    ? { label: "Hết hạn giữ chỗ", badge: "border-red-700/40 bg-red-100 text-red-900" }
    : STATUS[b.status] ?? { label: b.status, badge: "border-stone-400 bg-stone-100 text-stone-900" };
  const remaining = Math.max(0, b.totalPrice - b.depositAmount);

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6">
      <div className="reveal-up overflow-hidden rounded-3xl border-2 border-stone-300 bg-white shadow-sm">
        {/* Header phiếu */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-stone-300 bg-[#e9dfd0] px-6 py-5 text-stone-950">
          <div>
            <div className="text-xs font-extrabold tracking-wider text-stone-700 uppercase">Phiếu đặt lịch hẹn</div>
            <h1 className="mt-0.5 font-mono text-3xl font-extrabold tracking-tight text-stone-950">#{b.code}</h1>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-xs font-extrabold shadow-2xs ${statusInfo.badge}`}
          >
            {b.status === "CONFIRMED" || b.status === "COMPLETED" ? (
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            ) : expired || b.status === "CANCELLED" ? (
              <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Clock className="h-3.5 w-3.5 motion-safe:animate-pulse" aria-hidden="true" />
            )}
            <span>{statusInfo.label}</span>
          </span>
        </div>

        <div className="space-y-6 p-6">
          {/* Thông tin lịch & khách */}
          <div className="grid gap-4 rounded-2xl border-2 border-stone-300 bg-[#faf6ef] p-4 text-sm sm:grid-cols-2">
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" aria-hidden="true" />
                <div>
                  <div className="text-xs font-bold text-stone-700">Thời gian hẹn</div>
                  <div className="font-extrabold text-stone-950">{formatDateTime(b.startTime)}</div>
                  <div className="text-xs font-bold text-amber-900">
                    {fmtTime(b.startTime)} – {fmtTime(b.endTime)} (UTC+7)
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" aria-hidden="true" />
                <div>
                  <div className="text-xs font-bold text-stone-700">Stylist thực hiện</div>
                  <div className="font-extrabold text-stone-950">{b.staff.user.name}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-stone-700" aria-hidden="true" />
                <div>
                  <div className="text-xs font-bold text-stone-700">Khách hàng</div>
                  <div className="font-extrabold text-stone-950">{b.customerName}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-stone-900">
                <Phone className="h-4 w-4 shrink-0 text-stone-700" aria-hidden="true" />
                <span className="font-bold">{b.customerPhone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-stone-900">
                <Mail className="h-4 w-4 shrink-0 text-stone-700" aria-hidden="true" />
                <span className="truncate font-bold">{b.customerEmail}</span>
              </div>
            </div>
          </div>

          {/* Danh sách dịch vụ */}
          <div className="space-y-3">
            <h2 className="text-sm font-extrabold text-stone-950">Chi tiết dịch vụ</h2>
            <ul className="divide-y divide-stone-200 rounded-2xl border-2 border-stone-300 bg-white">
              {b.items.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-[#faf6ef]">
                  <div>
                    <div className="font-bold text-stone-950">{i.service.name}</div>
                    <div className="text-xs font-semibold text-stone-700">{i.duration} phút</div>
                  </div>
                  <span className="font-extrabold text-stone-950">{formatVND(i.price)}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-2 rounded-2xl border-2 border-amber-800/35 bg-[#fdf6eb] p-4 text-sm text-stone-950">
              <div className="flex justify-between font-semibold text-stone-800">
                <span>Tổng chi phí dịch vụ</span>
                <span className="font-extrabold text-stone-950">{formatVND(b.totalPrice)}</span>
              </div>
              <div className="flex justify-between font-bold text-stone-900">
                <span>Tiền cọc giữ chỗ (20%)</span>
                <span className="font-extrabold text-amber-900">{formatVND(b.depositAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-amber-800/20 pt-2 font-bold text-stone-950">
                <span>Thanh toán phần còn lại tại tiệm</span>
                <span className="font-extrabold text-stone-950">{formatVND(remaining)}</span>
              </div>
            </div>
          </div>

          {/* Khu vực thanh toán hoặc trạng thái */}
          {b.status === "PENDING" && !expired && (
            <div className="drawer-enter space-y-4 rounded-2xl border-2 border-amber-500 bg-amber-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-900 text-amber-200 shadow-2xs">
                  <QrCode className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="text-sm">
                  <div className="font-extrabold text-stone-950">Xác nhận đặt cọc giữ lịch (Thử nghiệm)</div>
                  <div className="text-xs font-semibold text-stone-800">
                    Khung giờ được giữ đến {b.holdExpiresAt ? fmtTime(b.holdExpiresAt) : "10 phút"}. Bấm nút bên dưới để hoàn tất xác nhận lịch hẹn.
                  </div>
                </div>
              </div>
              <PayButton code={b.code} depositAmount={b.depositAmount} mode="pending" />
            </div>
          )}

          {b.status === "CONFIRMED" && (
            <div className="drawer-enter space-y-4">
              <div className="rounded-2xl border-2 border-emerald-600/50 bg-emerald-50 p-4 text-sm font-bold text-emerald-950">
                Lịch hẹn của bạn đã được xác nhận thành công. Hãy lưu lại mã <b>#{b.code}</b> để tra cứu hoặc đổi lịch khi cần.
              </div>
              <PayButton code={b.code} depositAmount={b.depositAmount} mode="confirmed" />
            </div>
          )}

          {b.status === "CANCELLED" && (
            <div className="drawer-enter flex flex-col items-start justify-between gap-3 rounded-2xl border-2 border-stone-400 bg-stone-100 p-4 text-sm font-bold text-stone-900 sm:flex-row sm:items-center">
              <span>Lịch hẹn này đã được hủy và khung giờ đã mở lại cho khách khác.</span>
              <Link
                href="/book"
                className="btn-interactive inline-flex shrink-0 items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-amber-800"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Đặt lịch mới</span>
              </Link>
            </div>
          )}

          {expired && (
            <div className="drawer-enter flex flex-col items-start justify-between gap-3 rounded-2xl border-2 border-red-400 bg-red-50 p-4 text-sm font-bold text-red-900 sm:flex-row sm:items-center">
              <span>Thời gian giữ chỗ 10 phút đã hết và khung giờ đã được mở lại cho khách khác.</span>
              <Link
                href="/book"
                className="btn-interactive inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-700 px-4 py-2 text-xs font-bold text-white hover:bg-red-800"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Đặt lịch mới</span>
              </Link>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-stone-200 pt-4 text-sm">
            <Link href="/lookup" className="font-bold text-stone-800 transition-colors hover:text-amber-900">
              ← Tra cứu lịch khác
            </Link>
            <Link href="/book" className="font-extrabold text-amber-900 transition-colors hover:text-stone-950">
              Đặt thêm lịch mới →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
