"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function PolizeiHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();

  // Scroll-Detection für Glassmorphismus
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (pathname !== "/fahndungen") {
      router.push(`/fahndungen?q=${encodeURIComponent(searchTerm)}`);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set("q", searchTerm);
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    if (pathname !== "/fahndungen") {
      router.push(`/fahndungen?${key}=${value}`);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (value === "alle") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg"
          : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image
                src="/images/logo polizei/logo--light.svg"
                alt="Polizei Baden-Württemberg"
                fill
                className="object-contain dark:hidden"
              />
              <Image
                src="/images/logo polizei/logo--dark.svg"
                alt="Polizei Baden-Württemberg"
                fill
                className="object-contain hidden dark:block"
              />
            </div>
            <div className="hidden md:block">
              <div className="font-bold text-lg text-gray-900 dark:text-white">
                POLIZEI
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                BADEN-WÜRTTEMBERG
              </div>
            </div>
          </Link>

          {/* Filter-System (nur auf Fahndungen-Seite sichtbar) */}
          {pathname === "/fahndungen" && (
            <div className="hidden lg:flex items-center gap-4 flex-1 max-w-3xl mx-8">
              {/* Suchfeld */}
              <form onSubmit={handleSearch} className="relative flex-1">
                <input
                  type="search"
                  placeholder="Fahndungssuche..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </form>

              {/* Fahndungsart Dropdown */}
              <select
                value={searchParams.get("fahndungsart") || "alle"}
                onChange={(e) =>
                  handleFilterChange("fahndungsart", e.target.value)
                }
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
              >
                <option value="alle">Fahndungsart</option>
                <option value="vermisst">Vermisste Personen</option>
                <option value="straftaeter">Gesuchte Straftäter</option>
                <option value="zeugen">Zeugenaufruf</option>
              </select>

              {/* Dienststellen Dropdown */}
              <select
                value={searchParams.get("dienststelle") || "alle"}
                onChange={(e) =>
                  handleFilterChange("dienststelle", e.target.value)
                }
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
              >
                <option value="alle">Dienststellen</option>
                <option value="stuttgart">Stuttgart</option>
                <option value="karlsruhe">Karlsruhe</option>
                <option value="freiburg">Freiburg</option>
                <option value="mannheim">Mannheim</option>
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Theme wechseln"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Menü öffnen"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
