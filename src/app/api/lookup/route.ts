import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ code: z.string().trim().min(3), phone: z.string().trim().min(8) });

/** Tra cứu lịch hẹn: cần cả mã đặt chỗ và SĐT để tránh lộ thông tin người khác. */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Nhập mã và SĐT" }, { status: 400 });
  const b = await prisma.booking.findUnique({ where: { code: parsed.data.code.toUpperCase() } });
  if (!b || b.customerPhone !== parsed.data.phone) {
    return NextResponse.json({ error: "Không tìm thấy lịch hẹn" }, { status: 404 });
  }
  return NextResponse.json({ code: b.code });
}
