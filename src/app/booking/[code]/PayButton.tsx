"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, CheckCircle2, CreditCard } from "lucide-react";
import { formatVND } from "@/lib/format";

export default function PayButton({ code, depositAmount }: { code: string; depositAmount: number }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    setMsg("");
    const res = await fetch(`/api/bookings/${code}/pay`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setMsg(data.error);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={pay}
        disabled={loading}
        className="btn-interactive inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CreditCard className="h-4 w-4" aria-hidden="true" />
        <span>{loading ? "Đang xác nhận thanh toán..." : `Thanh toán cọc ${formatVND(depositAmount)} (thử nghiệm)`}</span>
      </button>
      <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-stone-600">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
        <span>Xác nhận giữ lịch ngay & gửi thông tin về email của bạn</span>
      </p>
      {msg && (
        <div role="alert" className="drawer-enter flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{msg}</span>
        </div>
      )}
    </div>
  );
}
