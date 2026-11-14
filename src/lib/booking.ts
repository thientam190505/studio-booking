import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { BLOCKING_STATUSES, HOLD_MINUTES, overlaps } from "@/lib/availability";

export const createBookingSchema = z.object({
  serviceIds: z.array(z.string()).min(1, "Chọn ít nhất 1 dịch vụ"),
  staffId: z.string().min(1),
  start: z.string().datetime(),
  customerName: z.string().trim().min(2, "Nhập họ tên"),
  customerPhone: z.string().trim().regex(/^(0|\+84)\d{9,10}$/, "SĐT không hợp lệ"),
  customerEmail: z.string().trim().email("Email không hợp lệ"),
});

export class BookingError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const DEPOSIT_RATE = 0.2;

export async function createBooking(input: z.infer<typeof createBookingSchema>) {
  const services = await prisma.service.findMany({
    where: { id: { in: input.serviceIds }, active: true, unavailableReason: "" },
  });
  if (services.length !== new Set(input.serviceIds).size) {
    throw new BookingError("Dịch vụ không hợp lệ hoặc đang tạm ngưng");
  }

  const totalDuration = services.reduce((s, x) => s + x.durationMinutes, 0);
  const totalPrice = services.reduce((s, x) => s + x.price, 0);
  const start = new Date(input.start);
  const end = new Date(start.getTime() + totalDuration * 60_000);
  const now = new Date();
  if (start <= now) throw new BookingError("Không thể đặt giờ trong quá khứ");

  // Transaction: kiểm tra trùng + tạo booking là một khối nguyên tử, tránh race condition
  return prisma.$transaction(async (tx) => {
    const staff = await tx.staff.findUnique({ where: { id: input.staffId } });
    if (!staff) throw new BookingError("Nhân viên không tồn tại", 404);

    const conflicts = await tx.booking.findMany({
      where: {
        staffId: input.staffId,
        status: { in: [...BLOCKING_STATUSES] },
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
    const hasConflict = conflicts.some(
      (b) =>
        (b.status === "CONFIRMED" || (b.holdExpiresAt && b.holdExpiresAt > now)) &&
        overlaps(start, end, b.startTime, b.endTime)
    );
    if (hasConflict) throw new BookingError("Khung giờ này vừa có người đặt, vui lòng chọn giờ khác", 409);

    const off = await tx.timeOff.findFirst({
      where: { staffId: input.staffId, start: { lt: end }, end: { gt: start } },
    });
    if (off) throw new BookingError("Nhân viên nghỉ vào khung giờ này", 409);

    return tx.booking.create({
      data: {
        code: "BK" + randomBytes(3).toString("hex").toUpperCase(),
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail,
        staffId: input.staffId,
        startTime: start,
        endTime: end,
        totalPrice,
        depositAmount: Math.round(totalPrice * DEPOSIT_RATE),
        status: "PENDING",
        holdExpiresAt: new Date(now.getTime() + HOLD_MINUTES * 60_000),
        items: {
          create: services.map((s) => ({
            serviceId: s.id,
            price: s.price,
            duration: s.durationMinutes,
          })),
        },
      },
    });
  });
}
