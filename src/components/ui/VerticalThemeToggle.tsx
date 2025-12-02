"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function VerticalThemeToggle() {
  const { setTheme, resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Hydration-Problem vermeiden
  useEffect(() => {
    // Verwende setTimeout, um setState außerhalb des synchronen Effekt-Bodies aufzurufen
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  // Bestimme das aktuelle Theme (berücksichtigt System-Theme)
  const currentTheme = resolvedTheme ?? systemTheme ?? "light";
  const isDark = currentTheme === "dark";

  // Handler zum Umschalten zwischen hell und dunkel
  const handleToggle = () => {
    if (isDark) {
      void setTheme("light");
    } else {
      void setTheme("dark");
    }
  };

  // Während SSR oder vor dem Mount: Platzhalter anzeigen
  if (!mounted) {
    return (
      <button
        className="flex items-center justify-center text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-300"
        aria-label="Theme umschalten"
      >
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className="flex items-center justify-center text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-300"
      aria-label={isDark ? "Hell" : "Dunkel"}
    >
      {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  );
}
