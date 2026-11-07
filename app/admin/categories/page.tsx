import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getCategories } from "@/lib/data";
import CategoryManager from "@/components/CategoryManager";

export const metadata = { title: "Kelola Kategori" };

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><div className="h-64 animate-pulse rounded-xl bg-surface-2" /></div>}>
      <CategoriesContent />
    </Suspense>
  );
}

async function CategoriesContent() {
  if (!getSupabaseEnv()) redirect("/admin");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase!.auth.getUser();
  if (!user) redirect("/admin");

  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/admin" className="text-sm font-medium text-muted hover:text-foreground">
        Kembali ke dashboard
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Kelola kategori</h1>
      <div className="mt-6">
        <CategoryManager categories={categories} />
      </div>
    </div>
  );
}
