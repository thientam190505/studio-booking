import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatVND } from "@/lib/format";
import PayButton from "./PayButton";

export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = {
  PENDING: "Chờ thanh toán cọc",
  CONFIRMED: "Đã xác nhận",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export default async function BookingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const b = await prisma.booking.findUnique({
    where: { code },
    include: { staff: { include: { user: true } }, items: { include: { service: true } } },
  });
  if (!b) notFound();

  const expired = b.status === "PENDING" && (!b.holdExpiresAt || b.holdExpiresAt < new Date());

  return (
    <main className="mx-auto max-w-xl space-y-4 px-4 py-10">
      <h1 className="text-2xl font-bold">Lịch hẹn #{b.code}</h1>
      <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm text-sm">
        <p>Trạng thái: <b>{expired ? "Hết hạn giữ chỗ" : STATUS[b.status]}</b></p>
        <p>Khách: {b.customerName} · {b.customerPhone}</p>
        <p>Nhân viên: {b.staff.user.name}</p>
        <p>Thời gian: {formatDateTime(b.startTime)}</p>
        <ul className="list-disc pl-5">
          {b.items.map((i) => (
            <li key={i.id}>{i.service.name} – {formatVND(i.price)} ({i.duration}p)</li>
          ))}
        </ul>
        <p>Tổng: <b>{formatVND(b.totalPrice)}</b> · Cọc: <b>{formatVND(b.depositAmount)}</b></p>
      </div>
      {b.status === "PENDING" && !expired && <PayButton code={b.code} />}
      {expired && <Link href="/book" className="text-indigo-600 underline">Đặt lại</Link>}
    </main>
  );
}
