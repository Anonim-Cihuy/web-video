import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getAllVideosForAdmin, getCategories } from "@/lib/data";
import AdminLoginForm from "@/components/AdminLoginForm";
import DeleteVideoButton from "@/components/DeleteVideoButton";
import ThumbImage from "@/components/ThumbImage";
import { signOut } from "./actions";

export const metadata = { title: "Admin" };

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <AdminContent />
    </Suspense>
  );
}

function AdminFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="h-8 w-40 animate-pulse rounded bg-surface-2" />
      <div className="mt-6 h-64 animate-pulse rounded-xl bg-surface-2" />
    </div>
  );
}

async function AdminContent() {
  if (!getSupabaseEnv()) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-muted">
          Supabase belum dikonfigurasi. Isi file <code>.env.local</code> dulu. Detail di README.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase!.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <AdminLoginForm />
      </div>
    );
  }

  const [videos, categories] = await Promise.all([
    getAllVideosForAdmin(),
    getCategories(),
  ]);
  const categoryCount = categories.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted">
            {videos.length} video, {categoryCount} kategori. Login sebagai {user.email}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/video/new"
            className="inline-flex h-11 items-center rounded-lg bg-accent px-4 text-sm font-bold text-accent-contrast"
          >
            Tambah video
          </Link>
          <Link
            href="/admin/upload"
            className="inline-flex h-11 items-center rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-surface-2"
          >
            Upload
          </Link>
          <Link
            href="/admin/categories"
            className="inline-flex h-11 items-center rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-surface-2"
          >
            Kategori
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex h-11 cursor-pointer items-center rounded-lg px-4 text-sm font-medium text-muted hover:text-foreground"
            >
              Keluar
            </button>
          </form>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border bg-surface px-6 py-14 text-center">
          <h2 className="text-lg font-bold">Belum ada video</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Upload video ke vdohide atau anonmp4 dulu, lalu tempel link embed-nya di sini.
          </p>
          <Link
            href="/admin/video/new"
            className="mt-5 inline-flex h-11 items-center rounded-lg bg-accent px-6 text-sm font-bold text-accent-contrast"
          >
            Tambah video pertama
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {videos.map((video) => (
            <li key={video.id} className="flex items-center gap-4 p-4">
              <Link
                href={`/watch/${video.slug}`}
                className="hidden w-36 shrink-0 overflow-hidden rounded-lg border border-border sm:block"
                aria-label={`Lihat ${video.title}`}
              >
                <ThumbImage
                  src={video.thumbnail_url}
                  alt={`Thumbnail ${video.title}`}
                  loading="lazy"
                  className="aspect-video w-full object-cover"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/watch/${video.slug}`}
                  className="line-clamp-2 font-bold leading-snug hover:text-accent"
                >
                  {video.title}
                </Link>
                <p className="mt-1 text-xs text-muted">
                  {video.categories?.name ?? "Tanpa kategori"}
                  <span aria-hidden="true"> · </span>
                  {video.views.toLocaleString("id-ID")} tayang
                  {video.featured && <span> · Sorotan</span>}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/video/${video.id}/edit`}
                  className="rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-surface-2"
                >
                  Edit
                </Link>
                <DeleteVideoButton id={video.id} title={video.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
