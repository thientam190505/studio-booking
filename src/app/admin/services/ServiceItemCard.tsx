"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Eye, EyeOff, PauseCircle, Pencil, PlayCircle, Trash2 } from "lucide-react";
import { formatVND } from "@/lib/format";
import { deleteService, setServiceUnavailable, toggleService, updateService } from "../actions";

export type AdminServiceItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  durationMinutes: number;
  active: boolean;
  unavailableReason: string;
};

const QUICK_REASONS = [
  "Hết dầu gội thảo dược",
  "Hết thuốc nhuộm / uốn",
  "Bảo trì máy móc",
  "Tạm ngưng nhận khách",
];

export default function ServiceItemCard({ service }: { service: AdminServiceItem }) {
  const [mode, setMode] = useState<"view" | "edit" | "pause">("view");
  const [reason, setReason] = useState(service.unavailableReason || "Hết dầu gội thảo dược");

  const isPaused = Boolean(service.unavailableReason);
  const inputCls =
    "w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-800";

  return (
    <li className="p-5 transition-colors hover:bg-[#faf7f2]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className={`min-w-52 flex-1 space-y-1.5 ${service.active ? "" : "opacity-55"}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-base font-bold text-stone-900 ${service.active ? "" : "line-through"}`}>
              {service.name}
            </span>
            <span className="rounded-full border border-stone-200 bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-stone-700">
              {service.category}
            </span>
            {!service.active ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-stone-200 px-2.5 py-0.5 text-[11px] font-semibold text-stone-700">
                <EyeOff className="h-3 w-3" aria-hidden="true" />
                Đang ẩn khỏi Menu
              </span>
            ) : isPaused ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
                <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                Tạm ngưng: {service.unavailableReason}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                Đang mở bán
              </span>
            )}
          </div>
          {service.description && <p className="text-xs text-stone-600">{service.description}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
            <Clock className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
            {service.durationMinutes} phút
          </span>
          <span className="min-w-24 text-right text-sm font-extrabold text-stone-900">{formatVND(service.price)}</span>

          {isPaused ? (
            <form action={setServiceUnavailable}>
              <input type="hidden" name="id" value={service.id} />
              <input type="hidden" name="reason" value="" />
              <button
                type="submit"
                className="btn-interactive inline-flex items-center gap-1 rounded-full border border-emerald-700 bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800"
              >
                <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Mở bán lại</span>
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setMode(mode === "pause" ? "view" : "pause")}
              className={`btn-interactive inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold ${
                mode === "pause"
                  ? "border-amber-700 bg-amber-700 text-white shadow-2xs"
                  : "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
              }`}
            >
              <PauseCircle className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Báo hết đồ</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMode(mode === "edit" ? "view" : "edit")}
            className={`btn-interactive inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold ${
              mode === "edit"
                ? "border-stone-900 bg-stone-900 text-white shadow-2xs"
                : "border-stone-300 bg-white text-stone-800 hover:border-stone-900"
            }`}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sửa</span>
          </button>

          <form action={toggleService.bind(null, service.id)}>
            <button
              type="submit"
              className="btn-interactive inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-800 hover:bg-stone-100"
            >
              {service.active ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Ẩn</span>
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Hiện</span>
                </>
              )}
            </button>
          </form>

          <form action={deleteService.bind(null, service.id)}>
            <button
              type="submit"
              aria-label={`Xóa dịch vụ ${service.name}`}
              className="btn-interactive inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-bold text-red-600 hover:border-red-300 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>

      {/* Khung Báo hết nguyên liệu / Tạm ngưng */}
      {mode === "pause" && (
        <form
          action={setServiceUnavailable}
          onSubmit={() => setMode("view")}
          className="drawer-enter mt-4 space-y-3 rounded-2xl border border-amber-300 bg-amber-50/80 p-4 text-sm shadow-2xs"
        >
          <input type="hidden" name="id" value={service.id} />
          <div className="space-y-1.5">
            <label htmlFor={`pause-reason-${service.id}`} className="block text-xs font-bold text-amber-950">
              Lý do tạm ngưng (hiển thị cho khách trên Menu)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REASONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReason(preset)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                    reason === preset
                      ? "border-amber-700 bg-amber-700 text-white shadow-2xs"
                      : "border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              id={`pause-reason-${service.id}`}
              name="reason"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ví dụ: Hết dầu gội thảo dược"
              className={inputCls}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="btn-interactive rounded-full bg-amber-800 px-4 py-2 text-xs font-bold text-white hover:bg-amber-900"
            >
              Xác nhận tạm ngưng món này
            </button>
            <button
              type="button"
              onClick={() => setMode("view")}
              className="rounded-full border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
            >
              Đóng
            </button>
          </div>
        </form>
      )}

      {/* Khung Chỉnh sửa giá, tên, danh mục */}
      {mode === "edit" && (
        <form
          action={updateService}
          onSubmit={() => setMode("view")}
          className="drawer-enter mt-4 space-y-3 rounded-2xl border border-stone-300 bg-[#faf7f2] p-4 text-sm shadow-2xs"
        >
          <input type="hidden" name="id" value={service.id} />
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor={`edit-name-${service.id}`} className="block text-xs font-semibold text-stone-700">
                Tên dịch vụ <span aria-hidden="true" className="text-red-600">*</span>
              </label>
              <input id={`edit-name-${service.id}`} name="name" required defaultValue={service.name} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label htmlFor={`edit-cat-${service.id}`} className="block text-xs font-semibold text-stone-700">
                Nhóm Menu <span aria-hidden="true" className="text-red-600">*</span>
              </label>
              <input
                id={`edit-cat-${service.id}`}
                name="category"
                list="menu-categories"
                required
                defaultValue={service.category}
                className={inputCls}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor={`edit-price-${service.id}`} className="block text-xs font-semibold text-stone-700">
                Giá (VND) <span aria-hidden="true" className="text-red-600">*</span>
              </label>
              <input
                id={`edit-price-${service.id}`}
                name="price"
                type="number"
                min={0}
                step={1000}
                required
                defaultValue={service.price}
                className={inputCls}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor={`edit-dur-${service.id}`} className="block text-xs font-semibold text-stone-700">
                Thời lượng (phút) <span aria-hidden="true" className="text-red-600">*</span>
              </label>
              <input
                id={`edit-dur-${service.id}`}
                name="durationMinutes"
                type="number"
                min={15}
                max={480}
                step={15}
                required
                defaultValue={service.durationMinutes}
                className={inputCls}
              />
            </div>
            <div className="space-y-1 sm:col-span-3">
              <label htmlFor={`edit-desc-${service.id}`} className="block text-xs font-semibold text-stone-700">
                Mô tả ngắn
              </label>
              <input id={`edit-desc-${service.id}`} name="description" defaultValue={service.description} className={inputCls} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="btn-interactive rounded-full bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-amber-800"
            >
              Lưu thay đổi
            </button>
            <button
              type="button"
              onClick={() => setMode("view")}
              className="rounded-full border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
            >
              Hủy
            </button>
          </div>
        </form>
      )}
    </li>
  );
}
