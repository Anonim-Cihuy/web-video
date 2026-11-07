const providers = [
  {
    name: "anonmp4.art",
    url: "https://anonmp4.art/",
    quota: "hingga 20 GB per file, tanpa akun",
    steps: [
      "Buka anonmp4.art (mirror anonmp4.to), drop file video ke kotak upload.",
      "Tunggu proses selesai, kamu dapat watch link dan embed URL di domain anonmp4.art.",
      "Copy embed URL-nya (format: anonmp4.art/embed/ID).",
    ],
    note: "Upload API (anonmp4api.xyz) mati sejak 2026-11-07, jadi upload lewat situsnya langsung. Thumbnail otomatis aktif lagi lewat https://<host>/thumbs/<id>.webp.",
  },
  {
    name: "catbox.moe",
    url: "https://catbox.moe/",
    quota: "hingga 200 MB per file, tanpa akun",
    steps: [
      "Buka catbox.moe, pilih File, drop video (MP4/WebM, max 200 MB).",
      "Tunggu selesai, dapat direct link format files.catbox.moe/ID.mp4.",
      "Tempel direct link itu ke form video, isi thumbnail manual.",
    ],
    note: "Tanpa iklan, tanpa akun, file permanen. Bukan player pihak ketiga: memakai player native browser di iframe. Film besar tetap lewat vdohide/anonmp4.",
  },
  {
    name: "vdohide.com",
    url: "https://vdohide.com/",
    quota: "hingga 10 GB per file, gratis",
    steps: [
      "Buka vdohide.com, login (bisa pakai akun Google).",
      "Upload video, tunggu transcode selesai.",
      "Copy embed URL dari halaman video.",
    ],
    note: "Thumbnail tidak otomatis, isi manual di form setelah tempel link.",
  },
];

export default function ProviderGuide() {
  return (
    <div className="grid max-w-4xl gap-5 md:grid-cols-2">
      {providers.map((provider) => (
        <section
          key={provider.name}
          className="flex flex-col rounded-xl border border-border bg-surface p-6"
        >
          <h2 className="text-lg font-bold tracking-tight">{provider.name}</h2>
          <p className="mt-0.5 text-xs text-muted">{provider.quota}</p>
          <ol className="mt-4 flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed">
            {provider.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          <p className="mt-3 text-xs leading-relaxed text-muted">{provider.note}</p>
          <a
            href={provider.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex h-11 cursor-pointer items-center justify-center rounded-lg border border-border text-sm font-medium transition-colors hover:bg-surface-2"
          >
            Buka {provider.name}
          </a>
        </section>
      ))}
    </div>
  );
}
