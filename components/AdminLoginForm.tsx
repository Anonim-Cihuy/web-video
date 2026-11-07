"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase belum dikonfigurasi.");
      setPending(false);
      return;
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setPending(false);
    if (signInError) {
      setError("Email atau password salah.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-sm rounded-xl border border-border bg-surface p-6">
      <h1 className="text-xl font-bold tracking-tight">Login admin</h1>
      <p className="mt-1 text-sm text-muted">Khusus pemilik situs. Bukan untuk pengunjung.</p>

      <div className="mt-5 flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input
          id="email" type="email" required autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="h-11 rounded-lg border border-border bg-background px-3 text-sm focus:border-accent"
        />
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <input
          id="password" type="password" required autoComplete="current-password"
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="h-11 rounded-lg border border-border bg-background px-3 text-sm focus:border-accent"
        />
      </div>

      {error && <p role="alert" className="mt-3 text-sm font-medium text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 h-11 w-full cursor-pointer rounded-lg bg-accent text-sm font-bold text-accent-contrast transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
