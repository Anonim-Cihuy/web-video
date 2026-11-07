import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getCategories } from "@/lib/data";
import AdminVideoForm from "@/components/AdminVideoForm";
import { updateVideo } from "../../../actions";

export const metadata = { title: "Edit Video" };

export default function EditVideoPage(props: PageProps<"/admin/video/[id]/edit">) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><div className="h-72 animate-pulse rounded-xl bg-surface-2" /></div>}>
      <EditVideoContent params={props.params} />
    </Suspense>
  );
}

async function EditVideoContent({
  params,
}: {
  params: PageProps<"/admin/video/[id]/edit">["params"];
}) {
  if (!getSupabaseEnv()) redirect("/admin");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase!.auth.getUser();
  if (!user) redirect("/admin");

  const { id } = await params;
  const [{ data: video, error }, categories] = await Promise.all([
    supabase!.from("videos").select("*").eq("id", id).maybeSingle(),
    getCategories(),
  ]);
  if (error) throw new Error(error.message);
  if (!video) notFound();

  const boundAction = updateVideo.bind(null, video.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/admin" className="text-sm font-medium text-muted hover:text-foreground">
        Kembali ke dashboard
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Edit video</h1>
      <div className="mt-6">
        <AdminVideoForm
          categories={categories}
          action={boundAction}
          defaults={{
            title: video.title,
            slug: video.slug,
            description: video.description,
            embed: video.embed_url,
            source: video.source,
            category_id: video.category_id,
            thumbnail_url: video.thumbnail_url ?? "",
            featured: video.featured,
          }}
        />
      </div>
    </div>
  );
}
