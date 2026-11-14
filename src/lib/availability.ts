import { prisma } from "@/lib/prisma";

/** Múi giờ cố định của cửa hàng (Việt Nam, UTC+7) để slot không lệch khi deploy trên server UTC. */
export const SHOP_TZ_OFFSET = "+07:00";
export const SLOT_STEP_MINUTES = 30;
export const HOLD_MINUTES = 10;

export const BLOCKING_STATUSES = ["PENDING", "CONFIRMED"] as const;

/** Khoảng [aStart, aEnd) giao với [bStart, bEnd) khi aStart < bEnd && aEnd > bStart */
export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

export function dayStart(date: string) {
  return new Date(`${date}T00:00:00${SHOP_TZ_OFFSET}`);
}

export function slotDate(date: string, minutes: number) {
  return new Date(dayStart(date).getTime() + minutes * 60_000);
}

export function dayOfWeek(date: string) {
  // Lấy thứ theo múi giờ cửa hàng
  return new Date(`${date}T12:00:00${SHOP_TZ_OFFSET}`).getUTCDay();
}

export type Slot = { time: string; start: string; available: boolean };

/**
 * Tính các khung giờ của 1 nhân viên trong 1 ngày cho tổng thời lượng `durationMinutes`.
 * Slot bị khóa nếu: ngoài giờ làm, quá khứ, nghỉ phép, hoặc trùng booking PENDING(còn hạn)/CONFIRMED.
 */
export async function getSlots(
  staffId: string,
  date: string,
  durationMinutes: number,
  now = new Date()
): Promise<Slot[]> {
  const staff = await prisma.staff.findUnique({ where: { id: staffId } });
  if (!staff) return [];

  const workDays = staff.workDays.split(",").map(Number);
  if (!workDays.includes(dayOfWeek(date))) return [];

  const from = dayStart(date);
  const to = new Date(from.getTime() + 24 * 3600_000);

  const [bookings, timeOffs] = await Promise.all([
    prisma.booking.findMany({
      where: {
        staffId,
        status: { in: [...BLOCKING_STATUSES] },
        startTime: { lt: to },
        endTime: { gt: from },
      },
    }),
    prisma.timeOff.findMany({ where: { staffId, start: { lt: to }, end: { gt: from } } }),
  ]);

  const activeBookings = bookings.filter(
    (b) => b.status === "CONFIRMED" || (b.holdExpiresAt && b.holdExpiresAt > now)
  );

  const slots: Slot[] = [];
  for (let m = staff.workStart; m + durationMinutes <= staff.workEnd; m += SLOT_STEP_MINUTES) {
    const start = slotDate(date, m);
    const end = slotDate(date, m + durationMinutes);
    const blocked =
      start <= now ||
      activeBookings.some((b) => overlaps(start, end, b.startTime, b.endTime)) ||
      timeOffs.some((t) => overlaps(start, end, t.start, t.end));
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    slots.push({ time: `${hh}:${mm}`, start: start.toISOString(), available: !blocked });
  }
  return slots;
}
