"use client";

import { useActionState, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory, deleteCategory } from "@/app/admin/actions";
import type { AdminActionState, Category } from "@/lib/types";

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createCategory,
    {} as AdminActionState
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, startDeleting] = useTransition();

  const input =
    "h-11 rounded-lg border border-border bg-background px-3 text-sm focus:border-accent";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form action={formAction} className="flex h-fit flex-col gap-3 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-base font-bold">Tambah kategori</h2>
        <label htmlFor="name" className="text-sm font-medium">Nama</label>
        <input id="name" name="name" required minLength={2} maxLength={60} className={input} placeholder="Misal: Dokumenter" />
        <label htmlFor="slug" className="text-sm font-medium">Slug</label>
        <input id="slug" name="slug" maxLength={60} className={input} placeholder="otomatis-dari-nama" pattern="[a-z0-9]+(-[a-z0-9]+)*" />
        {state.error && <p role="alert" className="text-sm font-medium text-red-400">{state.error}</p>}
        {state.ok && <p role="status" className="text-sm font-medium text-accent">Kategori tersimpan.</p>}
        <button
          type="submit"
          disabled={pending}
          className="h-11 cursor-pointer rounded-lg bg-accent text-sm font-bold text-accent-contrast disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : "Simpan kategori"}
        </button>
      </form>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-base font-bold">Daftar kategori</h2>
        {categories.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Belum ada kategori.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs text-muted">{category.slug}</p>
                </div>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => {
                    if (!window.confirm(`Hapus kategori "${category.name}"? Gagal kalau masih dipakai video.`)) return;
                    setDeleteError(null);
                    startDeleting(async () => {
                      const result = await deleteCategory(category.id);
                      if (result?.error) setDeleteError(result.error);
                      else router.refresh();
                    });
                  }}
                  className="cursor-pointer rounded-md border border-border px-3 py-2 text-xs font-medium text-muted hover:border-red-400 hover:text-red-400 disabled:opacity-60"
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        )}
        {deleteError && <p role="alert" className="mt-2 text-sm font-medium text-red-400">{deleteError}</p>}
      </div>
    </div>
  );
}
