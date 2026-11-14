import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  code: z.string().optional().default(""),
  phone: z.string().optional().default(""),
});

/** Tra cứu lịch hẹn linh hoạt bằng Mã đặt lịch HOẶC Số điện thoại (hoặc cả hai). */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu tra cứu không hợp lệ" }, { status: 400 });
  }

  const code = parsed.data.code.trim().replace(/^#/, "").toUpperCase();
  const phone = parsed.data.phone.trim();

  if (!code && !phone) {
    return NextResponse.json(
      { error: "Vui lòng nhập Mã đặt lịch hoặc Số điện thoại để tra cứu" },
      { status: 400 }
    );
  }
  if (code && !phone && code.length < 3) {
    return NextResponse.json({ error: "Mã đặt lịch cần ít nhất 3 ký tự" }, { status: 400 });
  }
  if (phone && !code && phone.length < 8) {
    return NextResponse.json({ error: "Số điện thoại cần ít nhất 8 chữ số" }, { status: 400 });
  }

  const bookings = await prisma.booking.findMany({
    where: {
      ...(code ? { code } : {}),
      ...(phone ? { customerPhone: phone } : {}),
    },
    orderBy: { startTime: "desc" },
    take: 10,
    include: {
      staff: { include: { user: { select: { name: true } } } },
      items: { include: { service: { select: { name: true } } } },
    },
  });

  if (bookings.length === 0) {
    return NextResponse.json({ error: "Không tìm thấy lịch hẹn phù hợp" }, { status: 404 });
  }

  return NextResponse.json({
    code: bookings[0].code,
    bookings: bookings.map((b) => ({
      code: b.code,
      status: b.status,
      startTime: b.startTime,
      endTime: b.endTime,
      totalPrice: b.totalPrice,
      depositAmount: b.depositAmount,
      customerName: b.customerName,
      customerPhone: b.customerPhone,
      staffName: b.staff.user.name,
      services: b.items.map((i) => i.service.name),
    })),
  });
}
