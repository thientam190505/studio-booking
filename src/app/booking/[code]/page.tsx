import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, CheckCircle2, Clock, Mail, Phone, QrCode, RefreshCw, User, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatVND } from "@/lib/format";
import PayButton from "./PayButton";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; badge: string }> = {
  PENDING: { label: "Chờ thanh toán cọc", badge: "border-amber-200 bg-amber-50 text-amber-800" },
  CONFIRMED: { label: "Đã xác nhận", badge: "border-blue-200 bg-blue-50 text-blue-800" },
  COMPLETED: { label: "Hoàn thành", badge: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  CANCELLED: { label: "Đã hủy", badge: "border-slate-200 bg-slate-100 text-slate-600" },
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
    ? { label: "Hết hạn giữ chỗ", badge: "border-red-200 bg-red-50 text-red-700" }
    : STATUS[b.status] ?? { label: b.status, badge: "border-slate-200 bg-slate-100 text-slate-700" };
  const remaining = Math.max(0, b.totalPrice - b.depositAmount);

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Header phiếu */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-5">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase">Phiếu đặt lịch hẹn</div>
            <h1 className="mt-0.5 font-mono text-2xl font-bold tracking-tight text-slate-900">#{b.code}</h1>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${statusInfo.badge}`}>
            {b.status === "CONFIRMED" || b.status === "COMPLETED" ? (
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            ) : expired || b.status === "CANCELLED" ? (
              <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{statusInfo.label}</span>
          </span>
        </div>

        <div className="space-y-6 p-6">
          {/* Thông tin lịch & khách */}
          <div className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-sm sm:grid-cols-2">
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
                <div>
                  <div className="text-xs text-slate-500">Thời gian hẹn</div>
                  <div className="font-semibold text-slate-900">{formatDateTime(b.startTime)}</div>
                  <div className="text-xs text-slate-500">
                    {fmtTime(b.startTime)} – {fmtTime(b.endTime)} (UTC+7)
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
                <div>
                  <div className="text-xs text-slate-500">Chuyên viên</div>
                  <div className="font-semibold text-slate-900">{b.staff.user.name}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                <div>
                  <div className="text-xs text-slate-500">Khách hàng</div>
                  <div className="font-semibold text-slate-900">{b.customerName}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Phone className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                <span>{b.customerPhone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Mail className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                <span className="truncate">{b.customerEmail}</span>
              </div>
            </div>
          </div>

          {/* Danh sách dịch vụ */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">Chi tiết dịch vụ</h2>
            <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
              {b.items.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div>
                    <div className="font-medium text-slate-900">{i.service.name}</div>
                    <div className="text-xs text-slate-500">{i.duration} phút</div>
                  </div>
                  <span className="font-semibold text-slate-900">{formatVND(i.price)}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Tổng chi phí dịch vụ</span>
                <span className="font-semibold text-slate-900">{formatVND(b.totalPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tiền cọc giữ chỗ (20%)</span>
                <span className="font-bold text-indigo-600">{formatVND(b.depositAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-slate-700">
                <span>Thanh toán phần còn lại tại tiệm</span>
                <span className="font-semibold text-slate-900">{formatVND(remaining)}</span>
              </div>
            </div>
          </div>

          {/* Khu vực thanh toán hoặc trạng thái */}
          {b.status === "PENDING" && !expired && (
            <div className="space-y-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                  <QrCode className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-slate-900">Cổng thanh toán Sandbox (Mô phỏng)</div>
                  <div className="text-xs text-slate-600">
                    Slot được giữ đến {b.holdExpiresAt ? fmtTime(b.holdExpiresAt) : "10 phút"}. Bấm nút bên dưới để giả lập webhook thanh toán thành công.
                  </div>
                </div>
              </div>
              <PayButton code={b.code} depositAmount={b.depositAmount} />
            </div>
          )}

          {b.status === "CONFIRMED" && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              Lịch hẹn của bạn đã được xác nhận và khóa slot thành công. Hãy lưu lại mã <b>#{b.code}</b> để tra cứu khi cần.
            </div>
          )}

          {expired && (
            <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center">
              <span>Thời gian giữ chỗ 10 phút đã hết và khung giờ đã được mở lại cho khách khác.</span>
              <Link
                href="/book"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Đặt lịch mới</span>
              </Link>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm">
            <Link href="/lookup" className="font-medium text-slate-600 hover:text-indigo-600">
              ← Tra cứu lịch khác
            </Link>
            <Link href="/book" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Đặt thêm lịch mới →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
