# Studio Booking – Hệ thống đặt lịch dịch vụ

Web fullstack đặt lịch hẹn (salon/studio/phòng khám): khách chọn dịch vụ → nhân viên → khung giờ trống theo thời gian thực, cọc online (mô phỏng), admin quản lý lịch, ca làm và doanh thu.

> **Live demo:** _(thêm link Vercel sau khi deploy)_ · **Admin demo:** `admin@demo.com` / `admin123`

## Điểm kỹ thuật nổi bật

| Bài toán | Cách giải quyết |
| --- | --- |
| **Trùng lịch** | Kiểm tra giao khoảng `start < otherEnd && end > otherStart` ngay trong **transaction** cùng lúc tạo booking ([`src/lib/booking.ts`](src/lib/booking.ts)). |
| **Race condition** | 3 request đặt cùng 1 slot song song → đúng 1 thành công (`npm run test:race`). |
| **Giữ chỗ** | Booking `PENDING` giữ slot 10 phút, hết hạn tự nhả slot; chỉ `CONFIRMED` mới khóa vĩnh viễn. |
| **Thanh toán / Webhook** | Endpoint `/api/bookings/[code]/pay` mô phỏng webhook cổng thanh toán: `PENDING → CONFIRMED` và gửi email. Dễ thay bằng PayOS/Stripe thật. |
| **Phân quyền (RBAC)** | Session cookie `httpOnly` ký HMAC-SHA256; mọi trang & server action admin đều kiểm tra role phía server. |
| **Múi giờ** | Cố định `UTC+7` cho cửa hàng, nên slot không lệch khi deploy trên server UTC. |
| **State machine** | Admin chỉ đổi trạng thái hợp lệ: chờ cọc → xác nhận → hoàn thành / hủy. |

## Tính năng

**Khách:** chọn nhiều dịch vụ (tự cộng thời lượng) · chọn nhân viên · lịch giờ trống (giờ đã đặt bị mờ) · cọc 20% · email xác nhận · tra cứu lịch bằng mã + SĐT.

**Admin (`/admin`):** dashboard doanh thu/tiền cọc/dịch vụ hot · danh sách lịch theo ngày + đổi trạng thái · **lịch tuần dạng lưới** (lọc theo nhân viên) · CRUD dịch vụ (ẩn/hiện) · giờ làm & ngày nghỉ của nhân viên.

## Tech stack

Next.js (App Router) · TypeScript · TailwindCSS · Prisma ORM · SQLite (dev) · Zod · Nodemailer · bcryptjs

## Chạy local

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
npx prisma db push       # tạo dev.db
npm run seed             # dữ liệu mẫu + tài khoản admin
npm run dev              # http://localhost:3000
```

| Script | Mô tả |
| --- | --- |
| `npm test` | Unit test (overlap, múi giờ, token) |
| `npm run test:race` | Test đặt trùng song song |
| `npm run smoke:admin` | Smoke test phân quyền các trang admin (cần dev server đang chạy) |

## Cấu trúc

```
prisma/            schema + seed
src/lib/           availability (thuật toán slot), booking (transaction), auth, email
src/app/api/       catalog, slots, bookings, lookup
src/app/book       luồng đặt lịch của khách
src/app/admin/     dashboard, calendar, services, staff
tests/ scripts/    unit test, race test, smoke test
```

## Deploy (Vercel)

SQLite là file nên **không bền trên Vercel**. Khi deploy: tạo Postgres miễn phí (Neon/Supabase), đổi `provider = "postgresql"` trong `prisma/schema.prisma`, đặt `DATABASE_URL`, `AUTH_SECRET` trong Environment Variables rồi `prisma db push` + `npm run seed`.

## Hướng phát triển

Tích hợp PayOS/Stripe thật với kiểm tra chữ ký webhook · rate limit endpoint đặt lịch · tự chọn "bất kỳ nhân viên rảnh" · nhắc lịch qua email trước giờ hẹn.
