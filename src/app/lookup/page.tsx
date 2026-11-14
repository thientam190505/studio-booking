"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, ArrowRight, CalendarClock, Scissors, Search, User } from "lucide-react";
import { formatDateTime, formatVND } from "@/lib/format";

type LookupResult = {
  code: string;
  status: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  depositAmount: number;
  customerName: string;
  customerPhone: string;
  staffName: string;
  services: string[];
};

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Chờ thanh toán cọc", cls: "border-amber-700/40 bg-amber-100 text-amber-950" },
  CONFIRMED: { label: "Đã xác nhận", cls: "border-blue-700/40 bg-blue-100 text-blue-950" },
  COMPLETED: { label: "Hoàn thành", cls: "border-emerald-700/40 bg-emerald-100 text-emerald-950" },
  CANCELLED: { label: "Đã hủy", cls: "border-stone-500/40 bg-stone-200 text-stone-900" },
};

export default function LookupPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState<LookupResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResults([]);
    setLoading(true);
    const res = await fetch("/api/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, phone }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);

    const list: LookupResult[] = data.bookings ?? [];
    // Nếu nhập mã cụ thể và ra 1 kết quả thì mở thẳng phiếu hẹn
    if (code.trim() && list.length === 1) {
      router.push(`/booking/${list[0].code}`);
      return;
    }
    setResults(list);
  }

  const inputCls =
    "w-full rounded-xl border-2 border-stone-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-stone-950 placeholder:font-normal placeholder:text-stone-500 transition focus:border-amber-800";

  return (
    <main className="mx-auto max-w-xl space-y-6 px-4 py-12 sm:px-6">
      <search>
        <form
          onSubmit={submit}
          aria-labelledby="lookup-title"
          className="reveal-up overflow-hidden rounded-3xl border-2 border-stone-300 bg-white shadow-sm"
        >
          <div className="border-b-2 border-stone-300 bg-[#e9dfd0] p-6 text-stone-950 sm:px-8">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-amber-200">
              <Search className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 id="lookup-title" className="pt-3 text-2xl font-extrabold tracking-tight text-stone-950">
              Tra cứu lịch hẹn
            </h1>
            <p className="mt-1 text-sm font-medium text-stone-800">
              Nhập <b className="text-stone-950">Mã đặt lịch</b> hoặc <b className="text-stone-950">Số điện thoại</b> (một trong hai, hoặc cả hai) để xem chi tiết, thanh toán cọc hoặc hủy lịch.
            </p>
          </div>

          <div className="space-y-5 p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="lookup-code" className="block text-sm font-bold text-stone-900">
                  Mã đặt lịch
                </label>
                <span id="code-hint" className="block text-xs font-medium text-stone-700">
                  Ví dụ: BK1A2B3C (để trống nếu quên mã)
                </span>
                <input
                  id="lookup-code"
                  name="code"
                  type="text"
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
                <label htmlFor="lookup-phone" className="block text-sm font-bold text-stone-900">
                  Số điện thoại đã đặt
                </label>
                <span id="lookup-phone-hint" className="block text-xs font-medium text-stone-700">
                  Tìm tất cả lịch hẹn theo SĐT
                </span>
                <input
                  id="lookup-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
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
              <div role="alert" aria-live="polite" className="drawer-enter flex items-center gap-2 rounded-xl border-2 border-red-400 bg-red-50 p-3 text-sm font-semibold text-red-800">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-interactive inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-amber-800 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-amber-900 disabled:opacity-50"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>{loading ? "Đang tìm kiếm..." : "Tra cứu lịch hẹn"}</span>
            </button>

            <p className="text-center text-xs font-medium text-stone-700">
              Chưa có lịch hẹn?{" "}
              <Link href="/book" className="font-bold text-amber-900 underline decoration-amber-800/50 hover:text-stone-950">
                Đặt lịch ngay
              </Link>
            </p>
          </div>
        </form>
      </search>

      {results.length > 0 && (
        <section aria-label="Kết quả tra cứu lịch hẹn" className="drawer-enter space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-extrabold text-stone-950">Tìm thấy {results.length} lịch hẹn</h2>
            <span className="text-xs font-semibold text-stone-700">Nhấn vào phiếu để thanh toán hoặc hủy</span>
          </div>
          <ul className="space-y-3">
            {results.map((b) => {
              const st = STATUS_BADGE[b.status] ?? {
                label: b.status,
                cls: "border-stone-400 bg-stone-100 text-stone-900",
              };
              return (
                <li key={b.code}>
                  <Link
                    href={`/booking/${b.code}`}
                    className="card-interactive block rounded-2xl border-2 border-stone-300 bg-white p-5 shadow-xs hover:border-stone-900"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
                      <span className="font-mono text-lg font-extrabold text-stone-950">#{b.code}</span>
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold ${st.cls}`}>{st.label}</span>
                    </div>
                    <div className="mt-3 space-y-1.5 text-sm">
                      <div className="flex items-center gap-2 font-bold text-stone-900">
                        <CalendarClock className="h-4 w-4 shrink-0 text-amber-800" aria-hidden="true" />
                        <span>{formatDateTime(b.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 font-semibold text-stone-800">
                        <User className="h-4 w-4 shrink-0 text-amber-800" aria-hidden="true" />
                        <span>Stylist: {b.staffName} · Khách: {b.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2 font-medium text-stone-700">
                        <Scissors className="h-4 w-4 shrink-0 text-stone-600" aria-hidden="true" />
                        <span>{b.services.join(", ")}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-3 text-sm">
                      <span className="font-bold text-stone-950">Tổng: {formatVND(b.totalPrice)}</span>
                      <span className="inline-flex items-center gap-1 font-bold text-amber-900">
                        <span>Xem phiếu chi tiết</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
