"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Search } from "lucide-react";

export default function LookupPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, phone }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    router.push(`/booking/${data.code}`);
  }

  const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500";

  return (
    <main className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <search>
        <form
          onSubmit={submit}
          aria-labelledby="lookup-title"
          className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="space-y-1">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Search className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 id="lookup-title" className="pt-2 text-2xl font-bold tracking-tight text-slate-900">
              Tra cứu lịch hẹn
            </h1>
            <p className="text-sm text-slate-600">
              Nhập đồng thời mã đặt lịch và số điện thoại để xem chi tiết hoặc thanh toán cọc.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="lookup-code" className="block text-sm font-medium text-slate-700">
                Mã đặt lịch <span aria-hidden="true" className="text-red-600">*</span>
              </label>
              <span id="code-hint" className="block text-xs text-slate-500">
                Ví dụ: BK1A2B3C (không phân biệt chữ hoa/thường)
              </span>
              <input
                id="lookup-code"
                name="code"
                type="text"
                required
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                aria-describedby="code-hint"
                enterKeyHint="next"
                placeholder="BK1A2B3C"
                className={inputCls + " font-mono uppercase"}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lookup-phone" className="block text-sm font-medium text-slate-700">
                Số điện thoại đã đặt <span aria-hidden="true" className="text-red-600">*</span>
              </label>
              <span id="lookup-phone-hint" className="block text-xs text-slate-500">
                Nhập chính xác số điện thoại dùng khi tạo lịch
              </span>
              <input
                id="lookup-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                required
                autoComplete="tel"
                aria-describedby="lookup-phone-hint"
                enterKeyHint="search"
                placeholder="0912345678"
                className={inputCls}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div role="alert" aria-live="polite" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-50"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>{loading ? "Đang tìm kiếm..." : "Tra cứu lịch hẹn"}</span>
          </button>

          <p className="text-center text-xs text-slate-500">
            Chưa có lịch hẹn?{" "}
            <Link href="/book" className="font-semibold text-indigo-600 hover:underline">
              Đặt lịch ngay
            </Link>
          </p>
        </form>
      </search>
    </main>
  );
}
