"use client";

import { useActionState } from "react";
import type { AdminActionState, Category } from "@/lib/types";
import ThumbnailInput from "./ThumbnailInput";

type Defaults = {
  title?: string;
  slug?: string;
  description?: string;
  embed?: string;
  source?: string;
  category_id?: string;
  thumbnail_url?: string;
  featured?: boolean;
};

export default function AdminVideoForm({
  categories,
  action,
  defaults = {},
}: {
  categories: Category[];
  action: (prev: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  defaults?: Defaults;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  const input =
    "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-accent";
  const label = "text-sm font-medium";
  const hint = "text-xs text-muted";

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className={label}>Judul</label>
        <input id="title" name="title" required minLength={3} maxLength={120} defaultValue={defaults.title} className={input} placeholder="Judul video" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="slug" className={label}>Slug</label>
        <input id="slug" name="slug" maxLength={60} defaultValue={defaults.slug} className={input} placeholder="otomatis-dari-judul" pattern="[a-z0-9]+(-[a-z0-9]+)*" />
        <span className={hint}>Huruf kecil, angka, tanda hubung. Kosong = dibuat dari judul.</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="embed" className={label}>Embed URL atau ID</label>
        <input id="embed" name="embed" required defaultValue={defaults.embed} className={input} placeholder="https://dood.to/e/VIDEO_ID" />
        <span className={hint}>
          anonmp4: tempel /embed/ atau /v/ link, thumbnail terisi otomatis. vdohide: tempel embed URL lengkap. catbox: tempel direct file URL (.mp4). doodstream: tempel /e/ atau /d/ link.
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="source" className={label}>Sumber</label>
        <select id="source" name="source" defaultValue={defaults.source ?? ""} className={input}>
          <option value="">Deteksi otomatis dari URL</option>
          <option value="anonmp4">anonmp4</option>
          <option value="vdohide">vdohide</option>
          <option value="catbox">catbox</option>
          <option value="doodstream">doodstream</option>
        </select>
        <span className={hint}>Pilih manual hanya kalau menempel ID mentah anonmp4/doodstream.</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <ThumbnailInput defaultValue={defaults.thumbnail_url} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="category_id" className={label}>Kategori</label>
        <select id="category_id" name="category_id" required defaultValue={defaults.category_id ?? ""} className={input}>
          <option value="" disabled>Pilih kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className={label}>Deskripsi</label>
        <textarea id="description" name="description" maxLength={2000} rows={4} defaultValue={defaults.description} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-accent" placeholder="Sinopsis singkat (opsional)" />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="featured" defaultChecked={defaults.featured} className="h-5 w-5" style={{ accentColor: "var(--accent)" }} />
        Jadikan video sorotan (tampil di hero)
      </label>

      {state.error && (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm font-medium text-red-400">
          {state.error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="h-12 cursor-pointer rounded-lg bg-accent px-6 text-sm font-bold text-accent-contrast transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : "Simpan video"}
        </button>
      </div>
    </form>
  );
}
