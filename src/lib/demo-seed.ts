import type { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/prisma";

export const DEFAULT_SERVICES = [
  {
    name: "Cắt tóc nam",
    category: "Cắt & Tạo kiểu",
    description: "Cắt, gội, sấy tạo kiểu",
    price: 120000,
    durationMinutes: 30,
  },
  {
    name: "Cắt tóc nữ",
    category: "Cắt & Tạo kiểu",
    description: "Cắt, gội, sấy",
    price: 180000,
    durationMinutes: 60,
  },
  {
    name: "Nhuộm tóc",
    category: "Uốn & Nhuộm",
    description: "Nhuộm màu thời trang",
    price: 450000,
    durationMinutes: 90,
  },
  {
    name: "Uốn / Duỗi",
    category: "Uốn & Nhuộm",
    description: "Uốn hoặc duỗi phục hồi",
    price: 600000,
    durationMinutes: 120,
  },
  {
    name: "Gội đầu dưỡng sinh",
    category: "Gội & Chăm sóc",
    description: "Massage da đầu thư giãn",
    price: 150000,
    durationMinutes: 45,
  },
] as const;

/** Tự động khôi phục 5 dịch vụ mẫu nếu toàn bộ dịch vụ đang mở bán bị xóa/ẩn hết. */
export async function ensureDefaultMenu(db: PrismaClient = defaultPrisma) {
  const activeCount = await db.service.count({ where: { active: true } });
  if (activeCount > 0) return false;
  await restoreMenuToDefault(db, false);
  return true;
}

/** Khôi phục 5 dịch vụ mẫu về nguyên trạng (giá, thời lượng, mở bán); dọn dịch vụ phát sinh chưa có booking. */
export async function restoreMenuToDefault(db: PrismaClient = defaultPrisma, pruneCustom = true) {
  const existing = await db.service.findMany({ include: { _count: { select: { items: true } } } });
  const defaultNames = new Set<string>(DEFAULT_SERVICES.map((s) => s.name));

  for (const def of DEFAULT_SERVICES) {
    const match = existing.find((s) => s.name === def.name);
    if (match) {
      await db.service.update({
        where: { id: match.id },
        data: { ...def, active: true, unavailableReason: "" },
      });
    } else {
      await db.service.create({ data: { ...def, active: true, unavailableReason: "" } });
    }
  }

  if (!pruneCustom) return;

  for (const s of existing) {
    if (defaultNames.has(s.name)) continue;
    if (s._count.items === 0) {
      await db.service.delete({ where: { id: s.id } }).catch(() => {});
    } else {
      await db.service.update({ where: { id: s.id }, data: { active: false } }).catch(() => {});
    }
  }
}
