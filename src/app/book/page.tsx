"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Calendar, Check, Clock, Sparkles, User } from "lucide-react";
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

  const card = "rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm";
  const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500";

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Đặt lịch hẹn</h1>
          <p className="mt-1 text-sm text-slate-600">Hoàn thành 4 bước bên dưới để giữ chỗ ngay lập tức.</p>
        </div>

        {/* Stepper */}
        <nav aria-label="Tiến trình đặt lịch" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {steps.map((st) => (
            <div
              key={st.num}
              className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition ${
                st.done
                  ? "border-emerald-200 bg-emerald-50/70 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  st.done ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"
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
              <legend className="mb-1 flex items-center gap-2 text-base font-semibold text-slate-900">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">1</span>
                Chọn dịch vụ {selected.length > 0 && <span className="text-xs font-medium text-indigo-600">({selected.length} đã chọn)</span>}
              </legend>
              <p className="mb-4 text-xs text-slate-500">Bạn có thể chọn nhiều dịch vụ cùng lúc.</p>

              {services.length === 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="h-24 animate-pulse rounded-xl border border-slate-100 bg-slate-100" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.map((s) => {
                    const checked = selected.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`relative flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition focus-within:ring-2 focus-within:ring-indigo-500 ${
                          checked
                            ? "border-indigo-600 bg-indigo-50/70 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="services"
                          value={s.id}
                          checked={checked}
                          onChange={() => toggle(s.id)}
                          className="sr-only"
                        />
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold text-slate-900">{s.name}</div>
                            <div className="mt-0.5 text-xs text-slate-500">{s.description}</div>
                          </div>
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-white ${
                              checked ? "border-indigo-600 bg-indigo-600" : "border-slate-300 bg-white"
                            }`}
                          >
                            {checked && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="font-bold text-indigo-700">{formatVND(s.price)}</span>
                          <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                            {s.durationMinutes} phút
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </fieldset>
          </section>

          {/* Bước 2: Nhân viên & Ngày */}
          <section className={card + " space-y-5"}>
            <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">2</span>
              <span>Chọn chuyên viên & ngày hẹn</span>
            </div>

            <fieldset>
              <legend className="mb-2.5 text-sm font-medium text-slate-700">Chuyên viên thực hiện</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {staff.map((st) => {
                  const active = staffId === st.id;
                  return (
                    <label
                      key={st.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition focus-within:ring-2 focus-within:ring-indigo-500 ${
                        active
                          ? "border-indigo-600 bg-indigo-50/70 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300"
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
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                          active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {st.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-900">{st.name}</span>
                        <span className="block truncate text-xs text-slate-500">{st.specialty}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="max-w-md space-y-1.5">
              <label htmlFor="book-date" className="block text-sm font-medium text-slate-700">
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
                    className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    Chọn ngày mai (đầy đủ 09:00 – 17:30)
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Lưu ý: Nếu chọn hôm nay, các khung giờ đã trôi qua theo đồng hồ thực tế sẽ tự động khóa.
              </p>
            </div>
          </section>

          {/* Bước 3: Khung giờ */}
          <section className={card + " space-y-4"}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">3</span>
                <span>Chọn giờ {duration ? `(${duration} phút)` : ""}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full border border-slate-300 bg-white" /> Trống</span>
                <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-indigo-600" /> Đang chọn</span>
                <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-slate-200" /> Đã kín</span>
              </div>
            </div>

            {!staffId || !selected.length ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
                Hãy chọn ít nhất 1 dịch vụ và 1 chuyên viên ở bước trên để xem khung giờ trống.
              </div>
            ) : visibleSlots.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-center text-sm text-amber-800">
                Nhân viên không làm việc hoặc đã kín lịch vào ngày này. Vui lòng thử ngày khác.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                {visibleSlots.map((s) => (
                  <button
                    key={s.start}
                    type="button"
                    disabled={!s.available}
                    onClick={() => setSlotStart(s.start)}
                    className={`min-h-11 rounded-xl border py-2.5 text-sm font-medium transition ${
                      slot?.start === s.start
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                        : s.available
                          ? "border-slate-300 bg-white text-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50"
                          : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through"
                    }`}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Bước 4: Thông tin liên hệ */}
          <form onSubmit={submit} aria-labelledby="contact-heading" className={card + " space-y-4"}>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">4</span>
              <h2 id="contact-heading" className="text-base font-semibold text-slate-900">Thông tin liên hệ</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="customerName" className="block text-sm font-medium text-slate-700">
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
                <label htmlFor="customerPhone" className="block text-sm font-medium text-slate-700">
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
                <label htmlFor="customerEmail" className="block text-sm font-medium text-slate-700">
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
              <div role="alert" aria-live="polite" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-500">
                {slot ? "Nhấn đặt lịch để giữ khung giờ này trong 10 phút." : "Vui lòng chọn đầy đủ dịch vụ, nhân viên và khung giờ."}
              </div>
              <button
                type="submit"
                disabled={!slot || loading}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-45"
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

        {/* Cột phải: Tóm tắt đơn đặt */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="h-4 w-4 text-indigo-600" aria-hidden="true" />
            <h2 className="font-semibold text-slate-900">Tóm tắt lịch hẹn</h2>
          </div>

          <div className="mt-4 space-y-4 text-sm">
            <div>
              <div className="text-xs font-medium text-slate-500 uppercase">Dịch vụ đã chọn</div>
              {chosen.length === 0 ? (
                <p className="mt-1 text-slate-400">Chưa chọn dịch vụ nào</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {chosen.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-2">
                      <span className="text-slate-700">{c.name} ({c.durationMinutes}p)</span>
                      <span className="font-medium text-slate-900">{formatVND(c.price)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <User className="h-3.5 w-3.5" aria-hidden="true" /> Chuyên viên
                </span>
                <span className="font-medium text-slate-900">{chosenStaff ? chosenStaff.name : "Chưa chọn"}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" /> Ngày & Giờ
                </span>
                <span className="font-medium text-slate-900">
                  {slot ? `${slot.time} · ${date.split("-").reverse().join("/")}` : "Chưa chọn giờ"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Tổng thời lượng
                </span>
                <span className="font-medium text-slate-900">{duration} phút</span>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between text-slate-600">
                <span>Tổng chi phí</span>
                <span className="font-semibold text-slate-900">{formatVND(total)}</span>
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="font-semibold text-slate-900">Cọc trước (20%)</span>
                <span className="font-bold text-indigo-600">{formatVND(deposit)}</span>
              </div>
            </div>

            <p className="rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
              Sau khi nhấn đặt lịch, khung giờ được giữ tạm 10 phút để bạn thực hiện thanh toán cọc mô phỏng.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
