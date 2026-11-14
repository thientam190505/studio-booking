import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/format";
import { createService, toggleService } from "../actions";
import AdminNav from "../AdminNav";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const session = await requireAdmin();
  const services = await prisma.service.findMany({ orderBy: { name: "asc" } });
  const input = "rounded-lg border border-zinc-300 px-3 py-2 text-sm";

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <AdminNav name={session.name} />
      <h1 className="text-2xl font-bold">Dịch vụ</h1>

      <form action={createService} className="grid gap-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:grid-cols-5">
        <input name="name" required placeholder="Tên dịch vụ" className={input + " sm:col-span-2"} />
        <input name="price" type="number" min={0} step={1000} required placeholder="Giá (VND)" className={input} />
        <input name="durationMinutes" type="number" min={15} step={15} required placeholder="Phút" className={input} />
        <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white">Thêm</button>
        <input name="description" placeholder="Mô tả" className={input + " sm:col-span-5"} />
      </form>

      <ul className="divide-y rounded-xl border border-zinc-200 bg-white shadow-sm">
        {services.map((s) => (
          <li key={s.id} className="flex items-center gap-3 px-4 py-3 text-sm">
            <div className={`flex-1 ${s.active ? "" : "text-zinc-400 line-through"}`}>
              <div className="font-medium">{s.name}</div>
              <div className="text-xs">{formatVND(s.price)} · {s.durationMinutes} phút</div>
            </div>
            <form action={toggleService.bind(null, s.id)}>
              <button className="rounded-lg border px-3 py-1 text-xs">{s.active ? "Ẩn" : "Hiện"}</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
