export type VideoSource = "vdohide" | "anonmp4";

export type NormalizedEmbed = {
  source: VideoSource;
  embedUrl: string;
  thumbnailUrl: string | null;
};

const DOMAINS: Record<VideoSource, string[]> = {
  anonmp4: ["anonmp4.art", "anonmp4.to", "anonmp4.help"],
  vdohide: ["vdohide.com", "fembed.co"],
};

const RAW_ID = /^[A-Za-z0-9_-]{6,}$/;
const ANON_EMBED = /^\/(?:embed|v)\/([A-Za-z0-9_-]{6,})\/?$/;

function hostMatches(host: string, domain: string): boolean {
  return host === domain || host.endsWith("." + domain);
}

function hostSource(host: string): VideoSource | null {
  for (const source of Object.keys(DOMAINS) as VideoSource[]) {
    if (DOMAINS[source].some((d) => hostMatches(host, d))) return source;
  }
  return null;
}

/**
 * Normalisasi input admin (embed URL, watch URL, atau raw ID anonmp4)
 * menjadi embed URL yang ter-whitelist. Melempar Error dengan pesan
 * yang bisa ditampilkan ke admin bila input tidak dikenali.
 */
export function normalizeEmbed(input: string, explicitSource?: VideoSource): NormalizedEmbed {
  const raw = input.trim();
  if (!raw) throw new Error("URL embed/ID wajib diisi.");

  if (RAW_ID.test(raw)) {
    if (explicitSource === "anonmp4" || !explicitSource) {
      return anonResult(raw);
    }
    throw new Error("Untuk vdohide, tempel URL embed lengkap, bukan ID saja.");
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("URL tidak valid. Tempel embed URL vdohide atau anonmp4.");
  }
  if (url.protocol !== "https:") {
    throw new Error("URL wajib memakai https://.");
  }

  const host = url.hostname.toLowerCase();
  const source = hostSource(host);
  if (!source) {
    throw new Error("URL tidak dikenali. Gunakan embed URL vdohide atau anonmp4.");
  }

  if (source === "anonmp4") {
    const m = url.pathname.match(ANON_EMBED);
    if (m) return anonResult(m[1], host);
    // Admin kadang tempel URL lain milik anonmp4; terima selama https + host valid.
    return { source, embedUrl: url.toString(), thumbnailUrl: null };
  }

  return { source, embedUrl: url.toString(), thumbnailUrl: null };
}

function anonResult(id: string, host = "anonmp4.art"): NormalizedEmbed {
  return {
    source: "anonmp4",
    embedUrl: `https://${host}/embed/${id}`,
    thumbnailUrl: `https://${host}/thumbs/${id}.webp`,
  };
}

/** Escape wildcard ILIKE Postgres: \ % _ */
export function escapeIlike(q: string): string {
  return q.replace(/[\\%_]/g, (c) => "\\" + c);
}
