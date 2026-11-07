import Link from "next/link";
import type { Video } from "@/lib/types";
import ThumbImage from "./ThumbImage";

export default function VideoCard({ video }: { video: Video }) {
  return (
    <Link
      href={`/watch/${video.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="relative aspect-video overflow-hidden bg-surface-2">
        <ThumbImage
          src={video.thumbnail_url}
          alt={`Thumbnail ${video.title}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-foreground">
          {video.title}
        </h3>
        <p className="mt-auto text-xs text-muted">
          {video.categories?.name ?? "Tanpa kategori"}
          <span aria-hidden="true"> · </span>
          {video.views.toLocaleString("id-ID")} tayang
        </p>
      </div>
    </Link>
  );
}
