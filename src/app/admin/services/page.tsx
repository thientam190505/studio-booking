import { Layers, Plus, RotateCcw } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createService, restoreDemoMenu } from "../actions";
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
    "w-full rounded-xl border-2 border-stone-300 bg-white px-3.5 py-2 text-sm font-semibold text-stone-950 placeholder:font-normal placeholder:text-stone-500 focus:border-amber-800";

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <AdminNav name={session.name} role={session.role} />

      <div className="reveal-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-950">Quản lý Menu & Dịch vụ</h1>
          <p className="text-sm font-medium text-stone-800">
            Thêm món mới vào Menu, chỉnh sửa giá/thời lượng, tạm ngưng khi hết nguyên liệu hoặc ẩn dịch vụ.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
          <span className="rounded-full border-2 border-emerald-700/30 bg-emerald-100 px-3 py-1 text-emerald-950">
            Mở bán: {activeCount}
          </span>
          <span className="rounded-full border-2 border-amber-700/30 bg-amber-100 px-3 py-1 text-amber-950">
            Tạm ngưng: {pausedCount}
          </span>
          <span className="rounded-full border-2 border-stone-400 bg-stone-200 px-3 py-1 text-stone-900">
            Đang ẩn: {hiddenCount}
          </span>
          <form action={restoreDemoMenu}>
            <button
              type="submit"
              className="btn-interactive inline-flex items-center gap-1.5 rounded-full border-2 border-stone-400 bg-white px-3 py-1.5 text-xs font-extrabold text-stone-950 hover:border-stone-900 hover:bg-stone-900 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Khôi phục Menu gốc</span>
            </button>
          </form>
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
        className="reveal-up delay-1 space-y-4 rounded-2xl border-2 border-stone-300 bg-white p-5 shadow-xs"
      >
        <h2 id="add-service-heading" className="text-sm font-extrabold text-stone-950">
          Thêm dịch vụ mới vào Menu
        </h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="svc-name" className="block text-xs font-bold text-stone-900">
              Tên dịch vụ <span aria-hidden="true" className="text-red-700">*</span>
            </label>
            <input id="svc-name" name="name" required placeholder="Ví dụ: Gội đầu thảo dược cao cấp" className={inputCls} />
          </div>
          <div className="space-y-1">
            <label htmlFor="svc-cat" className="block text-xs font-bold text-stone-900">
              Nhóm Menu <span aria-hidden="true" className="text-red-700">*</span>
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
            <label htmlFor="svc-price" className="block text-xs font-bold text-stone-900">
              Giá (VND) <span aria-hidden="true" className="text-red-700">*</span>
            </label>
            <input id="svc-price" name="price" type="number" min={0} step={1000} required placeholder="150000" className={inputCls} />
          </div>
          <div className="space-y-1">
            <label htmlFor="svc-duration" className="block text-xs font-bold text-stone-900">
              Thời lượng (phút) <span aria-hidden="true" className="text-red-700">*</span>
            </label>
            <input id="svc-duration" name="durationMinutes" type="number" min={15} max={480} step={15} required placeholder="45" className={inputCls} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="svc-desc" className="block text-xs font-bold text-stone-900">
              Mô tả ngắn
            </label>
            <input id="svc-desc" name="description" placeholder="Mô tả chi tiết quy trình dịch vụ" className={inputCls} />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="btn-interactive inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full bg-amber-800 px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-amber-900"
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
          <section key={category} className="reveal-up delay-2 overflow-hidden rounded-2xl border-2 border-stone-300 bg-white shadow-xs">
            <div className="flex items-center justify-between border-b-2 border-stone-300 bg-[#e9dfd0] px-5 py-3 text-stone-950">
              <h2 className="inline-flex items-center gap-2 text-sm font-extrabold text-stone-950">
                <Layers className="h-4 w-4 text-amber-900" aria-hidden="true" />
                <span>{category}</span>
              </h2>
              <span className="rounded-full bg-stone-900 px-3 py-0.5 text-xs font-bold text-white">
                {items.length} món
              </span>
            </div>
            <ul className="divide-y divide-stone-200">
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
