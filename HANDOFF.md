# HANDOFF – Studio Booking (đọc file này trước khi làm gì)

Dự án: web đặt lịch dịch vụ để đưa vào CV của chủ repo (sinh viên năm 4). Đường dẫn: `D:\Antigravity\Dự án Git\booking-platform`. Đặc tả gốc: `..\PROJECT_SPEC.md`. Hướng dẫn chạy: `README.md`.

## Trạng thái hiện tại
- **Chức năng đã xong và chạy được:**
  - Khách hàng: chọn nhiều dịch vụ, chọn stylist cụ thể hoặc **Tự xếp thợ rảnh** (`/book`), giữ chỗ 10 phút + thanh toán cọc mô phỏng + tự hủy/đổi lịch (`/booking/[code]`), tra cứu linh hoạt bằng **Mã đặt lịch hoặc SĐT** (`/lookup`), email xác nhận.
  - Quản trị & Stylist: phân quyền `ADMIN` (toàn quyền, CRUD Menu & báo hết nguyên liệu/tạm ngưng món) và `STAFF` (3 tài khoản thợ riêng chỉ xem lịch & ca làm của mình), lịch tuần dạng lưới (`/admin/calendar`), ca làm & ngày nghỉ (`/admin/staff`), Reset lịch test.
- **Giao diện:** Phong cách **Warm Minimalist Hair Salon** độ tương phản cao, hiệu ứng CSS compositor mượt mà, kèm thanh thông tin liên hệ cá nhân (Facebook, TikTok, Gmail).
- **Git:** Đang dùng nhánh `main` local, chưa gắn remote GitHub.

## Việc còn lại khi đưa lên Online (Deploy & CV)
1. Quay GIF / chụp ảnh màn hình demo dán vào `README.md`.
2. Tạo repo GitHub, đặt `git config user.name` / `user.email`, gắn remote và `git push -u origin main`.
3. Deploy (Vercel): SQLite (`prisma/dev.db`) là file cục bộ chỉ dùng cho local, không lưu bền trên serverless Vercel. Khi deploy, tạo Postgres miễn phí (Supabase/Neon), đổi `provider = "postgresql"` trong `prisma/schema.prisma`, đặt `DATABASE_URL` & `AUTH_SECRET`, chạy `npx prisma db push && npm run seed`, cập nhật link Live Demo trong `README.md`.
4. Ý tưởng mở rộng (không bắt buộc): PayOS/Stripe thật có kiểm tra chữ ký webhook, rate limit endpoint đặt lịch, nhắc lịch email trước giờ hẹn.

## Lệnh hay dùng
```
npm run dev | npm run build | npm test | npm run test:race
npm run smoke:admin   # cần dev server đang chạy
npx prisma db push && npm run seed   # reset DB về dữ liệu mẫu
```
Tài khoản demo: `admin@demo.com` / `admin123` (nhân viên: `staff123`).

## Về user
Nói tiếng Việt, thích trả lời ngắn gọn, đi thẳng vào việc. Tự xử lý lỗi vặt, đừng hỏi lại những việc nhỏ. Công cụ dev nằm ở `D:\Antigravity\Tool\` (NodeJS, Git, Python).
