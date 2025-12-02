"use client";

import Link from "next/link";
import { useCallback, useRef, memo } from "react";
import { useRouter } from "next/navigation";

type CardLinkProps = {
  slug: string;
  children: React.ReactNode;
};

// 🚀 OPTIMIERT: Memoized Link-Komponente für bessere Performance
export const FahndungCardLink = memo(function FahndungCardLink({
  slug,
  children,
}: CardLinkProps) {
  const router = useRouter();
  const done = useRef(false);

  const prefetchAll = useCallback(async () => {
    if (done.current) return;
    // Check if saveData is enabled to avoid prefetching on slow connections
    const saveData =
      typeof navigator !== "undefined" &&
      "connection" in navigator &&
      navigator.connection &&
      typeof navigator.connection === "object" &&
      "saveData" in navigator.connection &&
      Boolean((navigator.connection as { saveData?: boolean }).saveData);
    if (saveData) return;

    try {
      const url = `/fahndungen/${slug}`;
      router.prefetch(url);
    } finally {
      done.current = true;
    }
  }, [slug, router]);

  return (
    <Link
      href={`/fahndungen/${slug}`}
      prefetch
      onMouseEnter={prefetchAll}
      onFocus={prefetchAll}
      onTouchStart={prefetchAll}
      aria-label="Zur Detailseite"
      className="block"
    >
      {children}
    </Link>
  );
});
