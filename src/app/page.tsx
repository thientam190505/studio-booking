import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-5xl font-bold tracking-tight">Studio Booking</h1>
      <p className="text-lg text-zinc-600">Đặt lịch nhanh, chọn nhân viên và khung giờ trống theo thời gian thực.</p>
      <div className="flex gap-3">
        <Link href="/book" className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white">Đặt lịch ngay</Link>
        <Link href="/admin" className="rounded-lg border border-zinc-300 px-6 py-3 font-medium">Quản trị</Link>
      </div>
    </main>
  );
}
