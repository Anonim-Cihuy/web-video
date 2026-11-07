const MAX_LEN = 60;

export function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_LEN)
    .replace(/-$/, "");
  if (slug.length < 2) throw new Error("Judul terlalu pendek untuk dijadikan slug.");
  return slug;
}
