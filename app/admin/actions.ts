"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizeEmbed, type VideoSource } from "@/lib/embed";
import { slugify } from "@/lib/slug";
import type { AdminActionState } from "@/lib/types";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function str(formData: FormData, key: string, max: number): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function requireUser() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, user: null };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function parseVideoForm(formData: FormData) {
  const title = str(formData, "title", 120);
  const slugInput = str(formData, "slug", 60);
  const description = str(formData, "description", 2000);
  const embedInput = str(formData, "embed", 500);
  const sourceRaw = str(formData, "source", 20);
  const categoryId = str(formData, "category_id", 64);
  const thumbnailInput = str(formData, "thumbnail_url", 500);
  const featured = formData.get("featured") === "on";

  if (title.length < 3) return { error: "Judul minimal 3 karakter." } as const;

  let slug = slugInput;
  if (!slug) {
    try {
      slug = slugify(title);
    } catch (e) {
      return { error: (e as Error).message } as const;
    }
  }
  if (!SLUG_RE.test(slug)) {
    return { error: "Slug hanya boleh huruf kecil, angka, dan tanda hubung." } as const;
  }

  const explicitSource: VideoSource | undefined =
    sourceRaw === "anonmp4" || sourceRaw === "vdohide" ? sourceRaw : undefined;

  let embed;
  try {
    embed = normalizeEmbed(embedInput, explicitSource);
  } catch (e) {
    return { error: (e as Error).message } as const;
  }

  let thumbnailUrl = thumbnailInput || embed.thumbnailUrl || null;
  if (thumbnailUrl && !/^https:\/\/.+/i.test(thumbnailUrl)) {
    return { error: "URL thumbnail wajib https://." } as const;
  }

  if (!categoryId) return { error: "Kategori wajib dipilih." } as const;

  return {
    values: {
      slug,
      title,
      description,
      embed_url: embed.embedUrl,
      source: embed.source,
      thumbnail_url: thumbnailUrl,
      category_id: categoryId,
      featured,
    },
  } as const;
}

function mapDbError(message: string, code?: string): string {
  if (code === "23505") return "Slug sudah dipakai video lain. Ganti slug.";
  if (code === "23503") return "Kategori masih dipakai video, tidak bisa dihapus.";
  return `Gagal menyimpan: ${message}`;
}

export async function createVideo(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const { supabase, user } = await requireUser();
  if (!supabase || !user) return { error: "Sesi habis. Login ulang." };

  const parsed = parseVideoForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { error } = await supabase.from("videos").insert(parsed.values);
  if (error) return { error: mapDbError(error.message, error.code) };

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/watch/${parsed.values.slug}`);
  redirect("/admin");
}

export async function updateVideo(
  id: string,
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const { supabase, user } = await requireUser();
  if (!supabase || !user) return { error: "Sesi habis. Login ulang." };

  const parsed = parseVideoForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { error } = await supabase.from("videos").update(parsed.values).eq("id", id);
  if (error) return { error: mapDbError(error.message, error.code) };

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/watch/${parsed.values.slug}`);
  redirect("/admin");
}

export async function deleteVideo(id: string): Promise<AdminActionState> {
  const { supabase, user } = await requireUser();
  if (!supabase || !user) return { error: "Sesi habis. Login ulang." };

  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) return { error: mapDbError(error.message, error.code) };

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}

export async function createCategory(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const { supabase, user } = await requireUser();
  if (!supabase || !user) return { error: "Sesi habis. Login ulang." };

  const name = str(formData, "name", 60);
  if (name.length < 2) return { error: "Nama kategori minimal 2 karakter." };

  let slug = str(formData, "slug", 60).toLowerCase();
  if (!slug) {
    try {
      slug = slugify(name);
    } catch (e) {
      return { error: (e as Error).message };
    }
  }
  if (!SLUG_RE.test(slug)) {
    return { error: "Slug hanya boleh huruf kecil, angka, dan tanda hubung." };
  }

  const { error } = await supabase.from("categories").insert({ name, slug });
  if (error) return { error: mapDbError(error.message, error.code) };

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<AdminActionState> {
  const { supabase, user } = await requireUser();
  if (!supabase || !user) return { error: "Sesi habis. Login ulang." };

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: mapDbError(error.message, error.code) };

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect("/admin");
}
