"use client";

import React, { useState, useRef, useEffect } from "react";
import { Menu, X, Plus } from "lucide-react";
import Link from "next/link";
import { VerticalThemeToggle } from "@/components/ui/VerticalThemeToggle";
import { HeaderSearch } from "@/components/ui/header-search";
import {
  navigationData,
  type NavItem,
  type NavSection,
} from "@/constants/navigationData";

interface DesktopHeaderProps {
  onFilterToggle?: () => void;
  isFilterOpen?: boolean;
  onFilterClose?: () => void;
  resultCount?: number;
  hasActiveFilters?: boolean;
}

// Provisorische Auth-Logik (später durch Typo3 ersetzt)
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState<{ user?: { email?: string } } | null>(
    null
  );

  useEffect(() => {
    // Prüfe auf auth_token Cookie
    if (typeof window !== "undefined") {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="));
      // Asynchron setzen, um ESLint-Warnung zu vermeiden
      setTimeout(() => {
        setIsAuthenticated(!!token);
        if (token) {
          // Provisorisch: Setze Session-Daten
          setSession({ user: { email: "user@polizei-bw.de" } });
        }
      }, 0);
    }
  }, []);

  return { isAuthenticated, session };
};

export default function DesktopHeader({ onFilterClose }: DesktopHeaderProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { isAuthenticated, session } = useAuth();

  // Escape key handler
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        void setActiveDropdown(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        void setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  // Mouse leave handler
  const handleDropdownMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      void setActiveDropdown(null);
    }, 300);
  };

  const handleDropdownMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      void clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
  };

  const handleDropdownClick = (section: string) => {
    if (activeDropdown !== section) {
      onFilterClose?.();
    }
    void setActiveDropdown(activeDropdown === section ? null : section);
  };

  // Navigation Sections
  const navSections: NavSection[] = ["Service"];

  // Filtere Navigation-Items basierend auf Authentifizierung
  const getFilteredNavigationItems = (section: NavSection) => {
    const items = navigationData[section];

    if (section === "Service") {
      // Für Service-Sektion: Zeige nur öffentliche Items wenn nicht angemeldet
      if (!isAuthenticated) {
        return items.filter(
          (item) => !item.requiresAuth && !item.isAuthSection
        );
      }
      // Wenn angemeldet: Zeige alle Items außer Anmelden/Registrieren
      return items.filter((item) => !item.authOnly && !item.isAuthSection);
    }

    return items;
  };

  // Separat: Authentifizierungs-Items für Service
  const getAuthItems = (): NavItem[] => {
    const section: NavSection = "Service";
    const serviceItems = navigationData[section];
    return serviceItems.filter((item: NavItem) => item.isAuthSection === true);
  };

  // Provisorische Logout-Funktion
  const handleLogout = async () => {
    try {
      // Cookie löschen
      if (typeof window !== "undefined") {
        document.cookie =
          "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
      // Weiterleitung zur Login-Seite
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout-Fehler:", err);
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Search */}
      <div className="flex items-center justify-center">
        <HeaderSearch />
      </div>

      {/* Separator */}
      <div className="h-8 w-px bg-border/60" />

      {/* Theme Toggle */}
      <div className="flex items-center justify-center">
        <VerticalThemeToggle />
      </div>

      {/* Separator */}
      <div className="h-8 w-px bg-border/60" />

      {/* Plus Icon für neue Fahndung - nur wenn angemeldet */}
      {isAuthenticated && (
        <>
          <Link
            href="/fahndungen/neu"
            onClick={() => onFilterClose?.()}
            className="flex items-center justify-center text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-300"
            aria-label="Neue Fahndung einstellen"
          >
            <Plus className="h-5 w-5" />
          </Link>
          {/* Separator */}
          <div className="h-8 w-px bg-border/60" />
        </>
      )}

      {/* Hamburger Menu */}
      <div
        ref={dropdownRef}
        className="relative flex items-center justify-center"
      >
        <button
          onClick={() => handleDropdownClick("hamburger")}
          className={`
            flex items-center justify-center text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-300
            ${activeDropdown === "hamburger" ? "text-gray-900 dark:text-gray-300" : ""}
          `}
          aria-expanded={activeDropdown === "hamburger"}
          aria-haspopup="true"
          aria-label="Menü öffnen"
          id="dropdown-trigger-hamburger"
        >
          {activeDropdown === "hamburger" ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* Dropdown Menu */}
        {activeDropdown === "hamburger" && (
          <div
            className={`
              absolute right-0 top-full mt-2 w-80 z-[70]
              rounded-xl border border-border/50
              bg-popover/95 shadow-xl backdrop-blur-2xl 
              dark:bg-popover/90
            `}
            role="menu"
            aria-labelledby="dropdown-trigger-hamburger"
            onMouseLeave={handleDropdownMouseLeave}
            onMouseEnter={handleDropdownMouseEnter}
          >
            <div className="p-2">
              {/* Leichte Sprache und Gebärdensprache */}
              <div className="mb-2 space-y-1">
                <Link
                  href="/leichte-sprache"
                  onClick={() => {
                    onFilterClose?.();
                    setActiveDropdown(null);
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-accent focus:bg-accent focus:outline-none"
                  role="menuitem"
                >
                  <span className="text-sm font-medium text-foreground">
                    Leichte Sprache
                  </span>
                </Link>
                <Link
                  href="/gebaerdensprache"
                  onClick={() => {
                    onFilterClose?.();
                    setActiveDropdown(null);
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-accent focus:bg-accent focus:outline-none"
                  role="menuitem"
                >
                  <span className="text-sm font-medium text-foreground">
                    Gebärdensprache
                  </span>
                </Link>
              </div>

              {/* Trennlinie */}
              <div className="my-2 border-t border-border/50" />

              {/* Service-Items */}
              {navSections.map((section) => {
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
                  <div key={section}>
                    {/* Hauptnavigation */}
                    {filteredItems.map((item: NavItem) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.href} role="menuitem">
                          <Link
                            href={item.href}
                            target={item.external ? "_blank" : undefined}
                            rel={
                              item.external ? "noopener noreferrer" : undefined
                            }
                            onClick={(e) => {
                              onFilterClose?.();
                              setActiveDropdown(null);
                              // Stelle sicher, dass die Navigation korrekt funktioniert
                              if (item.external) {
                                e.preventDefault();
                                window.open(
                                  item.href,
                                  "_blank",
                                  "noopener,noreferrer"
                                );
                              }
                            }}
                            className={`
                              group flex items-start gap-3 rounded-lg px-3 py-2.5
                              transition-colors duration-200
                              hover:bg-accent focus:bg-accent focus:outline-none
                              ${item.urgent ? "border border-destructive/20" : ""}
                            `}
                          >
                            <Icon className="h-5 w-5 flex-shrink-0 text-foreground/60 group-hover:text-foreground" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground">
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <div className="text-xs font-medium text-foreground/80">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </Link>
                        </div>
                      );
                    })}

                    {/* Authentifizierungs-Bereich - nur für Service */}
                    {section === "Service" && (
                      <>
                        {/* Trennlinie */}
                        <div className="my-2 border-t border-border/50" />

                        {/* Auth-Header */}
                        <div className="mb-2 px-3 py-1">
                          <div className="text-xs font-medium uppercase tracking-wide text-foreground/70">
                            {isAuthenticated ? "Benutzer" : "Anmeldung"}
                          </div>
                        </div>

                        {/* Auth-Items */}
                        {isAuthenticated ? (
                          // Angemeldeter Benutzer - zeige Benutzer-Info und Logout
                          <div className="space-y-2">
                            <div className="rounded-lg bg-accent/50 px-3 py-2">
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-foreground">
                                    {session?.user?.email?.split("@")[0] ??
                                      "Benutzer"}
                                  </div>
                                  <div className="text-xs font-medium text-foreground/80">
                                    Angemeldet
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Logout Button */}
                            <button
                              onClick={handleLogout}
                              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-200 hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:outline-none dark:hover:bg-red-950/50"
                              title="Abmelden"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground group-hover:text-red-600">
                                    Abmelden
                                  </span>
                                </div>
                                <div className="text-xs font-medium text-foreground/80 group-hover:text-red-600/80">
                                  Aus dem System abmelden
                                </div>
                              </div>
                            </button>
                          </div>
                        ) : (
                          // Nicht angemeldet - zeige Anmelden/Registrieren
                          getAuthItems().map((item: NavItem) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={(e) => {
                                  onFilterClose?.();
                                  setActiveDropdown(null);
                                  // Stelle sicher, dass die Navigation korrekt funktioniert
                                  if (item.external) {
                                    e.preventDefault();
                                    window.open(
                                      item.href,
                                      "_blank",
                                      "noopener,noreferrer"
                                    );
                                  }
                                }}
                                className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-accent focus:bg-accent focus:outline-none"
                              >
                                <Icon className="h-5 w-5 flex-shrink-0 text-foreground/60 group-hover:text-foreground" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">
                                      {item.label}
                                    </span>
                                  </div>
                                  {item.description && (
                                    <div className="text-xs font-medium text-foreground/80">
                                      {item.description}
                                    </div>
                                  )}
                                </div>
                              </Link>
                            );
                          })
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
