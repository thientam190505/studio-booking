"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Calendar, Check, Clock, Sparkles, User, Users } from "lucide-react";
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
type Slot = {
  time: string;
  start: string;
  available: boolean;
  assignedStaffId?: string;
  assignedStaffName?: string;
};

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
    const effectiveStaffId = staffId === "ANY" ? (slot.assignedStaffId || "") : staffId;
    if (!effectiveStaffId) return;

    setLoading(true);
    setError("");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceIds: selected, staffId: effectiveStaffId, start: slot.start, ...form }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
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
  const card = "reveal-up rounded-2xl border-2 border-stone-300 bg-white p-5 sm:p-6 shadow-sm";
  const inputCls =
    "w-full rounded-xl border-2 border-stone-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-stone-950 placeholder:font-normal placeholder:text-stone-500 transition focus:border-amber-800";

  const staffSummaryLabel =
    staffId === "ANY"
      ? slot?.assignedStaffName
        ? `Tự xếp (${slot.assignedStaffName})`
        : "Để tiệm tự xếp thợ rảnh"
      : chosenStaff
        ? chosenStaff.name
        : "Chưa chọn";

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      {/* Tiêu đề & thanh tiến độ độ tương phản cao */}
      <div className="reveal-up space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-stone-950 sm:text-3xl">Đặt lịch hẹn</h1>
            <p className="mt-1 text-sm font-medium text-stone-800">
              Chọn dịch vụ, stylist quen (hoặc để tiệm tự xếp) và khung giờ phù hợp với bạn.
            </p>
          </div>
          <span className="rounded-full border-2 border-stone-300 bg-white px-3.5 py-1.5 text-xs font-bold text-stone-900 shadow-2xs">
            Hoàn thành: <span className="text-amber-900">{doneSteps}/4</span> bước
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-stone-300" aria-hidden="true">
          <div
            className="h-full w-full origin-left rounded-full bg-amber-800 transition-transform duration-300 ease-out"
            style={{ transform: `scaleX(${doneSteps / 4})` }}
          />
        </div>

        {/* Stepper */}
        <nav aria-label="Tiến trình đặt lịch" className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {steps.map((st) => (
            <div
              key={st.num}
              className={`flex items-center gap-2.5 rounded-xl border-2 px-3.5 py-2.5 text-sm font-bold transition-all duration-200 ${
                st.done
                  ? "border-emerald-800 bg-emerald-700 text-white shadow-xs"
                  : "border-stone-300 bg-white text-stone-900"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold transition-transform duration-200 ${
                  st.done ? "scale-105 bg-white text-emerald-800" : "bg-stone-200 text-stone-900"
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
              <legend className="mb-1 flex items-center gap-2.5 text-base font-extrabold text-stone-950">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white transition-colors ${
                    selected.length > 0 ? "bg-emerald-700" : "bg-stone-900"
                  }`}
                >
                  1
                </span>
                <span>
                  Chọn dịch vụ {selected.length > 0 && <span className="text-xs font-bold text-amber-900">({selected.length} đã chọn)</span>}
                </span>
              </legend>
              <p className="mb-4 text-xs font-medium text-stone-700">Bạn có thể kết hợp nhiều dịch vụ trong một lần hẹn.</p>

              {services.length === 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="h-24 animate-pulse rounded-xl border-2 border-stone-300 bg-stone-200" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.map((s) => {
                    const checked = selected.includes(s.id);
                    const paused = Boolean(s.unavailableReason);
                    return (
                      <label
                        key={s.id}
                        className={`card-interactive relative flex flex-col justify-between rounded-xl p-4 focus-within:ring-2 focus-within:ring-amber-800 ${
                          paused
                            ? "cursor-not-allowed border-2 border-amber-400 bg-amber-50/80 opacity-85"
                            : checked
                              ? "cursor-pointer border-2 border-stone-950 bg-[#fdf8f0] shadow-xs"
                              : "cursor-pointer border-2 border-stone-300 bg-white hover:border-stone-800"
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
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                checked ? "bg-stone-900 text-white" : "border border-amber-700/30 bg-amber-100 text-amber-950"
                              }`}
                            >
                              {s.category}
                            </span>
                            <div className="font-extrabold text-stone-950">{s.name}</div>
                            <div className="text-xs font-medium text-stone-700">{s.description}</div>
                          </div>
                          {!paused && (
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-white transition-all duration-150 ${
                                checked ? "scale-110 border-stone-950 bg-stone-950" : "border-stone-600 bg-white"
                              }`}
                            >
                              {checked && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                            </span>
                          )}
                        </div>
                        {paused ? (
                          <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                            <span className="font-bold text-stone-700 line-through">{formatVND(s.price)}</span>
                            <span className="rounded-full border border-amber-700/40 bg-amber-100 px-2.5 py-0.5 font-bold text-amber-950">
                              Tạm ngưng: {s.unavailableReason}
                            </span>
                          </div>
                        ) : (
                          <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-2.5 text-sm">
                            <span className="font-extrabold text-stone-950">{formatVND(s.price)}</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-bold text-stone-800">
                              <Clock className="h-3.5 w-3.5 text-stone-700" aria-hidden="true" />
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
            <div className="flex items-center gap-2.5 text-base font-extrabold text-stone-950">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white transition-colors ${
                  staffId && date ? "bg-emerald-700" : "bg-stone-900"
                }`}
              >
                2
              </span>
              <span>Chọn stylist & ngày hẹn</span>
            </div>

            <fieldset>
              <legend className="mb-2.5 text-sm font-bold text-stone-900">Stylist thực hiện</legend>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* Tùy chọn tự động xếp thợ rảnh */}
                <label
                  className={`card-interactive flex cursor-pointer items-center gap-3 rounded-xl p-3.5 focus-within:ring-2 focus-within:ring-amber-800 ${
                    staffId === "ANY"
                      ? "border-2 border-stone-950 bg-stone-900 text-white shadow-sm"
                      : "border-2 border-dashed border-amber-700 bg-amber-50/60 text-stone-950 hover:border-stone-900"
                  }`}
                >
                  <input
                    type="radio"
                    name="staffId"
                    value="ANY"
                    checked={staffId === "ANY"}
                    onChange={() => setStaffId("ANY")}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      staffId === "ANY" ? "bg-amber-700 text-white" : "bg-amber-800 text-white"
                    }`}
                  >
                    <Users className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className={`block truncate text-sm font-extrabold ${staffId === "ANY" ? "text-white" : "text-stone-950"}`}>
                      Tự xếp thợ rảnh
                    </span>
                    <span className={`block truncate text-xs font-medium ${staffId === "ANY" ? "text-amber-200" : "text-stone-700"}`}>
                      Ưu tiên còn trống giờ
                    </span>
                  </span>
                </label>

                {staff.map((st) => {
                  const active = staffId === st.id;
                  return (
                    <label
                      key={st.id}
                      className={`card-interactive flex cursor-pointer items-center gap-3 rounded-xl p-3.5 focus-within:ring-2 focus-within:ring-amber-800 ${
                        active
                          ? "border-2 border-stone-950 bg-stone-900 text-white shadow-sm"
                          : "border-2 border-stone-300 bg-white text-stone-950 hover:border-stone-800"
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
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold transition-colors ${
                          active ? "bg-amber-700 text-white" : "bg-stone-200 text-stone-900"
                        }`}
                      >
                        {st.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className={`block truncate text-sm font-extrabold ${active ? "text-white" : "text-stone-950"}`}>
                          {st.name}
                        </span>
                        <span className={`block truncate text-xs font-medium ${active ? "text-stone-200" : "text-stone-700"}`}>
                          {st.specialty}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="max-w-md space-y-1.5">
              <label htmlFor="book-date" className="block text-sm font-bold text-stone-900">
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
                    className="btn-interactive rounded-full border-2 border-stone-300 bg-stone-100 px-3.5 py-2 text-xs font-bold text-stone-900 hover:border-stone-900 hover:bg-stone-900 hover:text-white"
                  >
                    Chọn ngày mai (đầy đủ 09:00 – 17:30)
                  </button>
                )}
              </div>
              <p className="text-xs font-medium text-stone-700">
                Lưu ý: Nếu chọn hôm nay, các khung giờ đã qua theo đồng hồ thực tế sẽ tự động khóa.
              </p>
            </div>
          </section>

          {/* Bước 3: Khung giờ */}
          <section className={card + " delay-2 space-y-4"}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 text-base font-extrabold text-stone-950">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white transition-colors ${
                    slot ? "bg-emerald-700" : "bg-stone-900"
                  }`}
                >
                  3
                </span>
                <span>Chọn giờ {duration ? `(${duration} phút)` : ""}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-stone-800">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full border-2 border-stone-600 bg-white" /> Trống
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-stone-950" /> Đang chọn
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-stone-400" /> Đã kín
                </span>
              </div>
            </div>

            {!staffId || !selected.length ? (
              <div className="rounded-xl border-2 border-dashed border-stone-400 bg-[#f6f0e6] p-5 text-center text-sm font-semibold text-stone-800">
                Hãy chọn ít nhất 1 dịch vụ và 1 stylist (hoặc Tự xếp thợ rảnh) ở bước trên để xem khung giờ trống.
              </div>
            ) : visibleSlots.length === 0 ? (
              <div className="drawer-enter rounded-xl border-2 border-amber-600/50 bg-amber-50 p-5 text-center text-sm font-semibold text-amber-950">
                Stylist không làm việc hoặc đã kín lịch vào ngày này. Vui lòng thử ngày khác hoặc chọn &quot;Tự xếp thợ rảnh&quot;.
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
                          ? "border-stone-950 bg-stone-900 font-extrabold text-white shadow-xs"
                          : s.available
                            ? "border-stone-300 bg-white font-bold text-stone-950 hover:border-stone-900 hover:bg-amber-50/70"
                            : "cursor-not-allowed border-stone-300 bg-stone-200 font-medium text-stone-600 line-through"
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
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white transition-colors ${
                  steps[3].done ? "bg-emerald-700" : "bg-stone-900"
                }`}
              >
                4
              </span>
              <h2 id="contact-heading" className="text-base font-extrabold text-stone-950">Thông tin liên hệ</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="customerName" className="block text-sm font-bold text-stone-900">
                  Họ và tên <span aria-hidden="true" className="text-red-700">*</span>
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
                <label htmlFor="customerPhone" className="block text-sm font-bold text-stone-900">
                  Số điện thoại <span aria-hidden="true" className="text-red-700">*</span>
                </label>
                <span id="phone-hint" className="block text-xs font-medium text-stone-700">
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
                <label htmlFor="customerEmail" className="block text-sm font-bold text-stone-900">
                  Email nhận xác nhận <span aria-hidden="true" className="text-red-700">*</span>
                </label>
                <span id="email-hint" className="block text-xs font-medium text-stone-700">
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
              <div role="alert" aria-live="polite" className="drawer-enter flex items-start gap-2.5 rounded-xl border-2 border-red-400 bg-red-50 p-3.5 text-sm font-semibold text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t-2 border-stone-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs font-semibold text-stone-800">
                {slot ? "Nhấn đặt lịch để giữ khung giờ này trong 10 phút." : "Vui lòng chọn đầy đủ dịch vụ, stylist và khung giờ."}
              </div>
              <button
                type="submit"
                disabled={!slot || loading}
                className="btn-interactive inline-flex min-h-11 items-center justify-center rounded-full bg-amber-800 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* Cột phải: Phiếu tóm tắt lịch hẹn với header tối tương phản sắc nét */}
        <aside className="reveal-up delay-2 overflow-hidden rounded-3xl border-2 border-stone-900 bg-white text-stone-950 shadow-md lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-2 bg-stone-900 px-6 py-4 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-300" aria-hidden="true" />
              <h2 className="font-extrabold text-white">Phiếu tóm tắt lịch hẹn</h2>
            </div>
            <span className="rounded-full bg-amber-700 px-2.5 py-0.5 text-xs font-bold text-white">
              {chosen.length} món
            </span>
          </div>

          <div className="space-y-4 p-6 text-sm">
            <div>
              <div className="text-xs font-extrabold tracking-wider text-stone-700 uppercase">Dịch vụ đã chọn</div>
              {chosen.length === 0 ? (
                <p className="mt-1.5 font-medium text-stone-700">Chưa chọn dịch vụ nào</p>
              ) : (
                <ul className="mt-2.5 space-y-2">
                  {chosen.map((c) => (
                    <li key={c.id} className="drawer-enter flex items-center justify-between gap-2 rounded-xl border border-stone-300 bg-[#faf6ef] px-3 py-2">
                      <span className="font-bold text-stone-900">{c.name} ({c.durationMinutes}p)</span>
                      <span className="font-extrabold text-stone-950">{formatVND(c.price)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2.5 border-t border-stone-300 pt-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-semibold text-stone-700">
                  <User className="h-4 w-4 text-amber-800" aria-hidden="true" /> Stylist
                </span>
                <span className="font-extrabold text-stone-950">{staffSummaryLabel}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-semibold text-stone-700">
                  <Calendar className="h-4 w-4 text-amber-800" aria-hidden="true" /> Ngày & Giờ
                </span>
                <span className="font-extrabold text-stone-950">
                  {slot ? `${slot.time} · ${date.split("-").reverse().join("/")}` : "Chưa chọn giờ"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-semibold text-stone-700">
                  <Clock className="h-4 w-4 text-amber-800" aria-hidden="true" /> Tổng thời lượng
                </span>
                <span className="font-extrabold text-stone-950">{duration} phút</span>
              </div>
            </div>

            <div className="space-y-2 rounded-2xl border-2 border-amber-800/35 bg-[#fdf6eb] p-4">
              <div className="flex items-center justify-between font-semibold text-stone-800">
                <span>Tổng chi phí</span>
                <span className="font-extrabold text-stone-950">{formatVND(total)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-amber-800/20 pt-2 text-base">
                <span className="font-extrabold text-stone-950">Cọc trước (20%)</span>
                <span className="text-lg font-extrabold text-amber-900">{formatVND(deposit)}</span>
              </div>
            </div>

            <p className="rounded-xl border border-stone-300 bg-stone-100 p-3 text-xs leading-relaxed font-medium text-stone-800">
              Sau khi nhấn đặt lịch, khung giờ được giữ trong 10 phút để bạn hoàn tất xác nhận cọc.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
