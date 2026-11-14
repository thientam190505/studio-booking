import { createToken } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

/** Smoke test phân quyền (ANON, STAFF, ADMIN) trên dev server đang chạy. */
async function main() {
  const admin = await prisma.user.findFirstOrThrow({ where: { role: "ADMIN" } });
  const staffUser = await prisma.user.findFirstOrThrow({ where: { role: "STAFF" }, include: { staff: true } });

  const adminCookie = "session=" + createToken({ userId: admin.id, role: "ADMIN", name: admin.name });
  const staffCookie =
    "session=" +
    createToken({
      userId: staffUser.id,
      role: "STAFF",
      name: staffUser.name,
      staffId: staffUser.staff?.id,
    });

  const base = process.env.BASE_URL ?? "http://localhost:3000";
  for (const path of ["/admin", "/admin/calendar", "/admin/services", "/admin/staff", "/lookup"]) {
    const anon = await fetch(base + path, { redirect: "manual" });
    const staffRes = await fetch(base + path, { headers: { cookie: staffCookie }, redirect: "manual" });
    const adminRes = await fetch(base + path, { headers: { cookie: adminCookie }, redirect: "manual" });
    console.log(
      path.padEnd(18),
      "anon:",
      anon.status,
      "| staff:",
      staffRes.status,
      "| admin:",
      adminRes.status
    );
  }
}
main().finally(() => prisma.$disconnect());
