"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie, requireAdmin, setSessionCookie } from "@/lib/auth";

export async function login(_: string | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user && user.role === "ADMIN" && (await bcrypt.compare(password, user.passwordHash));
  if (!user || !ok) return "Sai email hoặc mật khẩu";
  await setSessionCookie({ userId: user.id, role: user.role, name: user.name });
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
  await requireAdmin();
  const b = await prisma.booking.findUnique({ where: { id } });
  if (!b || !TRANSITIONS[b.status]?.includes(status)) return;
  await prisma.booking.update({
    where: { id },
    data: { status, holdExpiresAt: status === "CONFIRMED" ? null : b.holdExpiresAt },
  });
  revalidatePath("/admin");
}
