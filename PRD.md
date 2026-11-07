# PRD — Web Video Streaming ("Web Video")

| Metadata | |
|---|---|
| Versi | 1.0 (draft) |
| Status | Proposed — belum diimplementasikan |
| Tanggal | 2026-11-07 |
| Audience | Developer / coding agent yang membangun proyek ini |
| Tipe proyek | Web application (full-stack, kecil) + admin panel |

---

## 1. Executive Summary

Situs nonton video online. Konten video **tidak di-host sendiri** — diputar via iframe embed dari dua layanan free video hosting: **vdohide.com** dan **anonmp4.to**. Situs menyediakan browsing, pencarian, filter kategori, halaman tonton, dan admin panel untuk mengelola daftar video. Dibangun dengan Next.js + Supabase, di-host gratis di Vercel. Font wajib **Space Grotesk**. Target: user-friendly, biaya operasional Rp 0 (free tier).

Fase 1 = MVP (admin paste link embed). Fase 2 = upload file langsung dari admin panel via API publik anonmp4.

## 2. Problem, Goals, Success Metrics

**Masalah:** Belum ada situs sederhana untuk mengumpulkan & menonton embed video dari vdohide/anonmp4 dengan UX yang rapi dan dark/light mode.

**Goals:**
- Pengunjung bisa menemukan & menonton video tanpa registrasi.
- Admin (pemilik situs) bisa menambah/edit/hapus video tanpa menyentuh kode.
- Semua berjalan di free tier.

**Non-goals (eksplisit):**
- Tidak ada hosting video sendiri, transcoding, atau HLS pipeline sendiri.
- Tidak ada akun user publik, watchlist, atau komentar (belum diminta).
- Tidak ada monetisasi/iklan.
- Tidak ada mobile app.

**Success metrics (proposal, bukan komitmen):**
- Halaman watch render iframe player < 2 detik (LCP pada koneksi normal, diukur via Vercel Analytics atau Lighthouse manual).
- Admin menambah video baru < 1 menit (paste link → tersimpan → tampil di home).
- Lighthouse accessibility ≥ 90 di halaman publik.

## 3. Users, Actors, Permissions

| Aktor | Deskripsi | Permission |
|---|---|---|
| Pengunjung (publik) | Nonton & cari video | Read-only: lihat home, search, watch page. Tidak bisa login. |
| Admin | Pemilik situs, 1 akun | Full CRUD video & kategori via `/admin` (Supabase Auth, email+password) |
| anonmp4 API (eksternal) | `anonmp4api.xyz` — upload & info video, **tanpa auth** | Dipakai fase 2 via proxy server-side |
| vdohide / anonmp4 player | Iframe embed | Pihak ketiga, di luar kendali kita |

Tidak ada role system. Satu admin tunggal. Jangan bikin tabel roles.

## 4. Scope & Priorities

### P0 — MVP (fase 1)
- [ ] Home: hero video unggulan + grid video terbaru + filter kategori (chip) + search bar
- [ ] Halaman watch `/watch/[slug]`: iframe player 16:9, judul, deskripsi, views, related videos (kategori sama)
- [ ] Search: query param `?q=`, filter judul/deskripsi, server-side
- [ ] Admin `/admin`: login (Supabase Auth), list video, tambah/edit/hapus (paste embed link)
- [ ] Auto-detect source (vdohide vs anonmp4) dari URL; auto-thumbnail untuk anonmp4
- [ ] Toggle dark/light (default dark), Space Grotesk di seluruh situs
- [ ] Responsive (mobile → desktop), loading/empty/error states
- [ ] SEO dasar: metadata per halaman watch, Open Graph

### P1 — Fase 2
- [ ] Upload file langsung dari admin panel via API anonmp4 (`POST https://anonmp4api.xyz/upload`, `multipart/form-data`, field `file`, no auth) melalui Next.js route handler sebagai proxy
- [ ] Auto-fill `embed_url` & `thumbnail_url` dari response API (`embed_url`, `thumbnail`)
- [ ] Counter views (RPC `increment_views`)

### P2 — Nanti / bukan sekarang
- Pagination cursor-based (MVP cukup LIMIT 48 + "load more" sederhana atau tidak ada)
- Sitemap.xml otomatis
- Rate limiting views counter

### Out of scope
Komentar, akun publik, watchlist, notifikasi, rekomendasi ML, direct upload vdohide (vdohide tidak punya API upload publik terdokumentasi — upload vdohide selalu manual di web mereka).

## 5. Functional Requirements

### FR-001 — Browsing & kategori (P0)
- **Entry:** `/`
- Menampilkan: hero (1 video `featured=true` terbaru; kalau tidak ada, video terbaru), grid kartu video (thumbnail, judul, kategori, durasi bila ada), chip kategori ("Semua" + daftar kategori), search bar.
- Klik kartu → `/watch/[slug]`.
- Filter kategori via query param `?category=<slug>`. Kombinasi `?q=` + `?category=` didukung.
- Empty state: "Tidak ada video ditemukan" + tombol reset filter.
- Loading: skeleton card (bukan spinner polos).

### FR-002 — Pencarian (P0)
- Input search bar submit → `/?q=<query>` (GET, server-side render hasil).
- Match: `title ILIKE '%q%' OR description ILIKE '%q%'` (case-insensitive).
- Sanitasi: query trimmed, max 100 char, escape karakter wildcard ILIKE (`%`, `_`, `\`) di server sebelum dipakai.
- Hasil kosong → empty state (lihat FR-001).

### FR-003 — Halaman watch (P0)
- **Entry:** `/watch/[slug]`
- Lookup video by slug. Tidak ketemu → 404 page ramah (judul + link kembali ke home).
- Render iframe embed 16:9 (`aspect-video`), `allowfullscreen`, `loading="lazy"`, `title=<judul video>` (a11y).
- Di bawah player: judul (h1), kategori chip, views count, deskripsi, tanggal upload.
- Related videos: max 8 video dari kategori yang sama, exclude video aktif.
- Increment views: fase 2 (P1). Di P0 tampilkan views apa adanya.
- Escape: jangan pernah render `embed_url` sebagai HTML; hanya sebagai nilai atribut `src`.

### FR-004 — Admin login (P0)
- **Entry:** `/admin`
- Belum login → form email + password (Supabase Auth `signInWithPassword`). Error → pesan generik "Email atau password salah" (jangan bocorkan mana yang salah).
- Sudah login → dashboard. Logout button. Session via cookie (Supabase SSR helpers).
- Semua halaman/aksi admin selain login wajib cek session server-side; redirect ke `/admin` kalau tidak ada.

### FR-005 — Admin CRUD video (P0)
- List: tabel/grid video (thumbnail kecil, judul, kategori, views, tanggal, aksi edit/hapus). Urut terbaru dulu.
- Tambah/edit form fields:

| Field | Type | Validasi |
|---|---|---|
| Judul | text | required, 3–120 char |
| Slug | text | required, unique, regex `^[a-z0-9]+(?:-[a-z0-9]+)*$`, auto-generate dari judul (editable) |
| Deskripsi | textarea | optional, max 2000 char |
| Embed URL atau ID | text | required; lihat aturan FR-006 |
| Kategori | select | required, dari tabel `categories` |
| Thumbnail URL | text | optional; auto untuk anonmp4 (FR-006), manual untuk vdohide; harus URL absolut http(s) valid |
| Featured | checkbox | optional, default false |

- Hapus: konfirmasi ("Hapus video X? Tidak bisa dibatalkan.") sebelum delete. Hard delete (bukan soft delete — skala kecil).
- Sukses → toast/notifikasi inline + redirect ke list. Gagal → pesan error spesifik dari DB (mis. slug duplikat → "Slug sudah dipakai").
- Semua mutasi via **Next.js Server Actions**, bukan API routes (kecuali proxy upload fase 2).

### FR-006 — Auto-detect source & thumbnail (P0)
Input admin bisa berupa embed URL penuh, watch URL, atau raw ID. Normalisasi di server:

| Input mengandung | Source | embed_url hasil | Thumbnail default |
|---|---|---|---|
| `anonmp4.to/embed/<id>` / `.art` / `.help` (atau `/v/<id>` ekuivalen) ditambah host pengacuan apa adanya | `anonmp4` | embed URL pada host yang sama dengan input (`https://<host>/embed/<id>`) | `https://<host>/thumbs/<id>.webp` |
| `vdohide.com/embed/<id>` (atau URL embed vdohide lainnya) | `vdohide` | URL embed apa adanya (tervalidasi http/https) | kosong — admin isi manual |
| Hanya ID (regex `^[A-Za-z0-9_-]{6,}$`) | user pilih via dropdown | dibangun dari template source terpilih | sesuai source |
| Tidak cocok | — | tolak: "URL tidak dikenali. Gunakan embed URL vdohide atau anonmp4." | — |

Validasi embed_url final: protokol wajib `https:`, host harus salah satu dari whitelist: `vdohide.com`, `*.vdohide.com`, `fembed.co`, `*.fembed.co` (backend player vdohide), `anonmp4.art`, `*.anonmp4.art`, `anonmp4.to`, `*.anonmp4.to`, `anonmp4.help`, `*.anonmp4.help`. Tolak host lain (mencegah admin/pihak lain menyelipkan iframe jahat). Per 2026-11-07 embed anonmp4 yang aktif ada di domain `anonmp4.art`; `anonmp4.to` dan `anonmp4.help` tetap diterima sebagai legacy. `cdn.anonmp4.to` sudah tidak ada di DNS; thumbnail bekerja di `https://<host>/thumbs/<id>.webp`.

### FR-007 — Admin CRUD kategori (P0, minimal)
- Bisa tambah & hapus kategori (nama + slug). Slug regex sama seperti video. Tidak bisa hapus kategori yang dipakai video (FK `ON DELETE RESTRICT` → tampilkan error ramah).

### FR-008 — Upload via anonmp4 API (P1, fase 2)
- Form upload di `/admin/upload`: pilih file video (`video/*`, maks 20 GB, mengikuti batas API anonmp4).
- Browser POST multipart ke route handler `/api/admin/upload-anonmp4` (wajib session admin) → route handler forward ke `https://anonmp4api.xyz/upload` (field `file`) → response JSON:
  ```json
  { "success": true, "video_id": "...", "title": "...", "thumbnail": "https://cdn.anonmp4.to/thumbs/<id>.webp", "watch_url": "...", "embed_url": "https://anonmp4.to/embed/<id>", "upload_date": "..." }
  ```
- Setelah sukses: form dialihkan ke `/admin/video/new` dengan judul, embed_url, dan thumbnail ter-prefill dari response API (bukan draft DB, karena `category_id` wajib).
- Catatan deploy: di Vercel (serverless hobby) ada batas body request ±4.5 MB, jadi upload besar lewat proxy ini hanya praktis di self-host (`npm run start` / `next start` di VPS). Di Vercel, pakai alur paste-link atau upload manual di anonmp4.to.
- Catatan jaringan: per 2026-11-07 `anonmp4api.xyz` tidak bisa dijangkau (503/timeout) dari jaringan uji; proxy mengembalikan 502 dengan pesan jelas. Alur paste-link tidak terpengaruh.
- Gagal: tampilkan `error.message` dari API bila ada; timeout 10 menit; file tidak pernah disimpan di server kita.
- **Catatan verifikasi:** signature response di atas diambil dari dokumentasi publik anonmp4 (2026). Wajib re-test `POST` nyata sekali saat implementasi sebelum dianggap final.

### FR-009 — Increment views (P1, fase 2)
- Saat halaman watch dirender client-side, panggil RPC `increment_views(video_id uuid)` sekali per page view (fire-and-forget, `navigator.sendBeacon` atau fetch no-cors). RPC `SECURITY DEFINER`, hanya increment `views = views + 1`, tidak mengembalikan data sensitif.
- Tidak ada dedup per user — diterima apa adanya untuk skala kecil.

## 6. User Journeys

**J1 — Pengunjung nonton video:**
Home → scroll grid / pilih kategori chip / ketik search → klik kartu → halaman watch → iframe player autoplay sesuai kebijakan provider → selesai. Klik related video → watch berikutnya.

**J2 — Admin tambah video (fase 1):**
Buka `/admin` → login → klik "Tambah Video" → upload video manual di situs vdohide/anonmp4 dulu → paste embed URL → isi judul (slug auto), kategori, deskripsi → Simpan → video langsung tampil di home.

**J3 — Admin tambah video (fase 2):**
`/admin/upload` → pilih file → progress bar → otomatis dapat draft (embed_url + thumbnail auto) → lengkapi kategori/deskripsi → Simpan.

**J4 — Login gagal:**
Password salah → pesan generik, tetap di form, bisa retry. 5x gagal berturut-turut → biarkan Supabase Auth yang rate-limit (default behavior); jangan bangun sistem lockout sendiri.

## 7. Information Architecture & UI Design

### Route map
| Route | Publik | Deskripsi |
|---|---|---|
| `/` | Ya | Home: hero + filter + grid |
| `/watch/[slug]` | Ya | Watch page |
| `/admin` | Tidak | Login / dashboard |
| `/admin/video/new`, `/admin/video/[id]/edit` | Tidak | Form tambah/edit |
| `/admin/upload` | Tidak | (Fase 2) Upload via anonmp4 |
| `/admin/categories` | Tidak | Kelola kategori |

### Design tokens
- **Font:** Space Grotesk (400/500/700) via `next/font/google`, CSS variable `--font-space-grotesk`, `display: swap`. Dipakai global — judul, body, button, input. Tidak ada font kedua.
- **Tema:** dark (default) & light, toggle di navbar, `next-themes` + CSS variables Tailwind v4 (`@theme`). Preferensi tersimpan di localStorage, `suppressHydrationWarning` di `<html>`.
- **Palet (dark):** bg `#0B0B0F`, surface `#14141A`, text `#F5F5F7`, accent satu warna berani (usulan: `#E50914`-style red atau amber — final saat implementasi, yang penting kontras AA untuk teks di atas bg). Light theme: bg `#FAFAFA`, surface putih, text `#111`, accent sama.
- Radius: 12–16px untuk kartu; shadow halus; tidak ada gradient purple/glow (anti-slop).

### Komponen utama
- `Navbar`: logo/nama situs (text, Space Grotesk bold), search bar (desktop), toggle tema, link Admin (kecil, teks saja). Mobile: search pindah ke bawah navbar.
- `VideoCard`: thumbnail 16:9 (next/image, `sizes` responsif), judul 2-line clamp, kategori kecil. Hover: angkat halus + ring accent. Focus-visible: ring jelas.
- `SearchBar`: input + tombol, `role="search"`, submit via Enter.
- `CategoryChips`: horizontal scroll di mobile.
- `AdminVideoForm`: client component, validasi client (HTML5 + regex slug) + validasi server (source of truth).

### States wajib
Loading (skeleton), empty (search/kategori kosong), error (DB down → "Gagal memuat video. Coba refresh." + tombol retry), 404 (watch slug salah), unauthorized (admin tanpa session → redirect login).

### Accessibility
Kontras AA (4.5:1 teks body), semua interaktif focusable + focus-visible ring, iframe punya `title`, alt text thumbnail (fallback: judul video), `prefers-reduced-motion` dihormati (matikan transisi hover), tap target ≥ 44px di mobile, toggle tema punya `aria-label`.

## 8. Architecture & Technology Decisions

| Layer | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Server Actions untuk CRUD admin tanpa API terpisah; RSC untuk home/watch cepat; free Vercel deploy |
| Styling | Tailwind CSS v4 + CSS variables | Theming dark/light trivial; utility cepat |
| Font | `next/font/google` Space Grotesk | Self-host otomatis, zero CLS |
| DB + Auth | Supabase free tier (Postgres + Auth) | Postgres asli, RLS, 1 admin user, gratis |
| Data access | `@supabase/supabase-js` + `@supabase/ssr` | Session cookie untuk Server Components & Actions |
| Hosting | Vercel free | Cocok Next.js; HTTPS + CDN gratis |
| Video | iframe embed vdohide / anonmp4 | Tidak perlu infra video sendiri |

**Alternatif dipertimbangkan:** Astro (bagus untuk konten, tapi admin stateful lebih awkward), Vite+React SPA (butuh backend terpisah), SvelteKit (fine, tapi ekosistem/docs Next+Vercel lebih mulus). Dipilih Next.js.

**Rendering strategy:** Home & watch = dynamic server-rendered (data berubah tiap admin edit; cache via `revalidatePath` setelah mutasi, atau dynamic penuh — skala kecil tidak masalah). Search = query param, no client fetching.

## 9. Data Model & Persistence

```sql
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_at timestamptz not null default now()
);

create table videos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 120),
  description text not null default '',
  embed_url text not null check (embed_url ~* '^https://'),
  source text not null check (source in ('vdohide','anonmp4')),
  thumbnail_url text,
  category_id uuid not null references categories(id) on delete restrict,
  views integer not null default 0 check (views >= 0),
  featured boolean not null default false,
  created_at timestamptz not null default now()
);
create index videos_category_idx on videos(category_id);
create index videos_created_idx on videos(created_at desc);
create index videos_featured_idx on videos(featured) where featured;
```

**RLS:**
```sql
alter table categories enable row level security;
alter table videos enable row level security;
create policy "public read videos" on videos for select using (true);
create policy "public read categories" on categories for select using (true);
create policy "admin write videos" on videos for all to authenticated using (true) with check (true);
create policy "admin write categories" on categories for all to authenticated using (true) with check (true);
```

**RPC (fase 2):** `increment_views(vid uuid)` — `SECURITY DEFINER`, `views = views + 1` by id, grant execute to `anon`.

**Migrations:** satu file `supabase/schema.sql` di repo; user jalankan manual di Supabase SQL Editor. Tidak pakai migration tool (skala kecil).

## 10. API & Integration Contracts

### Internal (Server Actions)
`createVideo`, `updateVideo`, `deleteVideo`, `createCategory`, `deleteCategory` — input divalidasi server-side, cek session dulu (`supabase.auth.getUser()`), throw/return error object. Revalidate path `/`, `/watch/[slug]`, `/admin` setelah mutasi.

### Eksternal: anonmp4
- `POST https://anonmp4api.xyz/upload` — `multipart/form-data`, field `file` (max klaim API 20 GB; kita batasi UI/proxy 2 GB). **Tanpa auth.** Response (dari docs publik): `{ success, video_id, title, thumbnail, watch_url, embed_url, upload_date, message }`.
- `GET https://anonmp4api.xyz/info/{video_id}` — metadata & URL streaming (opsional, tidak wajib MVP).
- Base URL alternatif tercatat di docs: `https://anonmp4api.xyz/`.
- **Peringatan:** dokumentasi bilang "no authentication required" — tapi tetap lakukan upload lewat proxy server (bukan dari browser langsung) agar (a) CORS aman, (b) bisa enforce session admin, (c) timeout & error handling rapi.
- vdohide **tidak punya** API upload publik terdokumentasi → vdohide selalu paste-link (fase 1 langsung cukup untuk vdohide).
- Semua endpoint eksternal **harus diverifikasi ulang** saat implementasi; jangan percaya payload di PRD ini sepenuhnya.

## 11. Project Structure

```
web-video/
  app/
    layout.tsx              # <html> + font + ThemeProvider + Navbar
    page.tsx                # Home (hero + chips + grid + search via searchParams)
    watch/[slug]/page.tsx   # Watch page
    not-found.tsx           # 404 publik
    admin/
      page.tsx              # Login ATAU dashboard (cek session)
      actions.ts            # Server actions CRUD
      categories/page.tsx   # Kelola kategori
      video/new/page.tsx
      video/[id]/edit/page.tsx
      upload/page.tsx       # Fase 2
    api/admin/upload-anonmp4/route.ts  # Fase 2 (proxy, cek session)
  components/
    Navbar.tsx  SearchBar.tsx  ThemeToggle.tsx
    VideoCard.tsx  VideoGrid.tsx  CategoryChips.tsx  SkeletonCard.tsx
    AdminVideoForm.tsx  DeleteButton.tsx  Toast.tsx(inline)
  lib/
    supabase/server.ts  supabase/client.ts  supabase/middleware.ts
    embed.ts              # normalisasi & whitelist embed URL (FR-006)
    slug.ts               # slugify judul
    types.ts
  supabase/schema.sql
  middleware.ts             # refresh session + guard /admin
  .env.example
```

Tidak ada folder `utils/`, `helpers/`, `services/` generik. File kecil, kolokasi logika.

## 12. Security, Privacy & Abuse Prevention

- **Auth:** Supabase Auth, 1 akun admin, password kuat (user buat sendiri). Tidak ada signup publik — user admin dibuat manual di Supabase dashboard.
- **Authorization:** RLS di Postgres (publik read, authenticated write) **+** cek session di Server Actions & middleware (`/admin/*`). Defense in depth — jangan andalkan salah satu.
- **XSS:** embed_url hanya masuk atribut `src` iframe; whitelist host (FR-006); React auto-escape semua teks; tidak ada `dangerouslySetInnerHTML`.
- **CSRF:** Server Actions Next.js punya proteksi origin bawaan; mutasi hanya via POST action.
- **Input validation:** semua input divalidasi server-side (length, regex, enum source, whitelist host). Query ILIKE di-escape.
- **Secret:** `SUPABASE_SERVICE_ROLE_KEY` **tidak dipakai** di app ini (RLS cukup). Hanya `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (aman di client, diproteksi RLS). Tidak ada secret di repo; `.env*` di `.gitignore`.
- **Iframe pihak ketiga:** atribut minimal (`allowfullscreen`, `loading=lazy`, `referrerPolicy="strict-origin-when-cross-origin"`). Jangan `sandbox="allow-scripts"` tanpa `allow-same-origin` — player HLS butuh keduanya; terima risiko player provider (lihat Risks).
- **Abuse:** views counter bisa di-spam (diterima, P2 fix). Endpoint upload fase 2 wajib session — tanpa itu siapa pun bisa pakai bandwidth server kita sebagai proxy gratis.
- **Privacy:** tidak mengumpulkan data pribadi pengunjung (tidak ada analytics wajib; Vercel Analytics opsional & privacy-friendly).

## 13. Reliability & Error Handling

- DB error saat render publik → error boundary dengan pesan ramah + retry; jangan whitescreen.
- Admin action gagal → return `{ error: string }`, tampilkan di form; jangan throw mentah ke UI.
- Upload fase 2: timeout proxy 10 menit, pesan jelas kalau file ditolak provider, draft video tidak dibuat kalau upload gagal.
- Delete gagal (FK restrict kategori) → pesan spesifik.
- Provider embed down → iframe kosong/error di dalam player; situs lain tetap jalan (graceful degradation by design).

## 14. Deployment, Operations, Release

1. Push ke GitHub (repo baru, private/public terserah user).
2. Import ke Vercel → set env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Buat project Supabase (free), jalankan `supabase/schema.sql` di SQL Editor, buat user admin di Authentication → Users.
4. Deploy. Smoke test: buka home, login admin, tambah 1 video, nonton.
5. Domain: `*.vercel.app` gratis; custom domain opsional (user beli sendiri).

**Build/verify commands** (standar Next.js, bukan hasil verifikasi — jalankan saat implementasi): `npm run dev`, `npm run build`, `npm run lint`.

## 15. Configuration & Environments

`.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```
Tidak ada env lain. Fase 2 tidak menambah env (anonmp4 no auth).

## 16. Performance & Scale

- Free tier Supabase: 500 MB DB — cukup untuk ribuan video (metadata saja).
- Free tier Vercel: 100 GB bandwidth — fine (video tidak lewat kita, hanya thumbnail kecil).
- Target (proposal): home TTFB < 800 ms, Lighthouse perf ≥ 85 (LCP didominasi 1 thumbnail hero → pakai `priority` di next/image hero saja).
- Thumbnail: pakai URL provider (anonmp4 CDN) — jangan proxy. vdohide: next/image dengan `remotePatterns` untuk host thumbnail yang dipakai.
- Skala: single-region, ratusan–ribuan pengunjung/hari aman. Tidak perlu cache layer/Redis.

## 17. Testing & Quality Strategy

- **Unit (Vitest atau node:test):** `lib/embed.ts` — tabel kasus FR-006 (embed URL, watch URL, raw ID, URL jahat `https://evil.com/x.mp4` → ditolak, `http://` → ditolak, host typo → ditolak). `lib/slug.ts` — slugify (unicode, spasi berlebih, karakter aneh, judul kosong → error).
- **Integrasi:** server action `createVideo` — slug duplikat → error ramah; tanpa session → unauthorized; input valid → row tersimpan (test DB: Supabase local atau project test terpisah).
- **E2E manual checklist** (Playwright opsional, tidak wajib untuk skala ini):
  - [ ] Home render, grid terisi dari DB
  - [ ] Search `?q=` mengembalikan hasil relevan; query aneh (`%`, `'`, emoji) tidak crash
  - [ ] Filter kategori kombinasi dengan search
  - [ ] Watch page: iframe src benar, slug salah → 404
  - [ ] Admin: login gagal/sukses, CRUD video, hapus dengan konfirmasi
  - [ ] Toggle tema persist setelah reload; tidak ada flash salah tema
  - [ ] Mobile 360px: search usable, chips scrollable, grid 1 kolom
  - [ ] Keyboard: Tab ke semua kontrol, focus ring terlihat
- **Aksesibilitas:** cek kontras kedua tema dengan DevTools/axe.

## 18. Acceptance Criteria

**P0:**
- [ ] Given video di DB, when buka `/`, then kartu tampil dengan thumbnail+judul+kategori, klik → watch page benar.
- [ ] Given search `?q=lorong`, when hasil ada, then hanya video judul/deskripsi mengandung "lorong" (case-insensitive) tampil.
- [ ] Given slug tak ada, when buka `/watch/ngawur`, then halaman 404 ramah tampil, bukan error mentah.
- [ ] Given belum login, when POST server action createVideo, then ditolak (401/redirect), DB tidak berubah.
- [ ] Given paste `https://evil.com/iframe`, when simpan video, then ditolak "URL tidak dikenali".
- [ ] Given paste `https://www.anonmp4.to/embed/NLEusIzEvLs3s3B`, when simpan, then `source=anonmp4`, embed_url dinormalisasi, thumbnail auto terisi.
- [ ] Given kategori dipakai video, when hapus kategori, then gagal dengan pesan jelas, data utuh.
- [ ] Semua halaman publik: kontras AA, keyboard-navigable, `prefers-reduced-motion` dihormati.
- [ ] `npm run build` sukses tanpa error/warning TypeScript.

**P1:**
- [ ] Upload file 100 MB via `/admin/upload` → draft video terbuat dengan embed_url & thumbnail dari response API.
- [ ] Tutup browser saat upload → tidak ada row setengah jadi di DB.
- [ ] Buka watch page → `views` bertambah 1 (cek via admin list).

## 19. Implementation Roadmap

**Fase 1 — MVP:**
1. Scaffold: `create-next-app` (TS, Tailwind, App Router, ESLint), font Space Grotesk, `next-themes`, layout + Navbar + toggle tema.
2. Supabase: `schema.sql` (tabel + RLS), `lib/supabase/*`, `middleware.ts` guard `/admin`.
3. `lib/embed.ts` + `lib/slug.ts` + unit test keduanya.
4. Home (query videos + categories, hero, chips, search, grid, skeleton, empty/error states).
5. Watch page (iframe, related, 404).
6. Admin: login, list, form new/edit (server actions + revalidate), delete + konfirmasi, kategori minimal.
7. Polish: metadata/OG per watch, not-found, responsive pass, a11y pass, build hijau.

**Fase 2 — upload & views:**
8. Route handler `/api/admin/upload-anonmp4` (proxy + session guard), page upload dengan progress, auto-draft.
9. `increment_views` RPC + panggilan dari watch page.

**Milestone check:** akhir fase 1 = situs bisa dipakai publik end-to-end dengan konten asli.

## 20. Risks, Assumptions, Open Decisions

| # | Risiko / asumsi | Mitigasi |
|---|---|---|
| R1 | vdohide/anonmp4 free tier berubah, down, atau pasang iklan/pop-up di player (vdohide free = ads) | Tidak ada mitigasi teknis penuh; situs bergantung pada kedua provider. Bisa pindah provider nanti karena `embed_url` disimpan generik. Pantau player berkala. |
| R2 | anonmp4 API tanpa auth bisa disalahgunakan / berubah / hilang | Fase 2; kalau API mati, fase 1 (paste link) tetap jalan — upload manual di anonmp4.to lalu paste. |
| R3 | Response API anonmp4 di PRD ini dari docs 2026, belum diverifikasi nyata | Re-test sebelum fase 2 dianggap selesai (lihat FR-008). |
| R4 | Thumbnail anonmp4 (`cdn.anonmp4.to/thumbs/<id>.webp`) mungkin 404 untuk video yang belum selesai transcode | Fallback: `onError` ganti placeholder lokal (`/placeholder-thumb.jpg`). |
| R5 | Query ILIKE tanpa index penuh — lambat kalau ratusan ribu video | Tidak relevan di skala kecil; tambah index trigram kalau perlu nanti. |
| R6 | Asumsi: user adalah satu-satunya admin; tidak ada kebutuhan multi-admin/role | Kalau berubah → tambah roles table, di luar scope. |
| R7 | Asumsi: user buat project Supabase & Vercel sendiri, env di-set sendiri | Dokumentasi deployment di section 14; `.env.example` disediakan. |

**Open decisions (tidak memblokir MVP, tentukan saat polish):**
- Nama situs & logo (teks saja dulu).
- Warna accent final.
- Apakah pakai Vercel Analytics (opsional).

## 21. Definition of Done

- [ ] Semua acceptance criteria P0 tercentang dengan bukti (test run / screenshot / manual check)
- [ ] `npm run build` hijau; tidak ada TypeScript error
- [ ] `supabase/schema.sql` idempotent (bisa dijalankan ulang tanpa error) atau diberi catatan
- [ ] README singkat di repo: cara setup Supabase + env + deploy Vercel (maks 1 halaman)
- [ ] `.env.example` ada; tidak ada secret ter-commit
- [ ] Deployed di Vercel dan diverifikasi end-to-end (home → watch → admin CRUD) sebelum dinyatakan selesai
- [ ] Known limitations terdokumentasi: R1 (ketergantungan provider), views tanpa dedup, fase 2 belum termasuk kalau belum dikerjakan

## 22. Coding Agent Instructions

1. Baca PRD ini seluruhnya sebelum menulis kode.
2. Repo kosong (`D:\Coding\Web Video`) — scaffold sesuai section 11; jangan tambah dependency di luar yang disebut tanpa alasan kuat.
3. Jangan buat akun Supabase/Vercel atas nama user — siapkan kode + instruksi; user yang jalankan provisioning.
4. Implementasi bertahap sesuai roadmap (section 19); laporkan progres per fase.
5. Verifikasi setiap langkah yang bisa diverifikasi (build, unit test). Untuk yang tidak bisa (mis. upload nyata ke anonmp4), katakan eksplisit apa yang belum diverifikasi.
6. Jangan klaim test/build sukses tanpa menjalankannya.
7. Minta konfirmasi sebelum operasi destruktif (hapus file, reset, force push).
8. Ikuti aturan ponytail: tidak ada fitur di luar scope P0/P1; tidak ada abstraksi spekulatif; baris paling sedikit yang menyelesaikan masalah dengan benar.

---

## Change History

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | 2026-11-07 | Draft awal dari hasil diskusi scoping (embed vdohide/anonmp4, browse+search, admin paste-link, free hosting, Space Grotesk, dark/light toggle, fase 2 upload API anonmp4) |
