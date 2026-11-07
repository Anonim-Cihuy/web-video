import { createClient } from "@/lib/supabase/server";

export const maxDuration = 3600;

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
      signal: AbortSignal.timeout(30 * 60 * 1000),
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
