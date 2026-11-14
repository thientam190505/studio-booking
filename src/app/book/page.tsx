"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Calendar, Check, Clock, Sparkles, User } from "lucide-react";
import { formatVND } from "@/lib/format";

type Service = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  durationMinutes: number;
  unavailableReason: string;
};
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- cần giờ client, không thể tính lúc prerender
    setMinDate(today());
    setDate(today());
  }, []);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotStart, setSlotStart] = useState("");
  const [form, setForm] = useState({ customerName: "", customerPhone: "", customerEmail: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((d) => {
        setServices(d.services ?? []);
        setStaff(d.staff ?? []);
      });
  }, []);

  const chosen = useMemo(() => services.filter((s) => selected.includes(s.id)), [services, selected]);
  const total = chosen.reduce((s, x) => s + x.price, 0);
  const duration = chosen.reduce((s, x) => s + x.durationMinutes, 0);
  const deposit = Math.round(total * 0.2);
  const chosenStaff = useMemo(() => staff.find((s) => s.id === staffId) ?? null, [staff, staffId]);

  const ready = Boolean(staffId && selected.length && date);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!ready) return;
    const q = new URLSearchParams({ staffId, date, serviceIds: selected.join(",") });
    fetch(`/api/slots?${q}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []));
  }, [ready, staffId, date, selected, reloadKey]);

  // Slot đang chọn chỉ hợp lệ khi vẫn còn trống trong danh sách mới nhất
  const visibleSlots = ready ? slots : [];
  const slot = visibleSlots.find((s) => s.start === slotStart && s.available) ?? null;

  const toggle = (id: string) => {
    const svc = services.find((s) => s.id === id);
    if (svc?.unavailableReason) return;
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

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
        setSlotStart("");
        setReloadKey((k) => k + 1);
      }
      return;
    }
    router.push(`/booking/${data.code}`);
  }

  const steps = [
    { num: 1, label: "Dịch vụ", done: selected.length > 0 },
    { num: 2, label: "Chuyên viên & Ngày", done: Boolean(staffId && date) },
    { num: 3, label: "Khung giờ", done: Boolean(slot) },
    { num: 4, label: "Liên hệ", done: Boolean(form.customerName && form.customerPhone && form.customerEmail) },
  ];

  const doneSteps = steps.filter((s) => s.done).length;
  const card = "reveal-up rounded-2xl border-2 border-slate-200/90 bg-white p-5 sm:p-6 shadow-md shadow-slate-900/5";
  const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500";

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="reveal-up space-y-4 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-5 text-white shadow-xl sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-bold tracking-wider text-indigo-300 uppercase">Đặt lịch trực tuyến</div>
            <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Đặt lịch hẹn</h1>
            <p className="mt-1 text-sm text-slate-300">Hoàn thành 4 bước bên dưới để giữ chỗ ngay lập tức.</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-indigo-100 backdrop-blur-sm">
            Tiến độ: <span className="text-emerald-400">{doneSteps}/4</span> bước
          </div>
        </div>

        {/* Thanh tiến độ mượt mà */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800" aria-hidden="true">
          <div
            className="h-full w-full origin-left rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 transition-transform duration-300 ease-out"
            style={{ transform: `scaleX(${doneSteps / 4})` }}
          />
        </div>

        {/* Stepper */}
        <nav aria-label="Tiến trình đặt lịch" className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {steps.map((st) => (
            <div
              key={st.num}
              className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                st.done
                  ? "border-emerald-500 bg-emerald-600 text-white shadow-md shadow-emerald-950/30"
                  : "border-slate-300 bg-white text-slate-800 shadow-xs"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-transform duration-200 ${
                  st.done ? "scale-105 bg-white text-emerald-700" : "bg-slate-900 text-white"
                }`}
              >
                {st.done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : st.num}
              </span>
              <span className="truncate">{st.label}</span>
            </div>
          ))}
        </nav>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Bước 1: Dịch vụ */}
          <section className={card}>
            <fieldset>
              <legend className="mb-1 flex items-center gap-2.5 text-base font-bold text-slate-900">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs transition-colors ${
                    selected.length > 0 ? "bg-emerald-600" : "bg-slate-900"
                  }`}
                >
                  1
                </span>
                <span>
                  Chọn dịch vụ {selected.length > 0 && <span className="text-xs font-semibold text-indigo-600">({selected.length} đã chọn)</span>}
                </span>
              </legend>
              <p className="mb-4 border-b border-slate-100 pb-3 text-xs text-slate-600">Bạn có thể chọn nhiều dịch vụ cùng lúc.</p>

              {services.length === 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="h-24 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-3.5 sm:grid-cols-2">
                  {services.map((s) => {
                    const checked = selected.includes(s.id);
                    const paused = Boolean(s.unavailableReason);
                    return (
                      <label
                        key={s.id}
                        className={`card-interactive relative flex flex-col justify-between rounded-xl border-2 p-4 focus-within:ring-2 focus-within:ring-indigo-500 ${
                          paused
                            ? "cursor-not-allowed border-amber-200 bg-amber-50/40 opacity-80"
                            : checked
                              ? "cursor-pointer border-indigo-600 bg-indigo-50/90 shadow-md ring-4 ring-indigo-600/15"
                              : "cursor-pointer border-slate-200 bg-white hover:border-indigo-400"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="services"
                          value={s.id}
                          disabled={paused}
                          checked={checked}
                          onChange={() => toggle(s.id)}
                          className="sr-only"
                        />
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                checked ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {s.category}
                            </span>
                            <div className="font-bold text-slate-900">{s.name}</div>
                            <div className="text-xs text-slate-600">{s.description}</div>
                          </div>
                          {!paused && (
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-white transition-all duration-150 ${
                                checked ? "scale-110 border-indigo-600 bg-indigo-600 shadow-xs" : "border-slate-300 bg-white"
                              }`}
                            >
                              {checked && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                            </span>
                          )}
                        </div>
                        {paused ? (
                          <div className="mt-3 flex items-center justify-between gap-2 border-t border-amber-200/70 pt-2.5 text-xs">
                            <span className="font-bold text-slate-500 line-through">{formatVND(s.price)}</span>
                            <span className="rounded-md bg-amber-100 px-2 py-0.5 font-semibold text-amber-900">
                              Tạm ngưng: {s.unavailableReason}
                            </span>
                          </div>
                        ) : (
                          <div className="mt-3 flex items-center justify-between border-t border-slate-200/70 pt-2.5 text-sm">
                            <span
                              className={`rounded-lg px-2 py-0.5 font-bold transition-colors ${
                                checked ? "bg-indigo-950 text-white" : "text-indigo-700"
                              }`}
                            >
                              {formatVND(s.price)}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
                              <Clock className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
                              {s.durationMinutes} phút
                            </span>
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </fieldset>
          </section>

          {/* Bước 2: Nhân viên & Ngày */}
          <section className={card + " delay-1 space-y-5"}>
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs transition-colors ${
                  staffId && date ? "bg-emerald-600" : "bg-slate-900"
                }`}
              >
                2
              </span>
              <span>Chọn chuyên viên & ngày hẹn</span>
            </div>

            <fieldset>
              <legend className="mb-2.5 text-sm font-semibold text-slate-800">Chuyên viên thực hiện</legend>
              <div className="grid gap-3.5 sm:grid-cols-3">
                {staff.map((st) => {
                  const active = staffId === st.id;
                  return (
                    <label
                      key={st.id}
                      className={`card-interactive flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3.5 focus-within:ring-2 focus-within:ring-indigo-500 ${
                        active
                          ? "border-indigo-600 bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                          : "border-slate-200 bg-white text-slate-900 hover:border-indigo-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="staffId"
                        value={st.id}
                        checked={active}
                        onChange={() => setStaffId(st.id)}
                        className="sr-only"
                      />
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-xs transition-colors ${
                          active ? "bg-indigo-500 text-white" : "bg-slate-900 text-white"
                        }`}
                      >
                        {st.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className={`block truncate text-sm font-bold ${active ? "text-white" : "text-slate-900"}`}>
                          {st.name}
                        </span>
                        <span className={`block truncate text-xs ${active ? "text-indigo-200" : "text-slate-600"}`}>
                          {st.specialty}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="max-w-md space-y-1.5">
              <label htmlFor="book-date" className="block text-sm font-semibold text-slate-800">
                Ngày hẹn
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  id="book-date"
                  name="date"
                  type="date"
                  className={inputCls + " max-w-[200px]"}
                  min={minDate || undefined}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                {minDate && (
                  <button
                    type="button"
                    onClick={() => {
                      const tmr = new Date(new Date(`${minDate}T12:00:00+07:00`).getTime() + 86400_000)
                        .toISOString()
                        .slice(0, 10);
                      setDate(tmr);
                    }}
                    className="btn-interactive rounded-xl border border-indigo-300 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-800 hover:bg-indigo-600 hover:text-white"
                  >
                    Chọn ngày mai (đầy đủ 09:00 – 17:30)
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-600">
                Lưu ý: Nếu chọn hôm nay, các khung giờ đã trôi qua theo đồng hồ thực tế sẽ tự động khóa.
              </p>
            </div>
          </section>

          {/* Bước 3: Khung giờ */}
          <section className={card + " delay-2 space-y-4"}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-base font-bold text-slate-900">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs transition-colors ${
                    slot ? "bg-emerald-600" : "bg-slate-900"
                  }`}
                >
                  3
                </span>
                <span>Chọn giờ {duration ? `(${duration} phút)` : ""}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full border-2 border-slate-400 bg-white" /> Trống
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-indigo-600" /> Đang chọn
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-slate-300" /> Đã kín
                </span>
              </div>
            </div>

            {!staffId || !selected.length ? (
              <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm font-medium text-slate-600">
                Hãy chọn ít nhất 1 dịch vụ và 1 chuyên viên ở bước trên để xem khung giờ trống.
              </div>
            ) : visibleSlots.length === 0 ? (
              <div className="drawer-enter rounded-xl border border-amber-300 bg-amber-50 p-5 text-center text-sm font-medium text-amber-900">
                Nhân viên không làm việc hoặc đã kín lịch vào ngày này. Vui lòng thử ngày khác.
              </div>
            ) : (
              <div className="drawer-enter grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                {visibleSlots.map((s) => {
                  const isSelected = slot?.start === s.start;
                  return (
                    <button
                      key={s.start}
                      type="button"
                      disabled={!s.available}
                      aria-pressed={isSelected}
                      onClick={() => setSlotStart(s.start)}
                      className={`slot-btn min-h-11 rounded-xl border-2 py-2.5 text-sm ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-600 font-bold text-white shadow-md shadow-indigo-500/30"
                          : s.available
                            ? "border-slate-300 bg-white font-semibold text-slate-900 hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                            : "cursor-not-allowed border-slate-200 bg-slate-100/90 text-slate-400 line-through opacity-75"
                      }`}
                    >
                      {s.time}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Bước 4: Thông tin liên hệ */}
          <form onSubmit={submit} aria-labelledby="contact-heading" className={card + " delay-3 space-y-4"}>
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs transition-colors ${
                  steps[3].done ? "bg-emerald-600" : "bg-slate-900"
                }`}
              >
                4
              </span>
              <h2 id="contact-heading" className="text-base font-bold text-slate-900">Thông tin liên hệ</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="customerName" className="block text-sm font-semibold text-slate-800">
                  Họ và tên <span aria-hidden="true" className="text-red-600">*</span>
                </label>
                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  required
                  autoComplete="name"
                  enterKeyHint="next"
                  placeholder="Ví dụ: Nguyễn Minh Tâm"
                  className={inputCls}
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="customerPhone" className="block text-sm font-semibold text-slate-800">
                  Số điện thoại <span aria-hidden="true" className="text-red-600">*</span>
                </label>
                <span id="phone-hint" className="block text-xs text-slate-500">
                  Định dạng: 10–11 số bắt đầu bằng 0 hoặc +84
                </span>
                <input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  inputMode="tel"
                  required
                  autoComplete="tel"
                  pattern="(0|\+84)[0-9]{9,10}"
                  aria-describedby="phone-hint"
                  enterKeyHint="next"
                  placeholder="0912345678"
                  className={inputCls}
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="customerEmail" className="block text-sm font-semibold text-slate-800">
                  Email nhận xác nhận <span aria-hidden="true" className="text-red-600">*</span>
                </label>
                <span id="email-hint" className="block text-xs text-slate-500">
                  Dùng để gửi thông tin & mã tra cứu lịch hẹn
                </span>
                <input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  required
                  autoComplete="email"
                  spellCheck={false}
                  autoCapitalize="none"
                  aria-describedby="email-hint"
                  enterKeyHint="done"
                  placeholder="you@example.com"
                  className={inputCls}
                  value={form.customerEmail}
                  onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <div role="alert" aria-live="polite" className="drawer-enter flex items-start gap-2.5 rounded-xl border border-red-300 bg-red-50 p-3.5 text-sm font-medium text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs font-medium text-slate-600">
                {slot ? "Nhấn đặt lịch để giữ khung giờ này trong 10 phút." : "Vui lòng chọn đầy đủ dịch vụ, nhân viên và khung giờ."}
              </div>
              <button
                type="submit"
                disabled={!slot || loading}
                className="btn-interactive inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {loading
                  ? "Đang giữ chỗ..."
                  : deposit > 0
                    ? `Xác nhận đặt lịch · Cọc ${formatVND(deposit)}`
                    : "Xác nhận đặt lịch"}
              </button>
            </div>
          </form>
        </div>

        {/* Cột phải: Tóm tắt đơn đặt (Dark High-Contrast Ticket Receipt) */}
        <aside className="reveal-up delay-2 overflow-hidden rounded-3xl border-2 border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-2xl shadow-slate-950/20 lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-3.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-300" aria-hidden="true" />
              <h2 className="font-bold text-white">Tóm tắt lịch hẹn</h2>
            </div>
            <span className="rounded-full bg-indigo-500/25 px-2.5 py-0.5 text-xs font-semibold text-indigo-200 ring-1 ring-indigo-400/30">
              {chosen.length} món
            </span>
          </div>

          <div className="mt-4 space-y-4 text-sm">
            <div>
              <div className="text-xs font-bold tracking-wider text-indigo-300 uppercase">Dịch vụ đã chọn</div>
              {chosen.length === 0 ? (
                <p className="mt-1.5 text-slate-400">Chưa chọn dịch vụ nào</p>
              ) : (
                <ul className="mt-2.5 space-y-2">
                  {chosen.map((c) => (
                    <li key={c.id} className="drawer-enter flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2">
                      <span className="text-slate-100">{c.name} ({c.durationMinutes}p)</span>
                      <span className="font-semibold text-white">{formatVND(c.price)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2.5 border-t border-white/15 pt-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-slate-300">
                  <User className="h-3.5 w-3.5 text-indigo-300" aria-hidden="true" /> Chuyên viên
                </span>
                <span className="font-semibold text-white">{chosenStaff ? chosenStaff.name : "Chưa chọn"}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-slate-300">
                  <Calendar className="h-3.5 w-3.5 text-indigo-300" aria-hidden="true" /> Ngày & Giờ
                </span>
                <span className="font-semibold text-white">
                  {slot ? `${slot.time} · ${date.split("-").reverse().join("/")}` : "Chưa chọn giờ"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-slate-300">
                  <Clock className="h-3.5 w-3.5 text-indigo-300" aria-hidden="true" /> Tổng thời lượng
                </span>
                <span className="font-semibold text-white">{duration} phút</span>
              </div>
            </div>

            <div className="space-y-2 rounded-2xl border border-indigo-400/30 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-slate-200">
                <span>Tổng chi phí</span>
                <span className="font-bold text-white">{formatVND(total)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/15 pt-2 text-base">
                <span className="font-bold text-white">Cọc trước (20%)</span>
                <span className="text-lg font-extrabold text-emerald-400">{formatVND(deposit)}</span>
              </div>
            </div>

            <p className="rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs leading-relaxed text-slate-300">
              Sau khi nhấn đặt lịch, khung giờ được giữ tạm 10 phút để bạn thực hiện thanh toán cọc mô phỏng.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
