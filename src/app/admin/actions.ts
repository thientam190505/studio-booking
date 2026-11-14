"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { dayStart } from "@/lib/availability";
import { sendBookingConfirmation } from "@/lib/email";
import { z } from "zod";
import { clearSessionCookie, requireAdmin, requireStaffOrAdmin, setSessionCookie } from "@/lib/auth";

export async function login(_: string | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email }, include: { staff: true } });
  const allowedRole = user && (user.role === "ADMIN" || user.role === "STAFF");
  const ok = allowedRole && (await bcrypt.compare(password, user.passwordHash));
  if (!user || !ok) return "Sai email hoặc mật khẩu";
  await setSessionCookie({
    userId: user.id,
    role: user.role,
    name: user.name,
    staffId: user.staff?.id,
  });
  redirect("/admin");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/admin/login");
}

const TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
};

export async function updateBookingStatus(id: string, status: string) {
  const session = await requireStaffOrAdmin();
  const b = await prisma.booking.findUnique({ where: { id } });
  if (!b || !TRANSITIONS[b.status]?.includes(status)) return;
  // Thợ chỉ được cập nhật trạng thái lịch hẹn của chính mình
  if (session.role === "STAFF" && b.staffId !== session.staffId) return;
  await prisma.booking.update({
    where: { id },
    data: { status, holdExpiresAt: status === "CONFIRMED" ? null : b.holdExpiresAt },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/calendar");
  if (status === "CONFIRMED") await sendBookingConfirmation(b.code);
}

/** Xoá toàn bộ lịch hẹn test để mở lại tất cả slot trống (tiện khi demo/test nhiều lần). */
export async function resetTestBookings() {
  await requireStaffOrAdmin();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  revalidatePath("/admin");
  revalidatePath("/admin/calendar");
  revalidatePath("/book");
}

// ---------- Dịch vụ (Chỉ ADMIN) ----------
const serviceSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().default(""),
  price: z.coerce.number().int().min(0),
  durationMinutes: z.coerce.number().int().min(15).max(480),
});

export async function createService(formData: FormData) {
  await requireAdmin();
  const parsed = serviceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await prisma.service.create({ data: parsed.data });
  revalidatePath("/admin/services");
}

export async function toggleService(id: string) {
  await requireAdmin();
  const s = await prisma.service.findUnique({ where: { id } });
  if (!s) return;
  await prisma.service.update({ where: { id }, data: { active: !s.active } });
  revalidatePath("/admin/services");
}

// ---------- Nhân viên & nghỉ phép (ADMIN hoặc chính STAFF đó) ----------
const timeOffSchema = z.object({
  staffId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().trim().default(""),
});

/** Cho nghỉ cả ngày (theo múi giờ cửa hàng). */
export async function createTimeOff(formData: FormData) {
  const session = await requireStaffOrAdmin();
  const parsed = timeOffSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  if (session.role === "STAFF" && parsed.data.staffId !== session.staffId) return;
  const start = dayStart(parsed.data.date);
  await prisma.timeOff.create({
    data: {
      staffId: parsed.data.staffId,
      start,
      end: new Date(start.getTime() + 24 * 3600_000),
      reason: parsed.data.reason,
    },
  });
  revalidatePath("/admin/staff");
}

export async function deleteTimeOff(id: string) {
  const session = await requireStaffOrAdmin();
  const t = await prisma.timeOff.findUnique({ where: { id } });
  if (!t) return;
  if (session.role === "STAFF" && t.staffId !== session.staffId) return;
  await prisma.timeOff.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/staff");
}

const hoursSchema = z.object({
  staffId: z.string().min(1),
  workStart: z.string().regex(/^\d{2}:\d{2}$/),
  workEnd: z.string().regex(/^\d{2}:\d{2}$/),
});
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));

export async function updateStaffHours(formData: FormData) {
  const session = await requireStaffOrAdmin();
  const parsed = hoursSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  if (session.role === "STAFF" && parsed.data.staffId !== session.staffId) return;
  const workStart = toMin(parsed.data.workStart);
  const workEnd = toMin(parsed.data.workEnd);
  if (workEnd <= workStart) return;
  await prisma.staff.update({ where: { id: parsed.data.staffId }, data: { workStart, workEnd } });
  revalidatePath("/admin/staff");
}
