"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export default function IncrementViews({ videoId }: { videoId: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const supabase = createClient();
    if (!supabase) return;
    supabase.rpc("increment_views", { vid: videoId }).then(() => {});
  }, [videoId]);
  return null;
}
