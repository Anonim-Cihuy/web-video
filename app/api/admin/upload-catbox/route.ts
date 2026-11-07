import { createClient } from "@/lib/supabase/server";

// Batas Hobby plan = 300s; lebih dari itu deploy Vercel gagal
export const maxDuration = 300;

const UPSTREAM = "https://catbox.moe/user/api.php";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return Response.json(
      { success: false, error: { message: "Supabase belum dikonfigurasi." } },
      { status: 503 }
    );
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json(
      { success: false, error: { message: "Sesi habis. Login ulang." } },
      { status: 401 }
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data")) {
    return Response.json(
      { success: false, error: { message: "Diharapkan multipart/form-data." } },
      { status: 400 }
    );
  }

  // shortcut: duplikat pola upload-anonmp4 karena multipart di-stream
  // langsung (tidak bisa disuntik fieldReqtype di sini); client yang harus
  // mengirim field reqtype=fileupload & fileToUpload. Upgrade: helper bridging
  // kalau provider ketiga butuh pola sama.
  let upstream: Response;
  try {
    upstream = await fetch(UPSTREAM, {
      method: "POST",
      headers: { "content-type": contentType, accept: "*/*" },
      // @ts-expect-error undici butuh duplex untuk body streaming
      duplex: "half",
      body: request.body,
      signal: AbortSignal.timeout((300 - 5) * 1000),
    });
  } catch (e) {
    return Response.json(
      {
        success: false,
        error: {
          message: `API catbox tidak bisa dijangkau dari server: ${(e as Error).message}`,
        },
      },
      { status: 502 }
    );
  }

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "text/plain",
    },
  });
}
