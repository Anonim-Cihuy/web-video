"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteVideo } from "@/app/admin/actions";

export default function DeleteVideoButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(`Hapus video "${title}"? Tidak bisa dibatalkan.`)) return;
          startTransition(async () => {
            const result = await deleteVideo(id);
            if (result?.error) setError(result.error);
            else router.refresh();
          });
        }}
        className="cursor-pointer rounded-md border border-border px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-red-400 hover:text-red-400 disabled:opacity-60"
      >
        {pending ? "Menghapus..." : "Hapus"}
      </button>
      {error && <span role="alert" className="text-xs text-red-400">{error}</span>}
    </span>
  );
}
