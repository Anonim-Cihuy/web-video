"use client";

import { useState } from "react";
import type { Video } from "@/lib/types";
import ThumbImage from "./ThumbImage";

function autoplayUrl(embedUrl: string): string {
  try {
    const u = new URL(embedUrl);
    u.searchParams.set("autoplay", "1");
    u.searchParams.set("mute", "1");
    u.searchParams.set("muted", "1");
    return u.toString();
  } catch {
    return embedUrl;
  }
}

export default function HoverPreview({
  video,
  alt,
  fetchPriority,
  className,
}: {
  video: Pick<Video, "source" | "embed_url" | "thumbnail_url" | "title">;
  alt: string;
  fetchPriority?: "high" | "auto";
  className?: string;
}) {
  const [active, setActive] = useState(false);

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      <ThumbImage
        src={video.thumbnail_url}
        alt={alt}
        loading={fetchPriority === "high" ? "eager" : "lazy"}
        fetchPriority={fetchPriority}
        className={className}
      />
      {active &&
        (video.source === "catbox" ? (
          <video
            ref={(el) => {
              if (el) el.muted = true;
            }}
            src={video.embed_url}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full bg-black object-cover"
          />
        ) : (
          <iframe
            src={autoplayUrl(video.embed_url)}
            title={`Preview ${video.title}`}
            allow="autoplay; fullscreen; encrypted-media"
            referrerPolicy="strict-origin-when-cross-origin"
            className="pointer-events-none absolute inset-0 h-full w-full border-0 bg-black"
          />
        ))}
    </div>
  );
}
