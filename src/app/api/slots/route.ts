import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSlots } from "@/lib/availability";

const querySchema = z.object({
  staffId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  serviceIds: z.string().min(1),
});

export async function GET(req: Request) {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) return NextResponse.json({ error: "Tham số không hợp lệ" }, { status: 400 });

  const ids = parsed.data.serviceIds.split(",");
  const services = await prisma.service.findMany({ where: { id: { in: ids } } });
  const duration = services.reduce((s, x) => s + x.durationMinutes, 0);
  if (!duration) return NextResponse.json({ error: "Dịch vụ không hợp lệ" }, { status: 400 });

  if (parsed.data.staffId === "ANY") {
    const staffList = await prisma.staff.findMany({
      include: { user: { select: { name: true } } },
    });
    const perStaff = await Promise.all(
      staffList.map(async (st) => {
        const list = await getSlots(st.id, parsed.data.date, duration);
        const openCount = list.filter((x) => x.available).length;
        return { staffId: st.id, staffName: st.user.name, openCount, list };
      })
    );
    // Ưu tiên stylist có nhiều slot rảnh hơn để phân bổ đều lịch hẹn
    perStaff.sort((a, b) => b.openCount - a.openCount);

    const byStart = new Map<
      string,
      { time: string; start: string; available: boolean; assignedStaffId?: string; assignedStaffName?: string }
    >();
    for (const st of perStaff) {
      for (const item of st.list) {
        const existing = byStart.get(item.start);
        if (!existing) {
          byStart.set(item.start, {
            time: item.time,
            start: item.start,
            available: item.available,
            assignedStaffId: item.available ? st.staffId : undefined,
            assignedStaffName: item.available ? st.staffName : undefined,
          });
        } else if (!existing.available && item.available) {
          existing.available = true;
          existing.assignedStaffId = st.staffId;
          existing.assignedStaffName = st.staffName;
        }
      }
    }

    const merged = [...byStart.values()].sort((a, b) => a.start.localeCompare(b.start));
    return NextResponse.json({ duration, slots: merged });
  }

  const slots = await getSlots(parsed.data.staffId, parsed.data.date, duration);
  return NextResponse.json({
    duration,
    slots: slots.map((s) => ({ ...s, assignedStaffId: parsed.data.staffId })),
  });
}
