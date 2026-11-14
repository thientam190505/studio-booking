"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Eye, EyeOff, Lock, ShieldCheck, UserCheck } from "lucide-react";
import { login } from "../actions";

const DEMO_ACCOUNTS = [
  { label: "Chủ quán (Admin)", email: "admin@demo.com", pass: "admin123", badge: "Toàn quyền" },
  { label: "Thợ: Minh Anh", email: "minhanh@demo.com", pass: "staff123", badge: "Cắt & tạo kiểu" },
  { label: "Thợ: Quốc Bảo", email: "quocbao@demo.com", pass: "staff123", badge: "Nhuộm & uốn" },
  { label: "Thợ: Thu Hà", email: "thuha@demo.com", pass: "staff123", badge: "Chăm sóc da đầu" },
];

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("");

  const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-md flex-col justify-center px-4 py-10 sm:px-6">
      <form
        action={action}
        aria-labelledby="admin-login-heading"
        className="reveal-up overflow-hidden rounded-3xl border-2 border-slate-200/90 bg-white shadow-2xl shadow-slate-900/10"
      >
        <div className="border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 text-white sm:px-8">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/25 text-indigo-300 ring-1 ring-indigo-400/30">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 id="admin-login-heading" className="pt-3 text-2xl font-extrabold tracking-tight text-white">
            Đăng nhập Quản trị & Nhân viên
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Chủ quán xem toàn bộ hệ thống; mỗi thợ đăng nhập để xem lịch hẹn riêng của mình.
          </p>
        </div>

        <div className="space-y-5 p-6 sm:p-8">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="block text-sm font-semibold text-slate-800">
                Email tài khoản <span aria-hidden="true" className="text-red-600">*</span>
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                required
                autoComplete="username"
                spellCheck={false}
                autoCapitalize="none"
                enterKeyHint="next"
                placeholder="admin@demo.com"
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="block text-sm font-semibold text-slate-800">
                Mật khẩu <span aria-hidden="true" className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  enterKeyHint="done"
                  placeholder="Nhập mật khẩu"
                  className={inputCls + " pr-11"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-pressed={showPassword}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-1 flex items-center rounded-lg px-2.5 text-slate-500 transition-colors hover:text-slate-900"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div role="alert" aria-live="polite" className="drawer-enter flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn-interactive inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            <span>{pending ? "Đang xác thực..." : "Đăng nhập"}</span>
          </button>

          <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <UserCheck className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
              <span>Chọn nhanh tài khoản Demo (1-click):</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const selected = email === acc.email && password === acc.pass;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => {
                      setEmail(acc.email);
                      setPassword(acc.pass);
                    }}
                    className={`card-interactive flex flex-col items-start rounded-xl border-2 p-2.5 text-left ${
                      selected
                        ? "border-indigo-600 bg-slate-900 text-white shadow-md"
                        : "border-slate-200 bg-white text-slate-800 hover:border-indigo-400"
                    }`}
                  >
                    <span className="font-bold">{acc.label}</span>
                    <span className={`text-[11px] font-medium ${selected ? "text-indigo-200" : "text-slate-500"}`}>{acc.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
