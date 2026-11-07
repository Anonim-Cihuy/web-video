"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Terjadi kesalahan</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Halaman gagal dimuat. Bukan salah kamu. Coba lagi, kalau tetap gagal hubungi admin.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex h-11 cursor-pointer items-center rounded-lg bg-accent px-6 text-sm font-bold text-accent-contrast"
      >
        Coba lagi
      </button>
    </div>
  );
}
