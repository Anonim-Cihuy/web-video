"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    const trimmed = q.trim().slice(0, 100);
    if (trimmed) params.set("q", trimmed);
    const category = searchParams.get("category");
    if (category) params.set("category", category);
    router.push(`/?${params.toString()}`);
  }

  return (
    <form role="search" onSubmit={onSubmit} className="flex w-full items-center gap-2">
      <label htmlFor="q" className="sr-only">
        Cari video
      </label>
      <input
        id="q"
        type="search"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari judul atau deskripsi..."
        maxLength={100}
        autoComplete="off"
        className="h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-foreground placeholder:text-muted focus:border-accent"
      />
      <button
        type="submit"
        className="h-11 shrink-0 cursor-pointer rounded-lg bg-accent px-4 text-sm font-bold text-accent-contrast transition-transform active:scale-[0.98]"
      >
        Cari
      </button>
    </form>
  );
}
