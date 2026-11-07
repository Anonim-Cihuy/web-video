"use client";

import { useRef, useState } from "react";
import Link from "next/link";

const API_URL = "/api/admin/upload-anonmp4";
const MAX_BYTES = 20 * 1024 * 1024 * 1024;

type UploadResult = {
  embedUrl: string;
  thumbnailUrl: string | null;
  title: string;
};

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  function startUpload() {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError("File lebih dari 20 GB. Batas API anonmp4.");
      return;
    }
    setError(null);
    setResult(null);
    setUploading(true);
    setProgress(0);

    const body = new FormData();
    body.append("file", file);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open("POST", API_URL);
    xhr.timeout = 10 * 60 * 1000;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setUploading(false);
      let parsed: Record<string, unknown> | null = null;
      try {
        parsed = JSON.parse(xhr.responseText);
      } catch {
        setError(`Upload selesai tapi respons tidak dikenali (HTTP ${xhr.status}). Cek anonmp4.to apakah videomu berhasil.`);
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300 && parsed?.success) {
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
            (typeof parsed.title === "string" && parsed.title) ||
            file.name.replace(/\.[^.]+$/, ""),
        });
      } else {
        const apiError = parsed?.error as { message?: string } | undefined;
        setError(apiError?.message ?? `Upload ditolak provider (HTTP ${xhr.status}).`);
      }
    };
    xhr.onerror = () => {
      setUploading(false);
      setError("Koneksi gagal. Kemungkinan server situs tidak bisa menjangkau anonmp4.to/anonmp4api.xyz (jaringan atau API sedang down). Coba upload manual di anonmp4.to lalu tempel link-nya.");
    };
    xhr.ontimeout = () => {
      setUploading(false);
      setError("Upload timeout. Coba file lebih kecil atau upload manual di anonmp4.to.");
    };
    xhr.send(body);
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
        <label htmlFor="embed-out" className="mt-4 block text-sm font-medium">Embed URL</label>
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
      <h2 className="text-lg font-bold">Upload langsung ke anonmp4</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        File dikirim lewat server situs ini ke anonmp4.to (tidak disimpan di server). Max 20 GB.
        Setelah selesai, kamu isi judul dan kategori seperti biasa.
      </p>

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

      {uploading && (
        <div className="mt-4" role="status" aria-live="polite">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Mengupload ke anonmp4...</span>
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
