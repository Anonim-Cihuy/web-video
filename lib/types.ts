export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Video = {
  id: string;
  slug: string;
  title: string;
  description: string;
  embed_url: string;
  source: "vdohide" | "anonmp4";
  thumbnail_url: string | null;
  category_id: string;
  views: number;
  featured: boolean;
  created_at: string;
  categories: { name: string; slug: string } | null;
};

export type AdminActionState = { error?: string; ok?: boolean };
