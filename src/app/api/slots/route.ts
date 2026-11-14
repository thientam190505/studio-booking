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

  const slots = await getSlots(parsed.data.staffId, parsed.data.date, duration);
  return NextResponse.json({ duration, slots });
}
