# HANDOFF – Studio Booking (đọc file này trước khi làm gì)

Dự án: web đặt lịch dịch vụ để đưa vào CV của chủ repo (sinh viên năm 4). Đường dẫn: `D:\Antigravity\Dự án Git\booking-platform`. Đặc tả gốc: `..\PROJECT_SPEC.md`. Hướng dẫn chạy: `README.md`.

## Trạng thái hiện tại
- **Chức năng đã xong và chạy được:** đặt lịch của khách (`/book`), tra cứu (`/lookup`), thanh toán cọc mô phỏng, email xác nhận (log console nếu chưa có SMTP), admin (`/admin`: dashboard, `/admin/calendar` lịch tuần, `/admin/services`, `/admin/staff`).
- **Đã kiểm tra:** `npm run build`, `npx tsc --noEmit`, `npx eslint src scripts tests`, `npm test`, `npm run test:race` đều qua.
- **Chưa kiểm tra bằng mắt:** giao diện trên trình duyệt sau các lần sửa gần nhất. Hãy chạy `npm run dev` và xem thật.
- **Git:** nhiều commit, tên tác giả tạm là `dev` / `dev@local`. Chưa có remote, chưa push.

## Việc user giao cho model giao diện (Gemini 4 Argon)
Chỉ làm **giao diện/UX**, đừng đổi logic nghiệp vụ. File liên quan: `src/app/page.tsx`, `src/app/book/page.tsx`, `src/app/booking/[code]/*`, `src/app/lookup/page.tsx`, `src/app/admin/**` (các `page.tsx`, `AdminNav.tsx`, `login/page.tsx`), `src/app/globals.css`, `src/app/layout.tsx`.
Gợi ý: trang chủ có hero và giới thiệu dịch vụ; bước đặt lịch rõ ràng (stepper, thẻ tóm tắt đơn); trạng thái loading/lỗi; responsive cho điện thoại; trang admin gọn, dễ nhìn.

## Quy tắc BẮT BUỘC khi sửa
1. **Không cài thêm phần mềm ngoài máy** (user yêu cầu). Thêm gói npm nhỏ thì được; không dùng Docker hay DB server.
2. **Giữ giao diện sáng:** `globals.css` đã ép `color-scheme: light`. Trình duyệt user ở dark mode từng làm chữ trắng trên nền trắng. Nếu thêm màu, kiểm tra độ tương phản.
3. **Không phá logic chống trùng lịch:** `src/lib/booking.ts` (transaction) và `src/lib/availability.ts`. Sau khi sửa, chạy `npm run test:race`, kỳ vọng đúng 1/3 thành công.
4. **Múi giờ cố định UTC+7** (`SHOP_TZ_OFFSET`). Đừng dùng `new Date()` cục bộ để tính ngày/giờ hiển thị cho cửa hàng.
5. **Next.js 16:** `cacheComponents` đã bị tắt trong `next.config.ts` vì làm `/book` lỗi `Date.now()`. Đừng bật lại. `params` và `searchParams` là Promise. Lint bật rule `react-hooks/set-state-in-effect`, nên tránh `setState` đồng bộ trong `useEffect` (xem cách `book/page.tsx` suy ra `slot` thay vì lưu state).
6. **Ghi file có tiếng Việt:** từng có lần PowerShell `Set-Content` làm hỏng UTF-8 của `layout.tsx`. Khi ghi bằng script, dùng `[IO.File]::WriteAllText(path, text, (New-Object Text.UTF8Encoding $false))`, hoặc dùng công cụ ghi file trực tiếp.
7. **Giữ nguyên comment và cấu trúc không liên quan.** Commit theo Conventional Commits (`feat:`, `fix:`, `style:`, `refactor:`).
8. Trước khi báo xong: `npm run build`, `npx tsc --noEmit`, `npx eslint src scripts tests`, `npm test` phải sạch.

## Việc còn lại sau giao diện (user đã quyết định "tính sau")
1. Quay GIF demo, dán vào README.
2. Tạo repo GitHub, đặt lại `git config user.name/user.email` của user rồi push.
3. Deploy: SQLite không bền trên Vercel, nên cần Postgres (Neon/Supabase). Đổi `provider` trong `prisma/schema.prisma`, đặt `DATABASE_URL` và `AUTH_SECRET`, chạy `prisma db push` và `npm run seed`. Bỏ ghi chú "SQLite" trong README sau khi đổi, và điền link Live Demo.
4. Ý tưởng mở rộng (không bắt buộc): PayOS/Stripe thật có kiểm tra chữ ký webhook, rate limit endpoint đặt lịch, tùy chọn "bất kỳ nhân viên rảnh".

## Lệnh hay dùng
```
npm run dev | npm run build | npm test | npm run test:race
npm run smoke:admin   # cần dev server đang chạy
npx prisma db push && npm run seed   # reset DB về dữ liệu mẫu
```
Tài khoản demo: `admin@demo.com` / `admin123` (nhân viên: `staff123`).

## Về user
Nói tiếng Việt, thích trả lời ngắn gọn, đi thẳng vào việc. Tự xử lý lỗi vặt, đừng hỏi lại những việc nhỏ. Công cụ dev nằm ở `D:\Antigravity\Tool\` (NodeJS, Git, Python).
