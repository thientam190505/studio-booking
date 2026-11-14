import { createToken } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

/** Smoke test các trang admin trên dev server đang chạy (tạo token hợp lệ bằng AUTH_SECRET trong .env). */
async function main() {
  const admin = await prisma.user.findFirstOrThrow({ where: { role: "ADMIN" } });
  const cookie = "session=" + createToken({ userId: admin.id, role: "ADMIN", name: admin.name });
  const base = process.env.BASE_URL ?? "http://localhost:3000";
  for (const path of ["/admin", "/admin/calendar", "/admin/services", "/admin/staff", "/lookup"]) {
    const anon = await fetch(base + path, { redirect: "manual" });
    const authed = await fetch(base + path, { headers: { cookie }, redirect: "manual" });
    console.log(path.padEnd(18), "anon:", anon.status, "| admin:", authed.status);
  }
}
main().finally(() => prisma.$disconnect());
