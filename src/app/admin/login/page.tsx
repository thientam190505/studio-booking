"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, undefined);
  const input = "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500";
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <form action={action} className="space-y-3 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">Đăng nhập quản trị</h1>
        <input name="email" type="email" required placeholder="Email" defaultValue="admin@demo.com" className={input} />
        <input name="password" type="password" required placeholder="Mật khẩu" className={input} />
        <button disabled={pending} className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white disabled:opacity-50">
          {pending ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <p className="text-xs text-zinc-500">Demo: admin@demo.com / admin123</p>
      </form>
    </main>
  );
}
