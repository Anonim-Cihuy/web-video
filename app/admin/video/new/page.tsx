import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getCategories } from "@/lib/data";
import AdminVideoForm from "@/components/AdminVideoForm";
import { createVideo } from "../../actions";

export const metadata = { title: "Tambah Video" };

export default function NewVideoPage(props: PageProps<"/admin/video/new">) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><div className="h-72 animate-pulse rounded-xl bg-surface-2" /></div>}>
      <NewVideoContent searchParams={props.searchParams} />
    </Suspense>
  );
}

async function NewVideoContent({
  searchParams,
}: {
  searchParams: PageProps<"/admin/video/new">["searchParams"];
}) {
  if (!getSupabaseEnv()) redirect("/admin");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase!.auth.getUser();
  if (!user) redirect("/admin");

  const [categories, sp] = await Promise.all([getCategories(), searchParams]);
  const preset = (key: string) => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/admin" className="text-sm font-medium text-muted hover:text-foreground">
        Kembali ke dashboard
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Tambah video</h1>
      <div className="mt-6">
        <AdminVideoForm
          categories={categories}
          action={createVideo}
          defaults={{
            title: preset("title"),
            embed: preset("embed"),
            thumbnail_url: preset("thumbnail"),
          }}
        />
      </div>
    </div>
  );
}
