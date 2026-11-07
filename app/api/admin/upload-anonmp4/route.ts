import { createClient } from "@/lib/supabase/server";

// Batas Hobby plan = 300s; lebih dari itu deploy Vercel gagal
export const maxDuration = 300;

const UPSTREAM = "https://anonmp4api.xyz/upload";

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

  let upstream: Response;
  try {
    upstream = await fetch(UPSTREAM, {
      method: "POST",
      headers: { "content-type": contentType, accept: "application/json" },
      // @ts-expect-error undici butuh duplex untuk body streaming
      duplex: "half",
      body: request.body,
      signal: AbortSignal.timeout((300 - 5) * 1000), // 5s di bawah maxDuration biar error-nya JSON, bukan hard kill
    });
  } catch (e) {
    return Response.json(
      {
        success: false,
        error: {
          message: `API anonmp4 tidak bisa dijangkau dari server: ${(e as Error).message}`,
        },
      },
      { status: 502 }
    );
  }

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
