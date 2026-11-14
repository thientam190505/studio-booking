# HƯỚNG DẪN SỬ DỤNG & VẬN HÀNH — STUDIO BOOKING

Tài liệu hướng dẫn chi tiết cách mở web, ưu điểm hệ thống, cách dùng cho từng vai trò, cách vận hành Database và cách đẩy code lên GitHub.

---

## 1. Tại sao không thấy file `index.html` & Cách mở Web 1-Click

Đây là ứng dụng **Web Fullstack động (Next.js App Router + API + Database SQLite)** chứ không phải trang web HTML tĩnh đơn thuần:
- Trang chủ thực tế nằm ở `src/app/page.tsx` (tự động đọc menu dịch vụ, giá tiền, trạng thái tạm ngưng và danh sách stylist trực tiếp từ Database mỗi lần bạn tải trang).
- Nếu chỉ mở file `.html` bằng trình duyệt, không thể lưu lịch hẹn vào Database, không kiểm tra trùng giờ theo thời gian thực và không thể đăng nhập Quản trị được.

### Cách mở web nhanh nhất (1-Click):
* **Cách 1 (Khuyên dùng):** Nhấp đúp vào file **`CHAY_WEB.bat`** (nằm ở cả `booking-platform\CHAY_WEB.bat` lẫn thư mục ngoài).
  - File này sẽ tự động kiểm tra `.env`, tự tạo Database `prisma/dev.db` + dữ liệu mẫu nếu thiếu, tự mở trình duyệt vào **`http://localhost:3000`** và giữ server chạy.
  - **Lưu ý:** Trong lúc dùng web, hãy giữ cửa sổ màu đen đang chạy nền (nếu tắt cửa sổ đó là tắt web).
* **Cách 2 (Mở bằng Terminal/VS Code):**
  ```powershell
  cd booking-platform
  npm run dev
  ```
  Sau đó mở trình duyệt truy cập **`http://localhost:3000`**.

---

## 2. Ưu điểm nổi bật của Web (Điểm mạnh đưa vào CV / Bảo vệ đồ án)

1. **Chống trùng lịch tuyệt đối (Zero Double-Booking / Race Condition Safe):**
   - Kiểm tra giao khoảng thời gian `start < otherEnd && end > otherStart` ngay bên trong **Database Transaction (`prisma.$transaction`)** tại `src/lib/booking.ts`.
   - Nếu 3 người bấm đặt cùng 1 stylist vào cùng 1 khung giờ trong cùng mili-giây (`npm run test:race`), hệ thống đảm bảo **chỉ duy nhất 1 người thành công**, 2 người còn lại nhận cảnh báo `409 Conflict` và tự tải lại slot mới nhất.
2. **Cơ chế giữ chỗ thông minh 10 phút:**
   - Khi khách bấm đặt, slot được tạm giữ trong 10 phút (`PENDING`, `holdExpiresAt`). Hết 10 phút chưa thanh toán cọc hoặc khách bấm tự hủy, khung giờ tự động nhả ra cho người khác mà không làm "chết" lịch của tiệm.
3. **Tính thời lượng Combo & Tự xếp Stylist rảnh:**
   - Chọn nhiều dịch vụ cùng lúc sẽ tự cộng tổng thời gian (`durationMinutes`) để khóa đủ số block 30 phút liên tiếp.
   - Khách có thể chọn đích danh Stylist quen hoặc chọn **"Tự xếp thợ rảnh"** (`staffId = "ANY"` ở `/api/slots`) để hệ thống gộp giờ trống và tự phân bổ stylist đang rảnh nhất.
4. **Phân quyền RBAC chặt chẽ (`ADMIN` vs `STAFF`):**
   - Session dùng cookie `httpOnly` ký **HMAC-SHA256** (`src/lib/auth.ts`), kiểm tra quyền hoàn toàn phía server (`requireAdmin`, `requireStaffOrAdmin`).
   - Chủ tiệm (`ADMIN`) xem toàn bộ doanh thu, lịch tuần, chỉnh Menu/giá; 3 Stylist (`STAFF`) đăng nhập tài khoản riêng chỉ thấy đúng lịch hẹn và ca làm của chính mình — tuyệt đối không nhìn nhầm lịch người khác.
5. **Quản lý Menu thực tế cho tiệm Salon:**
   - Hỗ trợ thêm món mới, sửa giá/thời lượng ngay trên danh sách, ẩn/hiện món, và nút **"Báo hết đồ / Tạm ngưng"** kèm lý do hiển thị trực tiếp cho khách (ví dụ: *"Hết dầu gội thảo dược"*).
6. **Xử lý múi giờ Việt Nam (`UTC+7`) chuẩn xác:**
   - Cố định `+07:00` (`SHOP_TZ_OFFSET`), nên khi deploy lên server đám mây ở Mỹ/Singapore (UTC), lịch hẹn không bao giờ bị lệch giờ.

---

## 3. Hướng dẫn sử dụng theo từng vai trò

### A. Dành cho Khách hàng (Không cần đăng nhập)
| Chức năng | Đường dẫn | Cách thao tác |
| --- | --- | --- |
| **Xem trang chủ & Menu** | `/` (`http://localhost:3000`) | Xem bảng dịch vụ, giá tiền, trạng thái mở bán/tạm ngưng và ca làm của các stylist. |
| **Đặt lịch hẹn** | `/book` | 1. Tích chọn 1 hoặc nhiều dịch vụ.<br>2. Chọn **Tự xếp thợ rảnh** hoặc chọn riêng 1 Stylist (Minh Anh / Quốc Bảo / Thu Hà) + chọn ngày (có nút **Chọn ngày mai** để test đủ slot 09:00–17:30).<br>3. Chọn khung giờ còn trống (giờ quá khứ hoặc đã có khách tự động bị gạch khóa).<br>4. Điền Họ tên, SĐT (`0...` hoặc `+84...`), Email và bấm **Xác nhận đặt lịch**. |
| **Xác nhận cọc hoặc Tự hủy** | `/booking/[MÃ_LỊCH]` | Sau khi đặt, hệ thống chuyển sang phiếu hẹn:<br>- Bấm **Thanh toán cọc 20% (thử nghiệm)** để chuyển sang `CONFIRMED` và kích hoạt gửi email xác nhận.<br>- Hoặc bấm **Hủy giữ chỗ / Hủy lịch hẹn này** để nhả khung giờ ngay lập tức nếu muốn chọn giờ khác. |
| **Tra cứu lịch hẹn** | `/lookup` | Chỉ cần nhập **Mã đặt lịch** (ví dụ `BK1A2B3C`) **HOẶC** nhập **Số điện thoại** đã đặt (không cần nhớ mã) để xem toàn bộ lịch hẹn, thanh toán cọc hoặc hủy lịch. |

### B. Dành cho Chủ tiệm & Stylist (`/admin` hoặc `/admin/login`)

**Bảng tài khoản Demo có sẵn (chọn nhanh 1-click ngay trên màn hình đăng nhập):**

| Vai trò | Họ tên | Email đăng nhập | Mật khẩu | Quyền hạn |
| --- | --- | --- | --- | --- |
| **Chủ tiệm (`ADMIN`)** | Admin | `admin@demo.com` | `admin123` | Toàn quyền: xem tất cả lịch, doanh thu, lịch tuần mọi thợ, thêm/sửa/ẩn/tạm ngưng Menu, chỉnh ca làm của cả 3 thợ, Reset lịch test. |
| **Thợ (`STAFF`)** | Minh Anh | `minhanh@demo.com` | `staff123` | Xem lịch hẹn & lịch tuần riêng của Minh Anh; đổi trạng thái ca của mình; chỉnh ca làm & ngày nghỉ cá nhân. |
| **Thợ (`STAFF`)** | Quốc Bảo | `quocbao@demo.com` | `staff123` | Chỉ xem & thao tác trên lịch hẹn của Quốc Bảo. |
| **Thợ (`STAFF`)** | Thu Hà | `thuha@demo.com` | `staff123` | Chỉ xem & thao tác trên lịch hẹn của Thu Hà. |

**Các màn hình trong Quản trị:**
- **`/admin` (Sổ lịch & Doanh thu):** Xem KPI doanh thu/tiền cọc/dịch vụ hot, duyệt lịch (`Xác nhận` -> `Hoàn thành` / `Hủy`). Khi test đặt thử quá nhiều làm kín slot, bấm nút đỏ **`Reset lịch test`** ở góc phải để xóa sạch lịch test về trạng thái trống ban đầu.
- **`/admin/calendar` (Lịch tuần dạng lưới):** Xem lịch trực quan theo 7 ngày trong tuần (bộ lọc từng thợ cho Admin).
- **`/admin/services` (Quản lý Menu & Dịch vụ — chỉ Admin):** Thêm dịch vụ mới, bấm **Sửa** để đổi giá/thời lượng, bấm **Báo hết đồ** để tạm ngưng món khi hết nguyên liệu, hoặc **Ẩn / Xóa**.
- **`/admin/staff` (Ca làm & Ngày nghỉ):** Đổi giờ làm việc (mặc định `09:00 → 18:00`) hoặc thêm ngày nghỉ phép. Slot trống ngoài trang `/book` tự động cập nhật theo cài đặt này.

---

## 4. Cách thức Database hoạt động (Local & Khi đưa sang máy khác / Cloud)

### Database đang nằm ở đâu?
* Hiện tại dự án dùng **SQLite** lưu trực tiếp thành 1 file cục bộ tại `prisma/dev.db` (không cần cài MySQL hay SQL Server).
* File `prisma/dev.db` và `.env` được liệt kê trong `.gitignore` nên **không đưa lên GitHub** (đây là chuẩn bảo mật để không lộ dữ liệu riêng tư và file nhị phân lên repo).
* Thay vào đó, toàn bộ **"bản thiết kế bảng"** nằm trong `prisma/schema.prisma` và **"bộ dữ liệu mẫu ban đầu"** nằm trong `prisma/seed.ts` — cả hai file này **đã được lưu an toàn trong Git**.

### Khi tải code từ GitHub về một máy tính hoàn toàn mới:
Chỉ cần chạy đúng 4 lệnh sau (hoặc nhấp đúp **`CHAY_WEB.bat`**):
```powershell
npm install
copy .env.example .env
npx prisma db push
npm run seed
```
Hệ thống sẽ tự động tạo file `prisma/dev.db` mới tinh với đủ 4 tài khoản và 5 dịch vụ mẫu để web hoạt động bình thường.

### Nếu muốn khôi phục Database về dữ liệu gốc ban đầu (Reset toàn bộ):
```powershell
npx prisma db push && npm run seed
```

### Khi đưa web lên mạng thật (Deploy lên Vercel):
Vercel là máy chủ serverless nên không giữ được file SQLite `dev.db` lâu dài. Khi deploy online, bạn làm 4 bước:
1. Tạo 1 database **PostgreSQL miễn phí** (trên [Neon](https://neon.tech) hoặc [Supabase](https://supabase.com)) và lấy chuỗi kết nối `DATABASE_URL`.
2. Mở file `prisma/schema.prisma`, sửa dòng `provider = "sqlite"` thành `provider = "postgresql"`.
3. Trên Vercel (mục *Settings -> Environment Variables*), thêm 2 biến:
   - `DATABASE_URL` = chuỗi Postgres vừa tạo
   - `AUTH_SECRET` = một chuỗi ngẫu nhiên dài (ví dụ 32 ký tự)
4. Chạy `npx prisma db push && npm run seed` trỏ tới `DATABASE_URL` đó một lần duy nhất để tạo bảng và dữ liệu mẫu trên cloud.

*(Mẹo Email thật: Nếu muốn gửi email xác nhận thật qua Gmail thay vì in log trong terminal, điền các biến `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` trong file `.env` theo mẫu `.env.example`.)*

---

## 5. Đã đẩy lên GitHub chưa & Cách tự đẩy lên GitHub trong 1 phút

* **Trạng thái hiện tại:** Toàn bộ code và lịch sử commit **đã lưu đầy đủ trong Git cục bộ trên máy bạn** (nhánh `main`), nhưng **chưa đẩy lên `github.com`** vì máy chưa đăng nhập tài khoản GitHub và chưa gắn link repository online (`git remote -v` đang trống).
* **Cách đẩy lên GitHub của bạn:**
  1. Vào [github.com/new](https://github.com/new), tạo 1 repository mới (ví dụ tên `studio-booking`), **không** tích chọn *Add a README file* (để giữ trống).
  2. Copy đường dẫn HTTPS của repo (dạng `https://github.com/<ten-cua-ban>/studio-booking.git`).
  3. Mở Terminal trong thư mục `booking-platform` và chạy 4 lệnh (thay tên & email GitHub của bạn vào 2 dòng đầu):
     ```powershell
     git config user.name "Ten Cua Ban"
     git config user.email "thientam190505@gmail.com"
     git remote add origin https://github.com/<ten-cua-ban>/studio-booking.git
     git push -u origin main
     ```
  *(Trình duyệt sẽ bật cửa sổ xác nhận đăng nhập GitHub 1 lần là xong!)*

---

## 6. Bộ lệnh kiểm tra kỹ thuật nhanh (Dành cho Developer / Phỏng vấn)

| Lệnh | Tác dụng |
| --- | --- |
| `npm run dev` | Chạy web ở chế độ phát triển (`http://localhost:3000`) |
| `npm run build` | Kiểm tra đóng gói bản production Next.js |
| `npx tsc --noEmit` | Kiểm tra toàn bộ lỗi kiểu dữ liệu TypeScript |
| `npx eslint src scripts tests` | Kiểm tra chuẩn code & React hooks |
| `npm test` | Chạy bộ unit test (kiểm tra trùng khoảng, múi giờ +07:00, chữ ký token) |
| `npm run test:race` | Test giả lập 3 khách đặt cùng 1 slot song song (xác nhận chỉ 1/3 thành công; lưu ý lệnh này sẽ xóa lịch test trong DB nên hãy chạy lại `npm run seed` nếu muốn) |
| `npm run smoke:admin` | Kiểm tra tự động phân quyền `ANON` / `STAFF` / `ADMIN` trên toàn bộ route (cần server đang chạy) |
