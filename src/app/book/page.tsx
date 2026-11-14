"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatVND } from "@/lib/format";

type Service = { id: string; name: string; description: string; price: number; durationMinutes: number };
type Staff = { id: string; name: string; specialty: string };
type Slot = { time: string; start: string; available: boolean };

const today = () => new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);

export default function BookPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [staffId, setStaffId] = useState("");
  // Khởi tạo rỗng rồi set ở client, tránh ngày bị "đóng băng" lúc build/prerender
  const [date, setDate] = useState("");
  const [minDate, setMinDate] = useState("");
  useEffect(() => {
    setMinDate(today());
    setDate(today());
  }, []);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [form, setForm] = useState({ customerName: "", customerPhone: "", customerEmail: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((d) => {
        setServices(d.services);
        setStaff(d.staff);
      });
  }, []);

  const chosen = useMemo(() => services.filter((s) => selected.includes(s.id)), [services, selected]);
  const total = chosen.reduce((s, x) => s + x.price, 0);
  const duration = chosen.reduce((s, x) => s + x.durationMinutes, 0);

  useEffect(() => {
    setSlot(null);
    if (!staffId || !selected.length || !date) return setSlots([]);
    const q = new URLSearchParams({ staffId, date, serviceIds: selected.join(",") });
    fetch(`/api/slots?${q}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []));
  }, [staffId, date, selected]);

  const toggle = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slot) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceIds: selected, staffId, start: slot.start, ...form }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      // Chỉ khi trùng giờ (409) mới bỏ chọn slot và tải lại danh sách;
      // lỗi nhập liệu (400) giữ nguyên slot để user sửa rồi bấm đặt lại.
      if (res.status === 409) {
        setSlot(null);
        const q = new URLSearchParams({ staffId, date, serviceIds: selected.join(",") });
        fetch(`/api/slots?${q}`).then((r) => r.json()).then((d) => setSlots(d.slots ?? []));
      }
      return;
    }
    router.push(`/booking/${data.code}`);
  }

  const card = "rounded-xl border border-zinc-200 bg-white p-5 shadow-sm";
  const input = "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500";

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold">Đặt lịch hẹn</h1>

      <section className={card}>
        <h2 className="mb-3 font-semibold">1. Chọn dịch vụ</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              className={`rounded-lg border p-3 text-left transition ${
                selected.includes(s.id) ? "border-indigo-600 bg-indigo-50" : "border-zinc-200 hover:border-zinc-400"
              }`}
            >
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-zinc-500">{s.description}</div>
              <div className="mt-1 text-sm">
                {formatVND(s.price)} · {s.durationMinutes} phút
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-3 font-semibold">2. Chọn nhân viên & ngày</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <select className={input} value={staffId} onChange={(e) => setStaffId(e.target.value)}>
            <option value="">-- Chọn nhân viên --</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.specialty})
              </option>
            ))}
          </select>
          <input type="date" className={input} min={minDate || undefined} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-3 font-semibold">3. Chọn giờ {duration ? `(${duration} phút)` : ""}</h2>
        {!staffId || !selected.length ? (
          <p className="text-sm text-zinc-500">Hãy chọn dịch vụ và nhân viên trước.</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-zinc-500">Nhân viên không làm việc vào ngày này.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {slots.map((s) => (
              <button
                key={s.start}
                type="button"
                disabled={!s.available}
                onClick={() => setSlot(s)}
                className={`rounded-lg border py-2 text-sm transition ${
                  slot?.start === s.start
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : s.available
                      ? "border-zinc-300 hover:border-indigo-500"
                      : "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400 line-through"
                }`}
              >
                {s.time}
              </button>
            ))}
          </div>
        )}
      </section>

      <form onSubmit={submit} className={card + " space-y-3"}>
        <h2 className="font-semibold">4. Thông tin liên hệ</h2>
        <input required className={input} placeholder="Họ tên" value={form.customerName}
          onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
        <input required className={input} placeholder="Số điện thoại" value={form.customerPhone}
          onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
        <input required type="email" className={input} placeholder="Email" value={form.customerEmail}
          onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} />
        <div className="flex items-center justify-between border-t pt-3 text-sm">
          <span>
            Tổng: <b>{formatVND(total)}</b> · Cọc 20%: <b>{formatVND(Math.round(total * 0.2))}</b>
          </span>
          <button
            disabled={!slot || loading}
            className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white disabled:opacity-40"
          >
            {loading ? "Đang xử lý..." : "Đặt lịch"}
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}
