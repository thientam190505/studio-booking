import { test } from "node:test";
import assert from "node:assert/strict";
import { overlaps, dayOfWeek, slotDate } from "../src/lib/availability";
import { createToken, verifyToken } from "../src/lib/auth";

process.env.AUTH_SECRET = "test-secret";

const d = (s: string) => new Date(s);

test("overlaps: giao nhau, liền kề và tách rời", () => {
  assert.equal(overlaps(d("2026-01-01T10:00Z"), d("2026-01-01T11:00Z"), d("2026-01-01T10:30Z"), d("2026-01-01T11:30Z")), true);
  // Liền kề (kết thúc đúng lúc bắt đầu) KHÔNG tính là trùng
  assert.equal(overlaps(d("2026-01-01T10:00Z"), d("2026-01-01T11:00Z"), d("2026-01-01T11:00Z"), d("2026-01-01T12:00Z")), false);
  // Bao trùm hoàn toàn
  assert.equal(overlaps(d("2026-01-01T09:00Z"), d("2026-01-01T13:00Z"), d("2026-01-01T10:00Z"), d("2026-01-01T11:00Z")), true);
  assert.equal(overlaps(d("2026-01-01T08:00Z"), d("2026-01-01T09:00Z"), d("2026-01-01T10:00Z"), d("2026-01-01T11:00Z")), false);
});

test("dayOfWeek theo múi giờ cửa hàng", () => {
  assert.equal(dayOfWeek("2026-11-14"), 6); // Thứ Bảy
  assert.equal(dayOfWeek("2026-11-15"), 0); // Chủ Nhật
});

test("slotDate: 09:00 giờ VN = 02:00 UTC", () => {
  assert.equal(slotDate("2026-11-14", 540).toISOString(), "2026-11-14T02:00:00.000Z");
});

test("token: hợp lệ, bị sửa, hết hạn", () => {
  const t = createToken({ userId: "u1", role: "ADMIN", name: "A" });
  assert.equal(verifyToken(t)?.role, "ADMIN");
  const [p, sig] = t.split(".");
  const forged = Buffer.from(JSON.stringify({ userId: "u1", role: "ADMIN", name: "A", exp: Date.now() + 1e9 })).toString("base64url");
  assert.equal(verifyToken(`${forged}.${sig}`), null);
  assert.equal(verifyToken(`${p}.xxx`), null);
  assert.equal(verifyToken(undefined), null);
});
