"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type TouchEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Building,
  LogIn,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HeaderSearch } from "@/components/ui/header-search";
import {
  navigationData,
  type NavItem,
  type NavSection,
} from "@/constants/navigationData";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@/lib/types";

// Types
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  session?: { user: User } | null;
  onLogout?: () => void;
  onFilterClose?: () => void;
}

// Search functionality with fuzzy matching
const useSearch = (items: NavItem[], query: string): NavItem[] => {
  return useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();

    return items
      .map((item) => {
        let score = 0;
        const titleMatch = item.label.toLowerCase().includes(searchTerm);
        const descMatch = item.description?.toLowerCase().includes(searchTerm);

        if (titleMatch) score += 10;
        if (descMatch) score += 5;
        if (item.urgent) score += 2;

        return { item, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item)
      .slice(0, 8); // Limit results
  }, [items, query]);
};

// Custom hook for touch gestures
const useSwipeToClose = (onClose: () => void) => {
  const [startX, setStartX] = useState<number | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    void setStartX(e.touches[0]?.clientX ?? null);
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (startX === null) return;

      const endX = e.changedTouches[0]?.clientX ?? 0;
      const diff = endX - startX;

      // Swipe right to close (threshold: 100px)
      if (diff > 100) {
        void onClose();
      }

      void setStartX(null);
    },
    [startX, onClose]
  );

  return { handleTouchStart, handleTouchEnd };
};

export function ModernMobileMenu({
  isOpen,
  onClose,
  session,
  onLogout,
  onFilterClose,
}: MobileMenuProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Navigation Sections - identisch mit Desktop-Header
  const navSections = useMemo<NavSection[]>(() => ["Service"], []);

  // Flatten all menu items for search
  const allMenuItems = useMemo(
    () =>
      navSections.flatMap((section) => {
        const items = navigationData[section];

        // Filtere Items basierend auf Authentifizierung (identisch mit Desktop-Header)
        if (section === "Service") {
          if (!isAuthenticated) {
            return items.filter(
              (item) => !item.requiresAuth && !item.isAuthSection
            );
          }
          return items.filter((item) => !item.authOnly && !item.isAuthSection);
        }

        return items;
      }),
    [isAuthenticated, navSections]
  );

  const searchResults = useSearch(allMenuItems, searchQuery);
  const { handleTouchStart, handleTouchEnd } = useSwipeToClose(onClose);

  // Focus management
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Delay focus to ensure animation completes
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      if (!isOpen) return;

      const items = searchQuery ? searchResults : allMenuItems;
      const maxIndex = items.length - 1;

      switch (e.key) {
        case "Escape":
          void onClose();
          return;
        case "ArrowDown":
          e.preventDefault();
          void setFocusedIndex((prev) => Math.min(prev + 1, maxIndex));
          return;
        case "ArrowUp":
          e.preventDefault();
          void setFocusedIndex((prev) => Math.max(prev - 1, -1));
          return;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex <= maxIndex) {
            const item = items[focusedIndex];
            if (item) {
              onFilterClose?.();
              router.prefetch(item.href);
              void router.push(item.href);
              onClose();
            }
          }
          return;
        default:
          return;
      }
    },
    [
      isOpen,
      searchQuery,
      searchResults,
      allMenuItems,
      focusedIndex,
      onClose,
      router,
      onFilterClose,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "15px"; // Compensate for scrollbar
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  const handleItemClick = useCallback(
    async (href: string, external?: boolean, e?: React.MouseEvent) => {
      // 🚀 Verhindere Standard-Navigation nur wenn Event vorhanden
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Filterleiste schließen, wenn vorhanden
      onFilterClose?.();

      if (external) {
        window.open(href, "_blank", "noopener,noreferrer");
        onClose();
      } else {
        // Menü zuerst schließen für bessere UX
        onClose();
        // Prefetch für schnellere Navigation
        router.prefetch(href);
        // Navigation mit kleinem Delay, um sicherzustellen, dass das Menü geschlossen ist
        setTimeout(() => {
          void router.push(href);
        }, 100);
      }
    },
    [router, onClose, onFilterClose]
  );

  // Reset states when menu closes
  useEffect(() => {
    if (!isOpen) {
      // Use requestAnimationFrame to avoid setState in effect
      requestAnimationFrame(() => {
        setSearchQuery("");
        setActiveCategory(null);
        setFocusedIndex(-1);
      });
    }
  }, [isOpen]);

  // Filtere Navigation-Items basierend auf Authentifizierung (identisch mit Desktop-Header)
  const getFilteredNavigationItems = (section: NavSection) => {
    const items = navigationData[section];

    if (section === "Service") {
      if (!isAuthenticated) {
        return items.filter(
          (item) => !item.requiresAuth && !item.isAuthSection
        );
      }
      return items.filter((item) => !item.authOnly && !item.isAuthSection);
    }

    return items;
  };

  // Separat: Authentifizierungs-Items für Service (identisch mit Desktop-Header)
  const getAuthItems = (): NavItem[] => {
    const section: NavSection = "Service";
    const items = navigationData[section];
    return items.filter((item) => item.isAuthSection === true);
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop - nur unter dem Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed right-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-full bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Mobile Menu Panel */}
          <motion.div
            ref={menuRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
              duration: 0.3,
            }}
            className="fixed right-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-full max-w-sm bg-white shadow-2xl dark:bg-gray-900"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
          >
            {/* Erweiterte Suchfunktion */}
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-900 max-[639px]:block min-[640px]:hidden">
              <div className="relative w-full">
                <HeaderSearch fullWidth={true} />
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="h-full overflow-y-auto overscroll-contain bg-white dark:bg-gray-900">
              <div className="px-6 py-4">
                {/* Search Results */}
                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                  >
                    <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Suchergebnisse ({searchResults.length})
                    </h3>
                    <div className="space-y-2">
                      {searchResults.length > 0 ? (
                        searchResults.map((item, index) => (
                          <motion.button
                            key={item.href}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={(e: React.MouseEvent) =>
                              handleItemClick(item.href, item.external, e)
                            }
                            className={`w-full rounded-lg p-3 text-left transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${
                              focusedIndex === index
                                ? "bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/20"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {item.label}
                                </div>
                                {item.description && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                          </motion.button>
                        ))
                      ) : (
                        <div className="py-8 text-center">
                          <div className="text-gray-500 dark:text-gray-400">
                            Keine Ergebnisse gefunden
                          </div>
                          <div className="mt-1 text-sm text-gray-400">
                            Versuchen Sie andere Suchbegriffe
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Default Content */}
                {!searchQuery && (
                  <>
                    {/* Leichte Sprache und Gebärdensprache */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6"
                    >
                      <div className="space-y-2">
                        <motion.button
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={(e: React.MouseEvent) =>
                            handleItemClick("/leichte-sprache", false, e)
                          }
                          className="w-full rounded-lg bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                        >
                          <div className="font-medium text-gray-900 dark:text-white">
                            Leichte Sprache
                          </div>
                        </motion.button>
                        <motion.button
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 }}
                          onClick={(e: React.MouseEvent) =>
                            handleItemClick("/gebaerdensprache", false, e)
                          }
                          className="w-full rounded-lg bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                        >
                          <div className="font-medium text-gray-900 dark:text-white">
                            Gebärdensprache
                          </div>
                        </motion.button>
                      </div>
                    </motion.div>

                    {/* Menu Categories - identisch mit Desktop-Header */}
                    {navSections.map((section, categoryIndex) => {
                      const filteredItems = getFilteredNavigationItems(section);

                      // Überspringe Service-Sektion wenn keine Items verfügbar (außer Auth-Items)
                      if (
                        section === "Service" &&
                        filteredItems.length === 0 &&
                        getAuthItems().length === 0
                      ) {
                        return null;
                      }

                      return (
                        <motion.div
                          key={section}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: categoryIndex * 0.1 }}
                          className="mb-6"
                        >
                          <button
                            onClick={() =>
                              setActiveCategory(
                                activeCategory === section ? null : section
                              )
                            }
                            className="mb-3 flex w-full items-center gap-2 text-left"
                          >
                            <div className="rounded-lg p-2 text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900">
                              <Building className="h-4 w-4" />
                            </div>
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                              {section}
                            </h3>
                            <ChevronRight
                              className={`ml-auto h-4 w-4 text-gray-400 transition-transform ${
                                activeCategory === section ? "rotate-90" : ""
                              }`}
                            />
                          </button>

                          <AnimatePresence>
                            {activeCategory === section && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="space-y-2">
                                  {/* Hauptnavigation */}
                                  {filteredItems.map((item, itemIndex) => (
                                    <motion.button
                                      key={item.href}
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: itemIndex * 0.05 }}
                                      onClick={(e: React.MouseEvent) =>
                                        handleItemClick(
                                          item.href,
                                          item.external,
                                          e
                                        )
                                      }
                                      className={`w-full rounded-lg p-3 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                        item.urgent
                                          ? "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800"
                                          : "bg-gray-50 dark:bg-gray-800"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <item.icon
                                          className={`h-5 w-5 flex-shrink-0 ${
                                            item.urgent
                                              ? "text-red-600 dark:text-red-400"
                                              : "text-gray-600 dark:text-gray-400"
                                          }`}
                                        />
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                              {item.label}
                                            </span>
                                            {item.badge && (
                                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                {item.badge}
                                              </span>
                                            )}
                                          </div>
                                          {item.description && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                              {item.description}
                                            </div>
                                          )}
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                      </div>
                                    </motion.button>
                                  ))}

                                  {/* Authentifizierungs-Bereich - nur für Service (identisch mit Desktop-Header) */}
                                  {section === "Service" && (
                                    <>
                                      {/* Trennlinie */}
                                      <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

                                      {/* Auth-Header */}
                                      <div className="mb-2 px-3 py-1">
                                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                          {isAuthenticated
                                            ? "Benutzer"
                                            : "Anmeldung"}
                                        </div>
                                      </div>

                                      {/* Auth-Items */}
                                      {isAuthenticated ? (
                                        // Angemeldeter Benutzer - zeige Benutzer-Info und Logout
                                        <div className="space-y-2">
                                          <div className="rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-900/20">
                                            <div className="flex items-center gap-2">
                                              <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                              <div className="flex-1">
                                                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                                  {session?.user?.name ||
                                                    session?.user?.username ||
                                                    "Benutzer"}
                                                </div>
                                                <div className="text-xs text-blue-700 dark:text-blue-300">
                                                  Angemeldet
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Logout Button */}
                                          <button
                                            onClick={() => {
                                              onLogout?.();
                                              void onClose();
                                            }}
                                            className="group flex w-full items-center gap-3 rounded-lg bg-red-50 px-3 py-2 text-left transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                                            title="Abmelden"
                                          >
                                            <LogOut className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                                            <div className="flex-1">
                                              <div className="text-sm font-medium text-red-900 dark:text-red-100">
                                                Abmelden
                                              </div>
                                              <div className="text-xs text-red-700 dark:text-red-300">
                                                Aus dem System abmelden
                                              </div>
                                            </div>
                                          </button>
                                        </div>
                                      ) : (
                                        // Nicht angemeldet - zeige Anmelden/Registrieren
                                        getAuthItems().map(
                                          (item, itemIndex) => (
                                            <motion.button
                                              key={item.href}
                                              initial={{ opacity: 0, x: 20 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{
                                                delay: itemIndex * 0.05,
                                              }}
                                              onClick={(e: React.MouseEvent) =>
                                                handleItemClick(
                                                  item.href,
                                                  item.external,
                                                  e
                                                )
                                              }
                                              className="w-full rounded-lg bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                                            >
                                              <div className="flex items-center gap-3">
                                                <item.icon className="h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                                                <div className="min-w-0 flex-1">
                                                  <div className="font-medium text-gray-900 dark:text-white">
                                                    {item.label}
                                                  </div>
                                                  {item.description && (
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                      {item.description}
                                                    </div>
                                                  )}
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                              </div>
                                            </motion.button>
                                          )
                                        )
                                      )}
                                    </>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
                {session ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        router.prefetch("/dashboard");
                        void router.push("/dashboard");
                        onClose();
                      }}
                      className="w-full text-left text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                    >
                      Angemeldet als{" "}
                      {session.user?.name ||
                        session.user?.username ||
                        "Benutzer"}
                    </button>
                    <button
                      onClick={() => {
                        router.prefetch("/dashboard");
                        void router.push("/dashboard");
                        onClose();
                      }}
                      className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        onLogout?.();
                        onClose();
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-3 font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Abmelden
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        router.prefetch("/login");
                        void router.push("/login");
                        onClose();
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      <LogIn className="h-4 w-4" />
                      Anmelden
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
