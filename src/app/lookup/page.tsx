"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LookupPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, phone }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    router.push(`/booking/${data.code}`);
  }

  const input = "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500";
  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <form onSubmit={submit} className="space-y-3 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">Tra cứu lịch hẹn</h1>
        <input required className={input} placeholder="Mã đặt lịch (vd BK1A2B3C)" value={code} onChange={(e) => setCode(e.target.value)} />
        <input required className={input} placeholder="Số điện thoại đã đặt" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white">Tra cứu</button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}
