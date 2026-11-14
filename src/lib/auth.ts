import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "session";
const MAX_AGE = 60 * 60 * 8; // 8 giờ

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET chưa được cấu hình");
  return s;
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export type Session = { userId: string; role: string; name: string };

export function createToken(s: Session) {
  const payload = Buffer.from(JSON.stringify({ ...s, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token?: string): Session | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const data = JSON.parse(Buffer.from(payload, "base64url").toString());
  if (data.exp < Date.now()) return null;
  return { userId: data.userId, role: data.role, name: data.name };
}

export async function getSession() {
  return verifyToken((await cookies()).get(COOKIE)?.value);
}

/** Dùng trong trang/server action của khu vực admin (RBAC). */
export async function requireAdmin() {
  const s = await getSession();
  if (!s || s.role !== "ADMIN") redirect("/admin/login");
  return s;
}

export async function setSessionCookie(s: Session) {
  (await cookies()).set(COOKIE, createToken(s), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(COOKIE);
}
