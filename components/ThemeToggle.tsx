"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={mounted ? (isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap") : "Ganti tema"}
      className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-colors hover:bg-surface-2"
    >
      {mounted && !isDark ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 13.2A8.5 8.5 0 0 1 10.8 3a8.5 8.5 0 1 0 10.2 10.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
