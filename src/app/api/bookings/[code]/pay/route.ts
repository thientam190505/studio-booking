import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Mô phỏng webhook của cổng thanh toán: khi nhận được thanh toán thành công
 * thì chuyển booking từ PENDING -> CONFIRMED (chỉ khi còn hạn giữ chỗ).
 * Khi tích hợp thật (PayOS/Stripe) chỉ cần thay bằng endpoint webhook có kiểm tra chữ ký.
 */
export async function POST(_: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const booking = await prisma.booking.findUnique({ where: { code } });
  if (!booking) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  if (booking.status === "CONFIRMED") return NextResponse.json({ status: "CONFIRMED" });
  if (booking.status !== "PENDING") {
    return NextResponse.json({ error: "Lịch hẹn không thể thanh toán" }, { status: 409 });
  }
  if (!booking.holdExpiresAt || booking.holdExpiresAt < new Date()) {
    return NextResponse.json({ error: "Hết thời gian giữ chỗ, vui lòng đặt lại" }, { status: 410 });
  }
  await prisma.booking.update({
    where: { code },
    data: { status: "CONFIRMED", holdExpiresAt: null },
  });
  return NextResponse.json({ status: "CONFIRMED" });
}
