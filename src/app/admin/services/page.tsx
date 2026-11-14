import { Layers, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createService } from "../actions";
import AdminNav from "../AdminNav";
import ServiceItemCard from "./ServiceItemCard";

export const dynamic = "force-dynamic";

const DEFAULT_CATEGORIES = ["Cắt & Tạo kiểu", "Uốn & Nhuộm", "Gội & Chăm sóc", "Combo đặc biệt"];

export default async function ServicesPage() {
  const session = await requireAdmin();
  const services = await prisma.service.findMany({ orderBy: [{ category: "asc" }, { price: "asc" }] });

  const categories = [...new Set([...DEFAULT_CATEGORIES, ...services.map((s) => s.category)])];
  const byCategory = new Map<string, typeof services>();
  services.forEach((s) => {
    byCategory.set(s.category, [...(byCategory.get(s.category) ?? []), s]);
  });

  const activeCount = services.filter((s) => s.active && !s.unavailableReason).length;
  const pausedCount = services.filter((s) => s.active && s.unavailableReason).length;
  const hiddenCount = services.filter((s) => !s.active).length;

  const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500";

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <AdminNav name={session.name} role={session.role} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Menu & Dịch vụ</h1>
          <p className="text-sm text-slate-600">
            Thêm món mới vào Menu, chỉnh sửa giá/thời lượng, tạm ngưng khi hết nguyên liệu hoặc ẩn dịch vụ.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 border border-emerald-200">
            Mở bán: {activeCount}
          </span>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800 border border-amber-200">
            Tạm ngưng: {pausedCount}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 border border-slate-200">
            Đang ẩn: {hiddenCount}
          </span>
        </div>
      </div>

      {/* Datalist gợi ý danh mục Menu cho cả form thêm mới & sửa inline */}
      <datalist id="menu-categories">
        {categories.map((cat) => (
          <option key={cat} value={cat} />
        ))}
      </datalist>

      <form
        action={createService}
        aria-labelledby="add-service-heading"
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 id="add-service-heading" className="text-sm font-semibold text-slate-900">
          Thêm dịch vụ mới vào Menu
        </h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="svc-name" className="block text-xs font-medium text-slate-700">
              Tên dịch vụ <span aria-hidden="true" className="text-red-600">*</span>
            </label>
            <input id="svc-name" name="name" required placeholder="Ví dụ: Gội đầu thảo dược cao cấp" className={inputCls} />
          </div>
          <div className="space-y-1">
            <label htmlFor="svc-cat" className="block text-xs font-medium text-slate-700">
              Nhóm Menu <span aria-hidden="true" className="text-red-600">*</span>
            </label>
            <input
              id="svc-cat"
              name="category"
              list="menu-categories"
              required
              defaultValue="Cắt & Tạo kiểu"
              placeholder="Chọn hoặc gõ nhóm mới"
              className={inputCls}
            />
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
          <div className="space-y-1 sm:col-span-2">
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
              <span>Thêm vào Menu</span>
            </button>
          </div>
        </div>
      </form>

      {/* Danh sách theo từng nhóm Menu */}
      <div className="space-y-5">
        {[...byCategory.entries()].map(([category, items]) => (
          <section key={category} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3">
              <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Layers className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                <span>{category}</span>
              </h2>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {items.length} món
              </span>
            </div>
            <ul className="divide-y divide-slate-100">
              {items.map((s) => (
                <ServiceItemCard key={s.id} service={s} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
