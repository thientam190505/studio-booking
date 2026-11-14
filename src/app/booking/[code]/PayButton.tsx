"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, CheckCircle2, CreditCard, XCircle } from "lucide-react";
import { formatVND } from "@/lib/format";

export default function PayButton({
  code,
  depositAmount,
  mode = "pending",
}: {
  code: string;
  depositAmount: number;
  mode?: "pending" | "confirmed";
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState<"pay" | "cancel" | null>(null);

  async function pay() {
    setLoading("pay");
    setMsg("");
    const res = await fetch(`/api/bookings/${code}/pay`, { method: "POST" });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) return setMsg(data.error);
    router.refresh();
  }

  async function cancelBooking() {
    setLoading("cancel");
    setMsg("");
    const res = await fetch(`/api/bookings/${code}/cancel`, { method: "POST" });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) return setMsg(data.error);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {mode === "pending" && (
        <>
          <button
            type="button"
            onClick={pay}
            disabled={loading !== null}
            className="btn-interactive inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CreditCard className="h-4 w-4" aria-hidden="true" />
            <span>{loading === "pay" ? "Đang xác nhận thanh toán..." : `Thanh toán cọc ${formatVND(depositAmount)} (thử nghiệm)`}</span>
          </button>
          <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-stone-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
            <span>Xác nhận giữ lịch ngay & gửi thông tin về email của bạn</span>
          </p>
        </>
      )}

      <button
        type="button"
        onClick={cancelBooking}
        disabled={loading !== null}
        className="btn-interactive inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full border-2 border-red-300 bg-white px-4 py-2 text-xs font-bold text-red-700 hover:border-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
        <span>
          {loading === "cancel"
            ? "Đang hủy lịch..."
            : mode === "pending"
              ? "Hủy giữ chỗ & chọn lại lịch khác"
              : "Hủy lịch hẹn này"}
        </span>
      </button>

      {msg && (
        <div role="alert" className="drawer-enter flex items-center gap-2 rounded-xl border-2 border-red-400 bg-red-50 p-3 text-sm font-semibold text-red-800">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{msg}</span>
        </div>
      )}
    </div>
  );
}
