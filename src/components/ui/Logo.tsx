"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface LogoProps {
  className?: string;
  showLink?: boolean;
}

export function Logo({ className = "", showLink = true }: LogoProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Prüfe ob das HTML-Element die 'dark' Klasse hat
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    // Initial prüfen
    checkDarkMode();

    // Verwende setTimeout, um setState außerhalb des synchronen Effekt-Bodies aufzurufen
    setTimeout(() => {
      setMounted(true);
    }, 0);

    // Observer für Änderungen am HTML-Element
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Während SSR: Light-Logo als Fallback
  const logoPath =
    mounted && isDarkMode
      ? "/images/logo polizei/logo--dark.svg"
      : "/images/logo polizei/logo--light.svg";

  const logoContent = (
    <div className={`flex items-center ${className}`}>
      <div className="relative h-8 w-auto flex-shrink-0 sm:h-9 md:h-10">
        <img
          src={logoPath}
          alt="Polizei Baden-Württemberg Logo"
          className="h-full w-auto object-contain"
        />
      </div>
    </div>
  );

  if (showLink) {
    return (
      <Link href="/" className="transition-opacity hover:opacity-80">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
