import Link from "next/link";
import { Suspense } from "react";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-foreground"
          aria-label="Web Video, beranda"
        >
          <span aria-hidden="true" className="inline-block h-3.5 w-3.5 rounded-[4px] bg-accent" />
          Web Video
        </Link>
        <div className="order-3 w-full sm:order-2 sm:w-auto sm:flex-1 sm:min-w-48 lg:max-w-md lg:mx-auto">
          <Suspense fallback={<div className="h-11 w-full rounded-lg border border-border bg-surface" />}>
            <SearchBar />
          </Suspense>
        </div>
        <nav className="order-2 ml-auto flex items-center gap-2 sm:order-3 sm:ml-0" aria-label="Navigasi utama">
          <Link
            href="/admin"
            className="inline-flex h-11 items-center rounded-lg px-3 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Admin
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
