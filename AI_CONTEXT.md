# AI_CONTEXT.md — Toàn bộ Ngữ cảnh Dự án dành cho AI Agent

> **Mục đích file này:** Giúp bất kỳ AI Assistant / Coding Agent nào (Antigravity, Claude Code, Cursor, Copilot...) khi mới mở repo hoặc mất ngữ cảnh hội thoại có thể đọc **1 file duy nhất** là nắm ngay: dự án làm gì, kiến trúc ra sao, đã làm những gì, các quy ước thiết kế & nghiệp vụ cần giữ nguyên, và cách sửa → kiểm tra → cập nhật lên web thật.

---

## 1. Tổng quan & Đường dẫn Live

* **Tên dự án:** **Studio Booking** — Hệ thống đặt lịch dịch vụ tiệm tóc & chăm sóc da đầu (Hair & Scalp Studio) Fullstack.
* **Mục đích của chủ repo (Thiện Tâm):** Dự án chuẩn CV đưa vào hồ sơ xin việc (nhấn mạnh thuật toán tránh trùng lịch trong transaction, giữ chỗ 10 phút, RBAC, phân bổ thợ rảnh, chạy thật trên cloud).
* **Live Production (Vercel):** `https://studio-booking-one-lovat.vercel.app`
* **Kho mã nguồn (GitHub):** `https://github.com/thientam190505/studio-booking` (nhánh `main` đồng bộ tự động với Vercel).
* **Database Production:** **Prisma Postgres** (PostgreSQL tích hợp trong Vercel Storage; không dùng SQLite khi deploy).
* **Tài khoản Demo:**
  * Chủ tiệm (`ADMIN`): `admin@demo.com` / `admin123` (toàn quyền).
  * 3 Thợ (`STAFF`): `minhanh@demo.com`, `quocbao@demo.com`, `thuha@demo.com` / `staff123` (chỉ thấy lịch & ca làm của riêng mình).

---

## 2. Kiến trúc hệ thống & Lý do thiết kế

```text
[Trình duyệt Khách / Chủ / Thợ]
        │  HTTPS
        ▼
[Vercel (Next.js 16.4.6 App Router — SSR + API Routes + Server Actions)]
        │  Prisma Client (@prisma/client) + DATABASE_URL
        ▼
[Prisma Postgres (Cloud PostgreSQL)]
```

* **Không phải web HTML tĩnh (`index.html` / GitHub Pages):** Toàn bộ trang chủ `/`, luồng đặt lịch `/book`, tra cứu `/lookup` và quản trị `/admin` cần server backend xử lý Transaction chống trùng lịch, tính slot trống theo thời gian thực và bảo mật `DATABASE_URL` + `AUTH_SECRET`.
* **Mỗi lần `git push origin main`:** GitHub gửi webhook → Vercel tự chạy `npm install` (`postinstall: prisma generate`) → `next build` → cập nhật `https://studio-booking-one-lovat.vercel.app` trong ~1 phút mà không làm mất dữ liệu Database.
* **Biến môi trường (KHÔNG đưa lên Git, nằm trong `.env` local & Vercel Settings):**
  * `DATABASE_URL`: Chuỗi kết nối `postgres://...` tới Prisma Postgres.
  * `AUTH_SECRET`: Khóa bí mật ký session cookie HMAC-SHA256.
  * *(Tùy chọn)* `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`: Nếu thiếu, email xác nhận ghi log console thay vì gửi SMTP thật.
  * **GitHub Secrets:** Đã lưu `DATABASE_URL` để chạy GitHub Action `.github/workflows/reset-demo.yml`.

---

## 3. Những gì ĐÃ LÀM XONG (Không làm lại trừ khi user yêu cầu đổi)

### A. Giao diện & Thẩm mỹ (`Warm Minimalist Hair Salon`)
* Palette sáng ấm dễ nhìn, tương phản cao (`text-stone-950`, nền kem/trắng `#faf6ef`), giữ `color-scheme: light`.
* Hiệu ứng CSS compositor mượt (`reveal-up`, `card-interactive`, `btn-interactive`, `float-glow`) trong `src/app/globals.css`.
* Header điều hướng chung `src/components/SiteHeader.tsx` và Footer thông tin cá nhân của tác giả **Thiện Tâm** (Facebook, TikTok, Gmail, SĐT) trong `src/app/layout.tsx` — **giữ nguyên footer này khi chỉnh sửa UI**.

### B. Luồng Khách hàng (Public)
1. **Trang chủ (`src/app/page.tsx`):** Hiển thị Menu dịch vụ nhóm theo danh mục, giá VND, thời lượng, trạng thái *"Tạm ngưng"* + lý do hết đồ nếu có, danh sách Stylist & ca làm việc. Tự gọi `ensureDefaultMenu()` nếu menu rỗng.
2. **Đặt lịch (`src/app/book/page.tsx` + `/api/slots` + `/api/bookings`):**
   * Chọn **nhiều dịch vụ cùng lúc**, tự cộng tổng `durationMinutes` và tính tiền cọc 20% (`DEPOSIT_RATE = 0.2`).
   * Chọn **đích danh Stylist** hoặc chọn **"Tự xếp thợ rảnh"** (`staffId="ANY"` trong `src/app/api/slots/route.ts` — gộp slot các thợ và gán `assignedStaffId` theo thợ có nhiều slot trống nhất).
   * Gửi form tạo booking `PENDING`, giữ chỗ `HOLD_MINUTES = 10` phút.
3. **Phiếu đặt lịch & Cọc / Hủy (`src/app/booking/[code]/page.tsx`, `PayButton.tsx`, `/api/bookings/[code]/pay`, `/api/bookings/[code]/cancel`):**
   * Khách bấm **Thanh toán cọc 20% (thử nghiệm)** → chuyển `CONFIRMED`, xóa `holdExpiresAt`, kích hoạt gửi email xác nhận (`sendBookingConfirmation`).
   * Khách có thể tự hủy lịch / hủy giữ chỗ ngay để giải phóng khung giờ.
4. **Tra cứu linh hoạt (`src/app/lookup/page.tsx`, `POST /api/lookup`):**
   * Cho phép nhập **Mã đặt lịch (`#BK...`) HOẶC Số điện thoại** để xem tất cả lịch hẹn liên quan, thanh toán cọc hoặc hủy lịch.

### C. Luồng Quản trị & Phân quyền (`RBAC`)
* **Xác thực (`src/lib/auth.ts`):** Cookie `session` (`httpOnly`) ký HMAC-SHA256, `MAX_AGE = 8 giờ`. Kiểm tra server-side qua `getSession()`, `requireAdmin()`, `requireStaffOrAdmin()`.
* **`/admin/login`:** Hỗ trợ đăng nhập email/mật khẩu + nút điền nhanh tài khoản Demo (1 Admin + 3 Staff) để nhà tuyển dụng test nhanh.
* **`/admin` (`src/app/admin/page.tsx`):**
  * `ADMIN`: xem KPI doanh thu, tiền cọc, dịch vụ phổ biến, toàn bộ lịch hẹn, đổi trạng thái (`PENDING -> CONFIRMED/CANCELLED`, `CONFIRMED -> COMPLETED/CANCELLED`), nút **`Reset lịch test`** và nút **`Khôi phục mẫu gốc`**.
  * `STAFF`: chỉ thấy lịch hẹn của riêng `session.staffId` (không thấy doanh thu toàn tiệm hay nút của Admin).
* **`/admin/calendar`:** Lịch tuần 7 ngày dạng lưới (Admin lọc theo thợ; Staff chỉ xem lịch của mình).
* **`/admin/services` (`ADMIN` only):** CRUD dịch vụ, sửa giá/thời lượng/danh mục inline (`ServiceItemCard.tsx`), bật/tắt **Báo hết đồ / Tạm ngưng** kèm lý do, ẩn/hiện món, và nút **`Khôi phục Menu gốc`**.
* **`/admin/staff`:** Chỉnh ca làm (`workStart`, `workEnd`, `workDays`) và thêm/xóa ngày nghỉ phép (`TimeOff`).

### D. Cơ chế Chống phá & Tự hồi sinh dữ liệu Demo
1. **Tự động hồi sinh (`src/lib/demo-seed.ts` → `ensureDefaultMenu()`):** Chạy ở `src/app/page.tsx` và `GET /api/catalog`. Nếu toàn bộ dịch vụ đang mở bán bị xóa/ẩn về `0`, tự động khôi phục 5 dịch vụ mẫu gốc (`DEFAULT_SERVICES`).
2. **Nút 1-click trong Admin (`src/app/admin/actions.ts`):**
   * `restoreDemoMenu` (`/admin/services`): khôi phục 5 món mẫu gốc về giá/thời lượng/trạng thái mở bán ban đầu, dọn dịch vụ phát sinh chưa có booking.
   * `resetFullDemo` (`/admin`): xóa toàn bộ `BookingItem`, `Booking`, `TimeOff`, đưa ca làm 3 thợ về `09:00–18:00` (`540..1080`, `"0,1,2,3,4,5,6"`) và khôi phục 5 món mẫu.
3. **GitHub Actions (`.github/workflows/reset-demo.yml`):** Workflow thủ công (`workflow_dispatch` tên **Reset Demo Database**) trên tab Actions của GitHub, chạy `npx prisma db push && npm run seed` với `${{ secrets.DATABASE_URL }}`.

---

## 4. Bản đồ File Chính

```text
.github/workflows/reset-demo.yml   Workflow Reset Demo Database trên GitHub Actions
prisma/
  schema.prisma                    6 model PostgreSQL: User, Service, Staff, TimeOff, Booking, BookingItem
  seed.ts                          Dữ liệu mẫu gốc (1 Admin, 3 Staff, dùng DEFAULT_SERVICES từ src/lib/demo-seed.ts)
src/
  components/SiteHeader.tsx        Header + điều hướng dùng chung
  lib/
    prisma.ts                      PrismaClient singleton
    availability.ts                Logic tính slot trống: SHOP_TZ_OFFSET="+07:00", SLOT_STEP_MINUTES=30, HOLD_MINUTES=10, overlaps(), getSlots()
    booking.ts                     createBooking() dùng prisma.$transaction chống race condition, createBookingSchema (Zod)
    auth.ts                        HMAC-SHA256 token & RBAC guards (requireAdmin, requireStaffOrAdmin)
    demo-seed.ts                   DEFAULT_SERVICES, ensureDefaultMenu(), restoreMenuToDefault()
    email.ts                       sendBookingConfirmation() (Nodemailer hoặc console fallback)
    format.ts                      Định dạng tiền VND & ngày giờ VN
  app/
    layout.tsx                     Root layout + Ambient background + Footer Thiện Tâm
    globals.css                    Tailwind v4 + animation classes
    page.tsx                       Trang chủ & Menu dịch vụ
    book/page.tsx                  Wizard đặt lịch 4 bước
    booking/[code]/page.tsx        Phiếu hẹn, PayButton.tsx, nút hủy
    lookup/page.tsx                Tra cứu theo Mã hoặc SĐT
    admin/                         Dashboard, calendar, services, staff, login, actions.ts, AdminNav.tsx
    api/                           catalog, slots, bookings, bookings/[code]/pay, bookings/[code]/cancel, lookup
scripts/
  race-test.ts                     Test 3 request song song cùng 1 slot (đúng 1/3 thành công)
  smoke-admin.ts                   Test RBAC ANON / STAFF / ADMIN (hỗ trợ env BASE_URL)
tests/
  unit.test.ts                     Unit test overlaps, dayOfWeek, slotDate (+07:00), HMAC token
```

---

## 5. Nguyên tắc BẤT DI BẤT DỊCH khi AI Agent cập nhật code sau này

1. **Giữ nguyên logic lõi & múi giờ:** Không làm hỏng `prisma.$transaction` check trùng lịch trong `src/lib/booking.ts` và múi giờ `SHOP_TZ_OFFSET = "+07:00"` trong `src/lib/availability.ts`.
2. **PostgreSQL only trên `prisma/schema.prisma`:** `provider = "postgresql"`, giữ `postinstall: "prisma generate"` trong `package.json` để Vercel build không lỗi. Không lưu `.env` hay secret thật vào Git.
3. **Không làm mất liên hệ tác giả:** Giữ nguyên footer của **Thiện Tâm** trong `src/app/layout.tsx` và giao diện sáng tương phản cao (`color-scheme: light`).
4. **Kiểm tra bắt buộc trước khi `git push`:**
   ```powershell
   npx tsc --noEmit
   npx eslint src scripts tests
   npm test
   npm run build
   ```
   *(Nếu test API live: dùng `BASE_URL=https://studio-booking-one-lovat.vercel.app npm run smoke:admin`. Lưu ý `npm run test:race` xóa toàn bộ booking trong DB nên hãy chạy lại `npm run seed` sau khi chạy `test:race`.)*
5. **Môi trường phát triển trên máy chủ repo (Windows):** Các tool dev nằm tại `D:\Antigravity\Tool\` (`NodeJS`, `Git`, `Python`). Chủ repo giao tiếp tiếng Việt, thích giải thích ngắn gọn, rõ ràng, dễ hiểu (phong cách cho người mới) và tự chạy kiểm tra đầy đủ trước khi báo kết quả.
