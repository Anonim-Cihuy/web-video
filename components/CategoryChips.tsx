import Link from "next/link";
import type { Category } from "@/lib/types";

export default function CategoryChips({
  categories,
  active,
  q,
}: {
  categories: Category[];
  active?: string;
  q?: string;
}) {
  function hrefFor(slug?: string) {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  const base =
    "inline-flex h-10 shrink-0 cursor-pointer items-center rounded-md border px-4 text-sm font-medium transition-colors";

  return (
    <div
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6"
      role="list"
      aria-label="Filter kategori"
    >
      <Link
        href={hrefFor(undefined)}
        role="listitem"
        aria-current={!active ? "true" : undefined}
        className={`${base} ${
          !active
            ? "border-accent bg-accent text-accent-contrast"
            : "border-border bg-surface text-muted hover:text-foreground"
        }`}
      >
        Semua
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={hrefFor(category.slug)}
          role="listitem"
          aria-current={active === category.slug ? "true" : undefined}
          className={`${base} ${
            active === category.slug
              ? "border-accent bg-accent text-accent-contrast"
              : "border-border bg-surface text-muted hover:text-foreground"
          }`}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
