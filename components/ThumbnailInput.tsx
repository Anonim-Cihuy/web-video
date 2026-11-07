"use client";

import { useRef, useState } from "react";

const input =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-accent";

export default function ThumbnailInput({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState<"idle" | "uploading" | "done" | "fail">("idle");
  const [msg, setMsg] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function upload(f: File) {
    setMsg(null);
    setBusy("uploading");
    const abort = new AbortController();
    abortRef.current = abort;
    try {
      const body = new FormData();
      body.append("file", f);
      const res = await fetch("/api/admin/upload-thumbnail-github", {
        method: "POST",
        body,
        signal: abort.signal,
      });
      const data = await res.json().catch(() => null as Record<string, unknown> | null);
      const url = typeof data?.url === "string" ? data.url : null;
      if (res.ok && url) {
        setValue(url);
        setBusy("done");
      } else {
        const message =
          (data?.error as { message?: string } | undefined)?.message ??
          `Upload ditolak (HTTP ${res.status}).`;
        setMsg(message);
        setBusy("fail");
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return setBusy("idle");
      setMsg(`Gagal upload: ${(e as Error).message}`);
      setBusy("fail");
    }
  }

  function setError(v: string | null) {
    setMsg(v);
  }

  return (
    <>
      <label htmlFor="thumbnail_url" className="text-sm font-medium">URL thumbnail</label>
      <input
        id="thumbnail_url"
        name="thumbnail_url"
        type="url"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={input}
        placeholder="https://... (otomatis untuk catbox/anonmp4)"
      />
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={busy === "uploading"}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
          className="block text-xs text-muted file:mr-3 file:h-9 file:cursor-pointer file:rounded-lg file:border file:border-border file:bg-surface-2 file:px-3 file:text-xs file:font-medium"
        />
        <span className="text-xs text-muted">
          {busy === "uploading" && "Upload ke GitHub…"}
          {busy === "done" && "Tersimpan ke GitHub ✓"}
          {busy === "fail" && (msg ?? "Upload gagal.")}
        </span>
      </div>
    </>
  );
}
