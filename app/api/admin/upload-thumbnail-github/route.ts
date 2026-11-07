import { createClient } from "@/lib/supabase/server";

// Thumbnail manual disimpan sebagai commit di repo GitHub publik,
// variable env GITHUB_REPO="owner/repo" + GITHUB_TOKEN (fine-grained,
// Contents: Read and Write). Batas Contents API = 1 MB per file.
const MAX_BYTES = 1000 * 1024;

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

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

  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  if (!repo || !token) {
    return Response.json(
      { success: false, error: { message: "GITHUB_TOKEN / GITHUB_REPO belum diset di env server." } },
      { status: 503 }
    );
  }

  let file: FormDataEntryValue | null = null;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return Response.json(
      { success: false, error: { message: "Diharapkan multipart/form-data." } },
      { status: 400 }
    );
  }
  if (!(file instanceof File) || file.size === 0) {
    return Response.json(
      { success: false, error: { message: "File gambar wajib ada." } },
      { status: 400 }
    );
  }
  const ext = EXT[file.type] ?? "jpg";
  if (!EXT[file.type] && !file.type.startsWith("image/")) {
    return Response.json(
      { success: false, error: { message: "Hanya gambar (PNG/JPEG/WebM) yang diterima." } },
      { status: 415 }
    );
  }
  if (file.size > MAX_BYTES) {
    return Response.json(
      { success: false, error: { message: "Gambar lebih dari 1 MB. Kecilkan dulu." } },
      { status: 413 }
    );
  }

  const path = `thumbnails/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  let res: Response;
  try {
    res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
        accept: "application/vnd.github+json",
        "content-type": "application/json",
        "user-agent": "web-video-admin",
      },
      body: JSON.stringify({
        message: "thumbnail via admin",
        content: Buffer.from(await file.arrayBuffer()).toString("base64"),
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (e) {
    return Response.json(
      { success: false, error: { message: `GitHub API tidak bisa dijangkau: ${(e as Error).message}` } },
      { status: 502 }
    );
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return Response.json(
      {
        success: false,
        error: { message: `GitHub menolak upload (HTTP ${res.status}): ${detail.slice(0, 200)}` },
      },
      { status: 502 }
    );
  }

  return Response.json({
    success: true,
    // Commit baru ke default branch; raw.githubusercontent hotlink aman utk gambar.
    url: `https://raw.githubusercontent.com/${repo}/main/${path}`,
  });
}
