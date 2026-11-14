"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PayButton({ code }: { code: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    const res = await fetch(`/api/bookings/${code}/pay`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setMsg(data.error);
    router.refresh();
  }

  return (
    <div>
      <button onClick={pay} disabled={loading} className="rounded-lg bg-emerald-600 px-5 py-2 font-medium text-white disabled:opacity-50">
        {loading ? "Đang xử lý..." : "Thanh toán cọc (mô phỏng)"}
      </button>
      {msg && <p className="mt-2 text-sm text-red-600">{msg}</p>}
    </div>
  );
}
