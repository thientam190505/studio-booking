import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Khách hàng tự hủy lịch hẹn đang PENDING hoặc CONFIRMED để nhả khung giờ ngay lập tức
 * (hữu ích khi khách muốn đổi sang khung giờ hoặc stylist khác).
 */
export async function POST(_: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const booking = await prisma.booking.findUnique({ where: { code } });
  if (!booking) return NextResponse.json({ error: "Không tìm thấy lịch hẹn" }, { status: 404 });
  if (booking.status === "CANCELLED") return NextResponse.json({ status: "CANCELLED" });
  if (booking.status === "COMPLETED") {
    return NextResponse.json({ error: "Lịch hẹn đã hoàn thành, không thể hủy" }, { status: 409 });
  }

  await prisma.booking.update({
    where: { code },
    data: { status: "CANCELLED", holdExpiresAt: null },
  });
  return NextResponse.json({ status: "CANCELLED" });
}
