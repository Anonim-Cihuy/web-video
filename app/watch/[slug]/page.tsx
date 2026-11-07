import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRelatedVideos, getVideoBySlug } from "@/lib/data";
import { getSupabaseEnv } from "@/lib/supabase/env";
import VideoGrid from "@/components/VideoGrid";
import IncrementViews from "@/components/IncrementViews";
import { SkeletonGrid } from "@/components/SkeletonCard";

export default function WatchPage(props: PageProps<"/watch/[slug]">) {
  return (
    <Suspense fallback={<WatchFallback />}>
      <WatchContent params={props.params} />
    </Suspense>
  );
}

export async function generateMetadata(
  props: PageProps<"/watch/[slug]">
): Promise<Metadata> {
  if (!getSupabaseEnv()) return { title: "Web Video" };
  try {
    const { slug } = await props.params;
    const video = await getVideoBySlug(slug);
    if (!video) return { title: "Video tidak ditemukan" };
    return {
      title: video.title,
      description: video.description || `Tonton ${video.title} di Web Video.`,
      openGraph: video.thumbnail_url ? { images: [video.thumbnail_url] } : undefined,
    };
  } catch {
    return { title: "Web Video" };
  }
}

function WatchFallback() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="aspect-video w-full animate-pulse rounded-xl bg-surface-2" />
      <div className="mt-4 h-8 w-2/3 animate-pulse rounded bg-surface-2" />
    </div>
  );
}

async function WatchContent({
  params,
}: {
  params: PageProps<"/watch/[slug]">["params"];
}) {
  const { slug } = await params;

  if (!getSupabaseEnv()) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <p className="text-muted">
          Situs belum tersambung ke Supabase. Baca README untuk setup.{" "}
          <Link href="/" className="text-accent underline underline-offset-2">Kembali ke beranda</Link>
        </p>
      </div>
    );
  }

  const video = await getVideoBySlug(slug);
  if (!video) notFound();

  const related = await getRelatedVideos(video.category_id, video.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <IncrementViews videoId={video.id} />

      <Link
        href="/"
        className="text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        Kembali ke beranda
      </Link>

      <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
        <iframe
          src={video.embed_url}
          title={`Pemutar video: ${video.title}`}
          allowFullScreen
          loading="eager"
          referrerPolicy="strict-origin-when-cross-origin"
          className="h-full w-full border-0"
        />
      </div>

      <header className="mt-5">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{video.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
          {video.categories && (
            <Link
              href={`/?category=${video.categories.slug}`}
              className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-surface-2"
            >
              {video.categories.name}
            </Link>
          )}
          <span>{video.views.toLocaleString("id-ID")} tayang</span>
          <span aria-hidden="true">·</span>
          <time dateTime={video.created_at}>
            {new Date(video.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
          <span aria-hidden="true">·</span>
          <span>Embed {video.source === "anonmp4" ? "anonmp4" : "vdohide"}</span>
        </div>
        {video.description && (
          <p className="mt-4 max-w-prose whitespace-pre-line text-[15px] leading-relaxed text-foreground/90">
            {video.description}
          </p>
        )}
      </header>

      {related.length > 0 && (
        <section aria-labelledby="terkait" className="mt-10">
          <h2 id="terkait" className="text-xl font-bold tracking-tight">Video serupa</h2>
          <div className="mt-4">
            <VideoGrid videos={related} />
          </div>
        </section>
      )}
    </div>
  );
}
