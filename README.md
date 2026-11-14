# Studio Booking – Hệ thống đặt lịch dịch vụ

Web fullstack đặt lịch hẹn (salon/studio/phòng khám): khách chọn dịch vụ → nhân viên → khung giờ trống theo thời gian thực, cọc online (mô phỏng), admin quản lý lịch, ca làm và doanh thu.

> **Live demo:** https://studio-booking-one-lovat.vercel.app
> - **Chủ quán (`ADMIN`):** `admin@demo.com` / `admin123` (toàn quyền)
> - **3 Thợ (`STAFF`):** `minhanh@demo.com`, `quocbao@demo.com`, `thuha@demo.com` / `staff123` (chỉ thấy lịch & ca làm của riêng mình)

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

**Khách:** chọn nhiều dịch vụ (tự cộng thời lượng) · chọn stylist cụ thể hoặc **tự xếp thợ rảnh** · lịch giờ trống theo thời gian thực (giờ đã đặt bị mờ) · cọc 20% (mô phỏng) · email xác nhận · tra cứu linh hoạt bằng **Mã đặt lịch hoặc SĐT** · tự hủy/đổi lịch nhả slot tức thì.

**Admin (`/admin`):** phân quyền **Chủ tiệm (`ADMIN`)** & **Thợ (`STAFF`)** · dashboard doanh thu/tiền cọc/dịch vụ hot · danh sách lịch theo ngày + đổi trạng thái · **lịch tuần dạng lưới** (lọc theo nhân viên) · CRUD Menu & dịch vụ (sửa giá inline, **tạm ngưng khi hết nguyên liệu**, ẩn/hiện) · giờ làm & ngày nghỉ của nhân viên · nút **Reset lịch test**.

## Tech stack

Next.js (App Router) · TypeScript · TailwindCSS · Prisma ORM · PostgreSQL (Prisma Postgres / Vercel) · Zod · Nodemailer · bcryptjs

## Chạy local

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env (điền DATABASE_URL PostgreSQL)
npx prisma db push       # tạo bảng trên PostgreSQL
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

## Deploy (Vercel + Prisma Postgres)

Dự án đã cấu hình sẵn `provider = "postgresql"` trong `prisma/schema.prisma`, `postinstall: prisma generate` trong `package.json`, và chạy thực tế trên **Vercel** kết hợp **Prisma Postgres** với biến môi trường `DATABASE_URL` + `AUTH_SECRET`. Chi tiết vận hành xem tại [`HUONG_DAN_SU_DUNG.md`](HUONG_DAN_SU_DUNG.md).

## Hướng phát triển

Tích hợp PayOS/Stripe thật với kiểm tra chữ ký webhook · rate limit endpoint đặt lịch · nhắc lịch qua email trước giờ hẹn.
