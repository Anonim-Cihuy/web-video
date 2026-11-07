import Link from "next/link";
import { Suspense } from "react";
import { getCategories, getFeaturedVideo, getVideos } from "@/lib/data";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { Video } from "@/lib/types";
import CategoryChips from "@/components/CategoryChips";
import VideoGrid from "@/components/VideoGrid";
import { SkeletonGrid } from "@/components/SkeletonCard";
import ThumbImage from "@/components/ThumbImage";

export default function HomePage(props: PageProps<"/">) {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent searchParams={props.searchParams} />
    </Suspense>
  );
}

function HomeFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 h-10 w-48 animate-pulse rounded bg-surface-2" />
      <SkeletonGrid />
    </div>
  );
}

async function HomeContent({
  searchParams,
}: {
  searchParams: PageProps<"/">["searchParams"];
}) {
  const raw = await searchParams;
  const q = first(raw.q);
  const category = first(raw.category);
  const isFiltered = Boolean(q || category);

  if (!getSupabaseEnv()) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SetupNotice />
      </div>
    );
  }

  let featured: Video | null = null;
  let videos: Video[] = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let failed = false;
  try {
    [featured, videos, categories] = await Promise.all([
      isFiltered ? Promise.resolve(null) : getFeaturedVideo(),
      getVideos({ q, category }),
      getCategories(),
    ]);
  } catch {
    failed = true;
  }

  if (failed) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="rounded-xl border border-border bg-surface p-8">
          <h1 className="text-xl font-bold">Gagal memuat video</h1>
          <p className="mt-2 text-sm text-muted">
            Koneksi ke database bermasalah. Coba refresh halaman.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex h-11 items-center rounded-lg bg-accent px-5 text-sm font-bold text-accent-contrast"
          >
            Muat ulang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      {featured && <Hero video={featured} />}

      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Jelajah</h2>
          {isFiltered && (
            <p className="mt-1 text-sm text-muted">
              {videos.length} video ditemukan
              {q ? ` untuk "${q}"` : ""}
              {category ? ` di kategori ${category}` : ""}.{" "}
              <Link href="/" className="font-medium text-accent underline underline-offset-2">
                Reset filter
              </Link>
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <CategoryChips categories={categories} active={category} q={q} />
      </div>

      <div className="mt-6">
        {videos.length > 0 ? (
          <VideoGrid videos={videos} />
        ) : (
          <EmptyState q={q} category={category} />
        )}
      </div>
    </div>
  );
}

function Hero({ video }: { video: Video }) {
  return (
    <section aria-label="Video sorotan" className="mb-10 grid items-center gap-6 lg:grid-cols-5 lg:gap-10">
      <div className="lg:col-span-2">
        <p className="text-sm font-medium text-accent">Sorotan</p>
        <h1 className="mt-2 text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl xl:text-5xl">
          {video.title}
        </h1>
        <p className="mt-3 text-sm text-muted">
          {video.categories?.name ?? "Tanpa kategori"}
          <span aria-hidden="true"> · </span>
          {video.views.toLocaleString("id-ID")} tayang
        </p>
        {video.description && (
          <p className="mt-4 line-clamp-3 max-w-[52ch] text-[15px] leading-relaxed text-muted">
            {video.description}
          </p>
        )}
        <Link
          href={`/watch/${video.slug}`}
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-6 text-base font-bold text-accent-contrast transition-transform active:scale-[0.98]"
        >
          Tonton sekarang
        </Link>
      </div>
      <Link
        href={`/watch/${video.slug}`}
        className="group relative block overflow-hidden rounded-2xl border border-border lg:col-span-3"
        aria-label={`Tonton ${video.title}`}
      >
        <ThumbImage
          src={video.thumbnail_url}
          alt={`Thumbnail ${video.title}`}
          fetchPriority="high"
          className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0"
        />
      </Link>
    </section>
  );
}

function EmptyState({ q, category }: { q?: string; category?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-6 py-14 text-center">
      <h3 className="text-lg font-bold">Tidak ada video ditemukan</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        {q || category
          ? "Coba kata kunci lain atau hapus filter kategori."
          : "Belum ada video. Admin belum menambahkan apa-apa."}
      </p>
      {(q || category) && (
        <Link
          href="/"
          className="mt-5 inline-flex h-11 items-center rounded-lg bg-accent px-5 text-sm font-bold text-accent-contrast"
        >
          Reset filter
        </Link>
      )}
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="rounded-xl border border-accent bg-accent-soft p-8">
      <h1 className="text-xl font-bold">Situs belum tersambung ke Supabase</h1>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
        Isi <code className="rounded bg-surface px-1.5 py-0.5 text-foreground">NEXT_PUBLIC_SUPABASE_URL</code> dan{" "}
        <code className="rounded bg-surface px-1.5 py-0.5 text-foreground">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> di{" "}
        <code className="rounded bg-surface px-1.5 py-0.5 text-foreground">.env.local</code>, jalankan{" "}
        <code className="rounded bg-surface px-1.5 py-0.5 text-foreground">supabase/schema.sql</code> di SQL Editor
        Supabase, lalu buat satu user admin di menu Authentication. Detail ada di README.
      </p>
    </div>
  );
}

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]?.trim() || undefined;
  return value?.trim() || undefined;
}
