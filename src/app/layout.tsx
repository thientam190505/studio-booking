import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Phone } from "lucide-react";
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
      <body className="relative flex min-h-full flex-col text-slate-900">
        {/* Lớp nền Ambient Aurora & Lưới kiến trúc cố định */}
        <div aria-hidden="true" className="bg-ambient-canvas">
          <div className="bg-grid-pattern" />
          <div className="float-glow absolute -top-32 -left-24 h-[460px] w-[460px] rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="float-glow absolute top-1/3 -right-28 h-[420px] w-[420px] rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 h-[380px] w-[380px] rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute right-1/5 -bottom-24 h-[360px] w-[360px] rounded-full bg-emerald-400/15 blur-3xl" />
        </div>

        <SiteHeader />
        <div className="flex-1">{children}</div>

        {/* Thanh thông tin & liên hệ cá nhân (Footer Bar) */}
        <footer className="mt-12 border-t-2 border-sky-500/70 bg-[#050b18] text-slate-200 shadow-[0_-4px_25px_rgba(14,165,233,0.18)]">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-400/60 bg-gradient-to-br from-indigo-500 to-sky-500 text-xs font-extrabold text-white shadow-sm shadow-sky-500/30">
                TT
              </span>
              <div className="space-y-0.5">
                <div className="font-medium text-slate-200">
                  © 2026 Studio Booking. Thực hiện bởi <span className="font-bold text-white">Thiện Tâm</span>.
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <Link href="/book" className="transition-colors hover:text-sky-400">Đặt lịch</Link>
                  <span aria-hidden="true">·</span>
                  <Link href="/lookup" className="transition-colors hover:text-sky-400">Tra cứu lịch</Link>
                  <span aria-hidden="true">·</span>
                  <Link href="/admin" className="transition-colors hover:text-sky-400">Trang quản trị</Link>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/tem.thien.5?locale=vi_VN"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-interactive inline-flex items-center gap-2 rounded-full border border-sky-400/60 bg-[#0a1329] px-4 py-1.5 text-xs font-semibold text-white hover:border-sky-400 hover:bg-sky-500/15"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1877F2] text-white" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                    <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.5-1.5h1.7V4.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2V11H7.5v3h2.7v8h3.3z" />
                  </svg>
                </span>
                <span>Thiện Tâm</span>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@tam190505"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-interactive inline-flex items-center gap-2 rounded-full border border-sky-400/60 bg-[#0a1329] px-4 py-1.5 text-xs font-semibold text-white hover:border-pink-400 hover:bg-pink-500/15"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-md border border-white/15 bg-black" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
                    <path
                      fill="#25F4EE"
                      d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"
                      transform="translate(-0.7, -0.5)"
                    />
                    <path
                      fill="#FE2C55"
                      d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"
                      transform="translate(0.7, 0.5)"
                    />
                    <path
                      fill="#FFFFFF"
                      d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"
                    />
                  </svg>
                </span>
                <span>tam190505</span>
              </a>

              {/* Gmail */}
              <a
                href="mailto:thientam190505@gmail.com"
                className="btn-interactive inline-flex items-center gap-2 rounded-full border border-sky-400/60 bg-[#0a1329] px-4 py-1.5 text-xs font-semibold text-white hover:border-red-400 hover:bg-red-500/15"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
                  <path fill="#4285F4" d="M2 6.5v11c0 .83.67 1.5 1.5 1.5H6V9.7L2 6.5z" />
                  <path fill="#34A853" d="M18 19h2.5c.83 0 1.5-.67 1.5-1.5v-11l-4 3.2V19z" />
                  <path fill="#FBBC05" d="M18 9.7l4-3.2v-.2C22 5.03 20.97 4 19.7 4c-.52 0-1.02.18-1.42.5L18 9.7z" />
                  <path fill="#EA4335" d="M6 9.7V4.5l6 4.7 6-4.7v5.2l-6 4.6-6-4.6z" />
                  <path fill="#C5221F" d="M2 6.5L6 9.7V4.5l-.28-.22C4.42 3.33 2 4.26 2 5.9v.6z" />
                </svg>
                <span>thientam190505@gmail.com</span>
              </a>

              {/* SĐT */}
              <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold tracking-wide text-white">
                <Phone className="h-3.5 w-3.5 text-pink-500" aria-hidden="true" />
                <span>0328 xxx 660</span>
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
