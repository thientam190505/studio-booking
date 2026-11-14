import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "vietnamese"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Studio Booking – Đặt lịch online",
  description: "Đặt lịch hẹn, chọn nhân viên và khung giờ trống theo thời gian thực",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <span className="font-semibold text-slate-800">Studio Booking</span> · Giờ mở cửa: 09:00 – 18:00 (Thứ 2 – Thứ 7, UTC+7)
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/book" className="hover:text-indigo-600">Đặt lịch</Link>
              <Link href="/lookup" className="hover:text-indigo-600">Tra cứu lịch</Link>
              <Link href="/admin" className="hover:text-indigo-600">Trang quản trị</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
