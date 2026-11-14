import { prisma } from "../src/lib/prisma";
import { createBooking } from "../src/lib/booking";
import { getSlots } from "../src/lib/availability";

async function main() {
  const staff = await prisma.staff.findFirstOrThrow();
  const svc = await prisma.service.findFirstOrThrow();
  const date = new Date(Date.now() + 2 * 86400_000 + 7 * 3600_000).toISOString().slice(0, 10);
  const slots = await getSlots(staff.id, date, svc.durationMinutes);
  const target = slots.find((s) => s.available);
  if (!target) return console.log("Không có slot (ngày nghỉ?)", date);

  const mk = (n: number) =>
    createBooking({
      serviceIds: [svc.id], staffId: staff.id, start: target.start,
      customerName: "Test " + n, customerPhone: "0900000000", customerEmail: "t@t.com",
    });
  const results = await Promise.allSettled([mk(1), mk(2), mk(3)]);
  const ok = results.filter((r) => r.status === "fulfilled").length;
  console.log(`Race test: ${ok}/3 thành công (kỳ vọng 1)`);
  const after = await getSlots(staff.id, date, svc.durationMinutes);
  console.log("Slot sau khi đặt available =", after.find((s) => s.start === target.start)?.available);
  await prisma.bookingItem.deleteMany(); await prisma.booking.deleteMany();
}
main().finally(() => prisma.$disconnect());
