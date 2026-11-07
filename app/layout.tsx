import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Web Video: Nonton Embed Pilihan",
    template: "%s | Web Video",
  },
  description:
    "Kurasi video embed dari vdohide dan anonmp4. Cari, pilih kategori, langsung tonton. Tanpa daftar, tanpa ribet.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#100f13" },
    { media: "(prefers-color-scheme: light)", color: "#f6f4ee" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-muted sm:px-6">
              <p>Web Video. Kurasi embed dari vdohide dan anonmp4.</p>
              <p>Video diputar oleh penyedia pihak ketiga.</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
