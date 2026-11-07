import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import ProviderGuide from "@/components/ProviderGuide";

export const metadata = { title: "Upload Video" };

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><div className="h-72 animate-pulse rounded-xl bg-surface-2" /></div>}>
      <UploadContent />
    </Suspense>
  );
}

async function UploadContent() {
  if (!getSupabaseEnv()) redirect("/admin");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase!.auth.getUser();
  if (!user) redirect("/admin");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/admin" className="text-sm font-medium text-muted hover:text-foreground">
        Kembali ke dashboard
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Cara upload video</h1>
      <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted">
        Video di-host di provider pihak ketiga (gratis). Upload langsung di kotak Di bawah ini
        (catbox/anonmp4), atau upload di situs provider sendiri lalu tempel embed URL-nya ke form.
        Dua menit.
      </p>
      <div className="mt-6">
        <ProviderGuide />
      </div>
      <div className="mt-6 max-w-4xl rounded-xl border border-accent bg-accent-soft p-5">
        <h2 className="text-base font-bold">Setelah dapat embed URL</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Tempel di form ini. Untuk anonmp4 thumbnail terisi otomatis; untuk vdohide/catbox isi thumbnail manual.
        </p>
        <Link
          href="/admin/video/new"
          className="mt-4 inline-flex h-11 items-center rounded-lg bg-accent px-6 text-sm font-bold text-accent-contrast"
        >
          Tempel link embed di sini
        </Link>
      </div>
    </div>
  );
}
