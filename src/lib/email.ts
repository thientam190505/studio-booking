import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatVND } from "@/lib/format";

/**
 * Gửi email xác nhận. Nếu chưa cấu hình SMTP_* trong .env thì chỉ log ra console
 * (đủ để demo/dev, không làm hỏng luồng đặt lịch).
 */
export async function sendBookingConfirmation(code: string) {
  const b = await prisma.booking.findUnique({
    where: { code },
    include: { staff: { include: { user: true } }, items: { include: { service: true } } },
  });
  if (!b) return;

  const subject = `Xác nhận lịch hẹn #${b.code}`;
  const text = [
    `Chào ${b.customerName},`,
    `Lịch hẹn của bạn đã được xác nhận.`,
    `Thời gian: ${formatDateTime(b.startTime)}`,
    `Nhân viên: ${b.staff.user.name}`,
    `Dịch vụ: ${b.items.map((i) => i.service.name).join(", ")}`,
    `Tổng: ${formatVND(b.totalPrice)} (đã cọc ${formatVND(b.depositAmount)})`,
    `Mã tra cứu: ${b.code}`,
  ].join("\n");

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
  if (!SMTP_HOST) {
    console.log(`[email:dev] To: ${b.customerEmail}\n${subject}\n${text}`);
    return;
  }
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
    await transporter.sendMail({ from: MAIL_FROM ?? SMTP_USER, to: b.customerEmail, subject, text });
  } catch (e) {
    // Lỗi gửi mail không được làm hỏng nghiệp vụ chính
    console.error("[email] gửi thất bại", e);
  }
}
