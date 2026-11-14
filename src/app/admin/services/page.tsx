import { Clock, Eye, EyeOff, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/format";
import { createService, toggleService } from "../actions";
import AdminNav from "../AdminNav";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const session = await requireAdmin();
  const services = await prisma.service.findMany({ orderBy: { name: "asc" } });
  const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500";

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <AdminNav name={session.name} />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý dịch vụ</h1>
        <p className="text-sm text-slate-600">Thêm dịch vụ mới hoặc tạm ẩn dịch vụ khỏi trang đặt lịch của khách.</p>
      </div>

      <form
        action={createService}
        aria-labelledby="add-service-heading"
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 id="add-service-heading" className="text-sm font-semibold text-slate-900">
          Thêm dịch vụ mới
        </h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="svc-name" className="block text-xs font-medium text-slate-700">
              Tên dịch vụ <span aria-hidden="true" className="text-red-600">*</span>
            </label>
            <input id="svc-name" name="name" required placeholder="Ví dụ: Cắt & tạo kiểu" className={inputCls} />
          </div>
          <div className="space-y-1">
            <label htmlFor="svc-price" className="block text-xs font-medium text-slate-700">
              Giá (VND) <span aria-hidden="true" className="text-red-600">*</span>
            </label>
            <input id="svc-price" name="price" type="number" min={0} step={1000} required placeholder="150000" className={inputCls} />
          </div>
          <div className="space-y-1">
            <label htmlFor="svc-duration" className="block text-xs font-medium text-slate-700">
              Thời lượng (phút) <span aria-hidden="true" className="text-red-600">*</span>
            </label>
            <input id="svc-duration" name="durationMinutes" type="number" min={15} max={480} step={15} required placeholder="45" className={inputCls} />
          </div>
          <div className="space-y-1 sm:col-span-3">
            <label htmlFor="svc-desc" className="block text-xs font-medium text-slate-700">
              Mô tả ngắn
            </label>
            <input id="svc-desc" name="description" placeholder="Mô tả chi tiết quy trình dịch vụ" className={inputCls} />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Thêm dịch vụ</span>
            </button>
          </div>
        </div>
      </form>

      <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {services.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center gap-4 px-5 py-4 text-sm">
            <div className={`min-w-48 flex-1 ${s.active ? "" : "opacity-50"}`}>
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-slate-900 ${s.active ? "" : "line-through"}`}>{s.name}</span>
                {!s.active && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">Đang ẩn</span>
                )}
              </div>
              {s.description && <div className="mt-0.5 text-xs text-slate-500">{s.description}</div>}
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {s.durationMinutes} phút
              </span>
              <span className="w-28 text-right font-bold text-indigo-600">{formatVND(s.price)}</span>
              <form action={toggleService.bind(null, s.id)}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {s.active ? (
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
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
