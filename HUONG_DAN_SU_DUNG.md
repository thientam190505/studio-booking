# HƯỚNG DẪN SỬ DỤNG & VẬN HÀNH — STUDIO BOOKING

Tài liệu hướng dẫn chi tiết cách truy cập bản Web Online 24/7, giải thích kiến trúc hoạt động (vì sao không chạy bằng `index.html` trên GitHub Pages mà chạy qua **Vercel + Cloud PostgreSQL**), ưu điểm hệ thống, hướng dẫn sử dụng theo từng vai trò và cách vận hành Database.

---

## 1. Link Web Online & Kho mã nguồn

| Thành phần | Đường dẫn chính thức | Ghi chú |
| --- | --- | --- |
| **Trang Web Online (Live 24/7)** | **https://studio-booking-one-lovat.vercel.app** | Mở trực tiếp trên điện thoại / máy tính bất kỳ, có Database Cloud chạy thật |
| **Trang Đặt lịch (Khách)** | https://studio-booking-one-lovat.vercel.app/book | Chọn combo dịch vụ, tự xếp thợ hoặc chọn stylist, đặt khung giờ trống |
| **Trang Tra cứu (Khách)** | https://studio-booking-one-lovat.vercel.app/lookup | Tra cứu bằng **Mã đặt lịch** hoặc **Số điện thoại**, thanh toán cọc / tự hủy |
| **Trang Quản trị (Chủ & Thợ)** | https://studio-booking-one-lovat.vercel.app/admin | Sổ lịch, doanh thu, lịch tuần, quản lý Menu & ca làm |
| **Kho mã nguồn GitHub** | https://github.com/thientam190505/studio-booking | Nhánh `main` đồng bộ tự động với Vercel |

*(Hoặc nếu muốn chạy thử ở máy cá nhân tại `http://localhost:3000`: nhấp đúp **`CHAY_WEB.bat`** sau khi đã cấu hình file `.env`.)*

---

## 2. Tại sao không quăng file `index.html` lên GitHub Pages, mà phải chạy qua Vercel & Cloud Database?

Nhiều bạn quen với các dự án web cơ bản chỉ gồm `index.html` + `style.css` + `script.js` thì chỉ cần bật **GitHub Pages** là xem được ngay. Tuy nhiên dự án này **không thể chạy như file HTML tĩnh trên GitHub Pages** vì 3 lý do kỹ thuật cốt lõi:

1. **GitHub Pages chỉ là nơi chứa file tĩnh (Static Hosting):**
   - GitHub Pages chỉ phát lại các file HTML/CSS/JS có sẵn cho trình duyệt, **không có Server Backend** để chạy mã xử lý logic hay kết nối Database.
   - **Studio Booking** là ứng dụng **Web Fullstack động (Next.js App Router)**: trang chủ (`src/app/page.tsx`) mỗi lần khách mở đều tự động đọc Menu dịch vụ, giá tiền, trạng thái *"tạm ngưng / hết đồ"* và lịch trống thực tế từ Database.
2. **Cần Server để xử lý chống đặt trùng & giữ chỗ 10 phút:**
   - Khi 2 khách cùng bấm đặt 1 khung giờ, **Server API** (`/api/bookings`) phải mở **Database Transaction (`prisma.$transaction`)** ở phía máy chủ để khóa slot cho 1 người và trả lỗi `409 Conflict` cho người còn lại. Trình duyệt thuần hay `index.html` không thể đảm bảo chống trùng giờ.
3. **Bảo mật thông tin đăng nhập & chuỗi kết nối Database:**
   - Mật khẩu quản trị (`bcrypt`), khóa ký phiên đăng nhập (`AUTH_SECRET` HMAC-SHA256) và mật khẩu Database (`DATABASE_URL`) bắt buộc phải nằm kín trong **Server Environment Variables**, tuyệt đối không được nhúng vào file HTML/JS tĩnh công khai trên GitHub.

### Vậy hệ thống đang hoạt động thực tế qua đâu?

```text
[Người dùng / Khách hàng]
         │  (truy cập https://studio-booking-one-lovat.vercel.app)
         ▼
[Vercel Cloud Hosting & Serverless API]  ◄── Tự động cập nhật mỗi khi git push lên GitHub (main)
         │  (đọc biến môi trường DATABASE_URL & AUTH_SECRET, xử lý Next.js + Prisma ORM)
         ▼
[Prisma Postgres (Cloud PostgreSQL)]     ◄── Lưu bền vững Khách, Lịch hẹn, Dịch vụ, Thợ, Ca làm 24/7
```

- **GitHub (`thientam190505/studio-booking`):** Lưu toàn bộ mã nguồn (`src/`, `prisma/schema.prisma`, `prisma/seed.ts`, `tests/`).
- **Vercel (`studio-booking-one-lovat.vercel.app`):** Máy chủ chạy Next.js SSR + API Routes (`/api/catalog`, `/api/slots`, `/api/bookings`, `/api/lookup`). Mỗi lần bạn đẩy code mới lên nhánh `main` trên GitHub, Vercel tự động build lại và cập nhật trang web sau ~1 phút.
- **Prisma Postgres (`Vercel Storage`):** Hệ quản trị cơ sở dữ liệu **PostgreSQL** chạy trên đám mây, được liên kết thẳng với project trên Vercel. Dù khách đặt lịch từ điện thoại ở ngoài tiệm hay máy tính ở nhà, tất cả đều đọc/ghi chung một nguồn dữ liệu thời gian thực.

---

## 3. Ưu điểm nổi bật của Web (Điểm mạnh đưa vào CV / Bảo vệ đồ án)

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
   - Cố định `+07:00` (`SHOP_TZ_OFFSET`), nên khi chạy trên server đám mây Vercel (mặc định UTC), khung giờ 09:00–18:00 của tiệm vẫn hiển thị chính xác tuyệt đối theo giờ Việt Nam.

---

## 4. Hướng dẫn sử dụng theo từng vai trò

### A. Dành cho Khách hàng (Không cần đăng nhập)
| Chức năng | Đường dẫn | Cách thao tác |
| --- | --- | --- |
| **Xem trang chủ & Menu** | `/` | Xem bảng dịch vụ, giá tiền, trạng thái mở bán/tạm ngưng và ca làm của các stylist. |
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

## 5. Cách thức Database hoạt động & Cách bảo trì / khôi phục dữ liệu

### Database Cloud đang hoạt động như thế nào?
* Dự án dùng **PostgreSQL** qua tích hợp **Prisma Postgres** trên Vercel Storage (định nghĩa trong `prisma/schema.prisma` với `provider = "postgresql"` gồm 6 bảng: `User`, `Service`, `Staff`, `TimeOff`, `Booking`, `BookingItem`).
* Chuỗi kết nối mật `DATABASE_URL` và khóa bảo mật `AUTH_SECRET` được lưu trong **Vercel Settings → Environment Variables** (Production & Preview) và file `.env` cục bộ (đã đưa vào `.gitignore` nên **tuyệt đối không bị lộ lên GitHub**).
* Toàn bộ cấu trúc bảng (`prisma/schema.prisma`) và dữ liệu mẫu ban đầu (`prisma/seed.ts`) nằm an toàn trong Git.

### Khi cần chạy trên máy tính mới (Local Development):
1. Cài đặt thư viện & tạo file cấu hình:
   ```powershell
   npm install
   copy .env.example .env
   ```
2. Mở file `.env`, dán `DATABASE_URL` PostgreSQL (lấy từ Vercel Storage → *Prisma Postgres → `.env.local`*) và đặt `AUTH_SECRET` ngẫu nhiên.
3. Chạy web: nhấp đúp **`CHAY_WEB.bat`** hoặc gõ `npm run dev` rồi mở `http://localhost:3000`.

### Khi muốn khôi phục Database về dữ liệu gốc ban đầu (Reset sạch):
* **Cách nhanh nhất (không cần gõ lệnh):** Đăng nhập `/admin` bằng tài khoản Chủ tiệm (`admin@demo.com` / `admin123`) rồi bấm nút **`Reset lịch test`** trên trang quản trị để xóa các lịch test.
* **Reset toàn bộ bảng & dữ liệu mẫu qua Terminal:**
  ```powershell
  npx prisma db push && npm run seed
  ```

### Khi muốn cập nhật code & đưa lên web online:
Mỗi khi chỉnh sửa code xong, chỉ cần push lên GitHub là Vercel tự cập nhật web online sau ~1 phút:
```powershell
git add .
git commit -m "mo ta thay doi"
git push origin main
```

*(Mẹo Email thật: Nếu muốn hệ thống gửi email xác nhận thật qua Gmail thay vì ghi log trên server, thêm các biến `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` vào `.env` hoặc Vercel Environment Variables theo mẫu `.env.example`.)*

---

## 6. Bộ lệnh kiểm tra kỹ thuật nhanh (Dành cho Developer / Phỏng vấn)

| Lệnh | Tác dụng |
| --- | --- |
| `npm run dev` | Chạy web ở chế độ phát triển (`http://localhost:3000`) |
| `npm run build` | Kiểm tra đóng gói bản production Next.js |
| `npx tsc --noEmit` | Kiểm tra toàn bộ lỗi kiểu dữ liệu TypeScript |
| `npx eslint src scripts tests` | Kiểm tra chuẩn code & React hooks |
| `npm test` | Chạy bộ unit test (kiểm tra overlap khoảng thời gian, múi giờ +07:00, chữ ký HMAC token) |
| `npm run test:race` | Test giả lập 3 khách đặt cùng 1 slot song song (xác nhận chỉ 1/3 thành công; lưu ý lệnh này xóa dữ liệu booking cũ nên hãy chạy lại `npm run seed` nếu muốn) |
| `npm run smoke:admin` | Kiểm tra tự động phân quyền `ANON` / `STAFF` / `ADMIN` trên toàn bộ route (hỗ trợ `$env:BASE_URL="https://studio-booking-one-lovat.vercel.app"`) |
