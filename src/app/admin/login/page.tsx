"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { login } from "../actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("");

  const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <form
        action={action}
        aria-labelledby="admin-login-heading"
        className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="space-y-1">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 id="admin-login-heading" className="pt-2 text-2xl font-bold tracking-tight text-slate-900">
            Đăng nhập quản trị
          </h1>
          <p className="text-sm text-slate-600">
            Khu vực quản lý lịch hẹn, doanh thu và ca làm việc nhân viên.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="block text-sm font-medium text-slate-700">
              Email quản trị <span aria-hidden="true" className="text-red-600">*</span>
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
            <label htmlFor="admin-password" className="block text-sm font-medium text-slate-700">
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
                className="absolute inset-y-0 right-1 flex items-center rounded-lg px-2.5 text-slate-500 hover:text-slate-800"
              >
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div role="alert" aria-live="polite" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-50"
        >
          <Lock className="h-4 w-4" aria-hidden="true" />
          <span>{pending ? "Đang xác thực..." : "Đăng nhập vào Dashboard"}</span>
        </button>

        <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600">
          <div>
            <div className="font-semibold text-slate-800">Tài khoản Demo</div>
            <div className="font-mono">admin@demo.com / admin123</div>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmail("admin@demo.com");
              setPassword("admin123");
            }}
            className="shrink-0 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Điền nhanh
          </button>
        </div>
      </form>
    </main>
  );
}
