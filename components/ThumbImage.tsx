"use client";

import { useState } from "react";

export default function ThumbImage({
  src,
  alt,
  loading,
  fetchPriority,
  className,
}: {
  src: string | null;
  alt: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "auto";
  className?: string;
}) {
  const [current, setCurrent] = useState(src || "/placeholder-thumb.svg");
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={current}
      onError={() => setCurrent("/placeholder-thumb.svg")}
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      className={className}
    />
  );
}
