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
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CreditCard className="h-4 w-4" aria-hidden="true" />
        <span>{loading ? "Đang xác nhận thanh toán..." : `Thanh toán cọc ${formatVND(depositAmount)} (mô phỏng)`}</span>
      </button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
        <span>Mô phỏng Webhook xác nhận giao dịch ngay lập tức & gửi email</span>
      </p>
      {msg && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{msg}</span>
        </div>
      )}
    </div>
  );
}
