# Web Video

Situs nonton embed video dari vdohide dan anonmp4. Next.js 16 (App Router) + Tailwind v4 + Supabase (Postgres + Auth). Biaya hosting Rp 0 (Vercel + Supabase free tier).

## Setup

1. **Install**
   ```
   npm install
   ```

2. **Supabase**
   - Buat project di [supabase.com](https://supabase.com) (free tier).
   - Buka SQL Editor, paste isi `supabase/schema.sql`, jalankan.
   - Buka Authentication > Users > Add user, buat satu akun admin (email + password). Tidak ada signup publik.

3. **Environment**
   ```
   copy .env.example .env.local
   ```
   Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase > Project Settings > API).

4. **Jalan**
   ```
   npm run dev     # development
   npm run build   # production build
   npm run start   # production server
   ```

5. **Deploy Vercel**
   - Import repo ke Vercel, set dua env var yang sama, deploy.
   - Tidak ada env lain. `SUPABASE_SERVICE_ROLE_KEY` sengaja tidak dipakai; keamanan sepenuhnya lewat RLS + session admin.

## Cara pakai

- **Publik**: buka `/`, cari video, filter kategori, klik kartu untuk nonton di `/watch/<slug>`.
- **Admin**: `/admin`, login dengan akun yang dibuat di langkah 2. Tempel embed URL dari vdohide/anonmp4 (atau ID anonmp4, thumbnail otomatis), isi judul dan kategori, simpan.
- **Upload langsung**: `/admin/upload` mengirim file lewat route handler `/api/admin/upload-anonmp4` (proxy streaming, butuh session admin, file tidak disimpan di server). Max 20 GB self-host; di Vercel ada batas body ±4.5 MB, jadi file besar pakai paste-link / upload manual di anonmp4.to.

## Struktur

Lihat `PRD.md` untuk spesifikasi lengkap (FR, schema, acceptance criteria).

## Catatan

- Video diputar iframe dari penyedia pihak ketiga. Kalau vdohide/anonmp4 bermasalah, player bermasalah, situs lain tetap jalan.
- Upload fase 2 belum diverifikasi end-to-end dengan file nyata (lihat PRD R3).
