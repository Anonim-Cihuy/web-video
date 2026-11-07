-- Web Video — schema Supabase. Jalankan di SQL Editor. Aman dijalankan berulang.

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_at timestamptz not null default now()
);

create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  embed_url text not null check (embed_url ~* '^https://'),
  source text not null check (source in ('vdohide','anonmp4','catbox')),
  thumbnail_url text,
  category_id uuid not null references categories(id) on delete restrict,
  views integer not null default 0 check (views >= 0),
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists videos_category_idx on videos(category_id);
create index if not exists videos_created_idx on videos(created_at desc);
create index if not exists videos_featured_idx on videos(featured) where featured;

alter table categories enable row level security;
alter table videos enable row level security;

drop policy if exists "public read videos" on videos;
drop policy if exists "public read categories" on categories;
drop policy if exists "admin write videos" on videos;
drop policy if exists "admin write categories" on categories;

create policy "public read videos" on videos for select using (true);
create policy "public read categories" on categories for select using (true);
create policy "admin write videos" on videos for all to authenticated using (true) with check (true);
create policy "admin write categories" on categories for all to authenticated using (true) with check (true);

-- Fase 2: counter views, dipanggil dari halaman watch (fire-and-forget)
create or replace function increment_views(vid uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update videos set views = views + 1 where id = vid;
$$;

revoke all on function increment_views(uuid) from public;
grant execute on function increment_views(uuid) to anon, authenticated;

-- Contoh kategori awal (opsional)
insert into categories (name, slug)
values ('Drama', 'drama'), ('Komedi', 'komedi'), ('Dokumenter', 'dokumenter'), ('Aksi', 'aksi')
on conflict (slug) do nothing;
