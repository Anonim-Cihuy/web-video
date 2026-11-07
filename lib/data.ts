import "server-only";
import { createClient } from "@/lib/supabase/server";
import { escapeIlike } from "@/lib/embed";
import type { Category, Video } from "@/lib/types";

const VIDEO_SELECT =
  "id, slug, title, description, embed_url, source, thumbnail_url, category_id, views, featured, created_at, categories!inner(name, slug)";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getVideos(filters: {
  q?: string;
  category?: string;
}): Promise<Video[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase.from("videos").select(VIDEO_SELECT);

  if (filters.category) {
    query = query.eq("categories.slug", filters.category);
  }
  if (filters.q) {
    const pattern = `%${escapeIlike(filters.q.slice(0, 100))}%`;
    query = query.or(`title.ilike.${pattern},description.ilike.${pattern}`);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(48);
  if (error) throw new Error(error.message);

  return (data ?? []) as unknown as Video[];
}

export async function getFeaturedVideo(): Promise<Video | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("videos")
    .select(VIDEO_SELECT)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (data) return data as unknown as Video;

  const { data: latest, error: latestError } = await supabase
    .from("videos")
    .select(VIDEO_SELECT)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latestError) throw new Error(latestError.message);
  return (latest as unknown as Video) ?? null;
}

export async function getVideoBySlug(slug: string): Promise<Video | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("videos")
    .select(VIDEO_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as unknown as Video) ?? null;
}

export async function getRelatedVideos(
  categoryId: string,
  excludeId: string
): Promise<Video[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("videos")
    .select(VIDEO_SELECT)
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Video[];
}

export async function getAllVideosForAdmin(): Promise<Video[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("videos")
    .select(VIDEO_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Video[];
}
