import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="text-sm font-bold text-accent">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Halaman tidak ditemukan</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Video atau halaman yang kamu cari tidak ada, mungkin sudah dihapus admin.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-lg bg-accent px-6 text-sm font-bold text-accent-contrast"
      >
        Kembali ke beranda
      </Link>
    </div>
  );
}
