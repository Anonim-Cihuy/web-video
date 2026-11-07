"use client";

import { useRef, useState } from "react";
import Link from "next/link";

type UploadProvider = "catbox" | "anonmp4";

const PROVIDERS: Record<
  UploadProvider,
  { apiUrl: string; maxBytes: number; sizeHint: string; note: string }
> = {
  catbox: {
    apiUrl: "/api/admin/upload-catbox",
    maxBytes: 200 * 1024 * 1024,
    sizeHint: "200 MB",
    note: "Tanpa iklan, tanpa akun, file permanen. Max 200 MB.",
  },
  anonmp4: {
    apiUrl: "/api/admin/upload-anonmp4",
    maxBytes: 20 * 1024 * 1024 * 1024,
    sizeHint: "20 GB",
    note: "API anonmp4 lagi tidak bisa dijangkau — pakai catbox untuk file kecil.",
  },
};

type UploadResult = {
  embedUrl: string;
  thumbnailUrl: string | null;
  title: string;
};

export default function UploadForm() {
  const [provider, setProvider] = useState<UploadProvider>("catbox");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const conf = PROVIDERS[provider];

  function startUpload() {
    if (!file) return;
    if (file.size > conf.maxBytes) {
      setError(`File lebih dari ${conf.sizeHint}. Batas ${provider}.`);
      return;
    }
    setError(null);
    setResult(null);
    setUploading(true);
    setProgress(0);

    const body = new FormData();
    if (provider === "catbox") {
      body.append("reqtype", "fileupload");
      body.append("fileToUpload", file);
    } else {
      body.append("file", file);
    }

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open("POST", conf.apiUrl);
    xhr.timeout = 10 * 60 * 1000;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setUploading(false);
      const text = xhr.responseText;
      let parsed: Record<string, unknown> | null = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = null;
      }

      if (provider === "catbox") {
        // catbox membalas plain text URL direct, bukan JSON
        const url = parsed ? null : text.trim();
        if (xhr.status >= 200 && xhr.status < 300 && url && /^https:\/\/(files\.)?catbox\.moe\//.test(url)) {
          setResult({ embedUrl: url, thumbnailUrl: null, title: defaultTitle(file!) });
          return;
        }
        setError(`catbox gagal: ${short(text)}`);
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300 && parsed?.success) {
        if (provider !== "anonmp4") {
          setError(`Respons ${provider} tidak dikenali. Cek situs provider.`);
          return;
        }
        const videoId = typeof parsed.video_id === "string" ? parsed.video_id : undefined;
        const embedUrl =
          (typeof parsed.embed_url === "string" && parsed.embed_url) ||
          (videoId ? `https://www.anonmp4.to/embed/${videoId}` : null);
        if (!embedUrl) {
          setError("Upload berhasil tapi embed URL tidak ada di respons. Cek anonmp4.to.");
          return;
        }
        setResult({
          embedUrl,
          thumbnailUrl:
            (typeof parsed.thumbnail === "string" && parsed.thumbnail) ||
            (videoId ? `https://cdn.anonmp4.to/thumbs/${videoId}.webp` : null),
          title:
            (typeof parsed.title === "string" && parsed.title) || defaultTitle(file!),
        });
        return;
      }

      const apiError = (parsed?.error as { message?: string } | undefined)?.message;
      setError(apiError ?? `Upload ditolak provider (HTTP ${xhr.status}): ${short(text)}`);
    };
    xhr.onerror = () => {
      setUploading(false);
      setError("Koneksi gagal. Coba lagi, atau upload manual di situs provider lalu tempel link-nya.");
    };
    xhr.ontimeout = () => {
      setUploading(false);
      setError(`Upload timeout. Coba file lebih kecil atau upload manual di situs ${provider}.`);
    };
    xhr.send(body);
  }

  function defaultTitle(f: File) {
    return f.name.replace(/\.[^.]+$/, "");
  }

  function short(text: string) {
    const t = text.trim().replace(/\s+/g, " ");
    return t.length > 140 ? t.slice(0, 140) + "…" : t || "(respons kosong)";
  }

  function cancel() {
    xhrRef.current?.abort();
    setUploading(false);
    setProgress(0);
  }

  if (result) {
    const params = new URLSearchParams({
      embed: result.embedUrl,
      title: result.title,
    });
    if (result.thumbnailUrl) params.set("thumbnail", result.thumbnailUrl);
    return (
      <div className="max-w-2xl rounded-xl border border-border bg-surface p-6">
        <h2 className="text-lg font-bold">Upload berhasil</h2>
        <label htmlFor="embed-out" className="mt-4 block text-sm font-medium">Link video</label>
        <input id="embed-out" readOnly value={result.embedUrl} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm" onFocus={(e) => e.target.select()} />
        <Link
          href={`/admin/video/new?${params.toString()}`}
          className="mt-5 inline-flex h-12 items-center rounded-lg bg-accent px-6 text-sm font-bold text-accent-contrast"
        >
          Lanjut isi detail video
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl rounded-xl border border-border bg-surface p-6">
      <h2 className="text-lg font-bold">Upload langsung dari sini</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        File dikirim lewat server situs ini ke provider (tidak disimpan di server). Setelah
        selesai, lanjut isi judul dan kategori seperti biasa.
      </p>

      <div className="mt-5 flex gap-2" role="radiogroup" aria-label="Provider upload">
        {(Object.keys(PROVIDERS) as UploadProvider[]).map((p) => (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={provider === p}
            disabled={uploading}
            onClick={() => {
              setProvider(p);
              setError(null);
              setResult(null);
            }}
            className={
              "h-11 cursor-pointer rounded-lg border px-5 text-sm font-medium transition-colors " +
              (provider === p
                ? "border-accent bg-accent text-accent-contrast"
                : "border-border hover:bg-surface-2")
            }
          >
            {p} (max {PROVIDERS[p].sizeHint})
          </button>
        ))}
      </div>

      <label htmlFor="file" className="mt-5 block text-sm font-medium">File video</label>
      <input
        id="file"
        type="file"
        accept="video/*"
        disabled={uploading}
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null);
          setError(null);
        }}
        className="mt-1.5 block w-full text-sm text-muted file:mr-4 file:h-11 file:cursor-pointer file:rounded-lg file:border file:border-border file:bg-surface-2 file:px-4 file:text-sm file:font-medium file:text-foreground"
      />

      <p className="mt-3 text-xs text-muted">{conf.note}</p>

      {uploading && (
        <div className="mt-4" role="status" aria-live="polite">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Mengupload ke {provider}...</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full bg-accent transition-[width] duration-150" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {error && <p role="alert" className="mt-4 text-sm font-medium text-red-400">{error}</p>}

      <div className="mt-5 flex gap-2">
        {uploading ? (
          <button type="button" onClick={cancel} className="h-11 cursor-pointer rounded-lg border border-border px-5 text-sm font-medium hover:bg-surface-2">
            Batalkan
          </button>
        ) : (
          <button
            type="button"
            onClick={startUpload}
            disabled={!file}
            className="h-11 cursor-pointer rounded-lg bg-accent px-6 text-sm font-bold text-accent-contrast disabled:opacity-50"
          >
            Mulai upload
          </button>
        )}
      </div>
    </div>
  );
}
