"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, Menu, X } from "lucide-react";
import { HeaderSearch } from "@/components/ui/header-search";
import { VerticalThemeToggle } from "@/components/ui/VerticalThemeToggle";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getBrowserClient } from "@/lib/supabase/supabase-browser";
import {
  navigationData,
  type NavItem,
  type NavSection,
} from "@/constants/navigationData";
import { useFilter } from "@/contexts/FilterContext";

interface DesktopHeaderProps {
  onFilterToggle?: () => void;
  isFilterOpen?: boolean;
  onFilterClose?: () => void;
  resultCount?: number;
  hasActiveFilters?: boolean;
}

/**
 * DesktopHeader Component
 * Desktop-spezifische Navigation mit Dropdown-Menüs
 */
export default function DesktopHeader({ onFilterClose }: DesktopHeaderProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { session, isAuthenticated } = useAuth();
  useFilter(); // Filter-Context wird verwendet, aber nicht direkt benötigt
  const [, setPPSegments] = useState<string[]>([]);
  const [, setSelectedDistricts] = useState<string[]>([]);
  const [, setSelectedStations] = useState<string[]>([]);
  const [, setSelectedSubStations] = useState<string[]>([]);

  // Lade Filter aus localStorage (PP-Segmente, Districts, Stations, Sub-Stations)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadFilters = () => {
      try {
        // PP-Segmente
        const savedSegments = localStorage.getItem(
          "fahndung-selected-segments"
        );
        if (savedSegments) {
          const segments = JSON.parse(savedSegments) as string[];
          setPPSegments(segments);
        } else {
          setPPSegments([]);
        }

        // Districts
        const savedDistricts = localStorage.getItem(
          "fahndung-selected-districts"
        );
        if (savedDistricts) {
          const districts = JSON.parse(savedDistricts) as string[];
          setSelectedDistricts(districts);
        } else {
          setSelectedDistricts([]);
        }

        // Stations
        const savedStations = localStorage.getItem(
          "fahndung-selected-stations"
        );
        if (savedStations) {
          const stations = JSON.parse(savedStations) as string[];
          setSelectedStations(stations);
        } else {
          setSelectedStations([]);
        }

        // Sub-Stations
        const savedSubStations = localStorage.getItem(
          "fahndung-selected-sub-stations"
        );
        if (savedSubStations) {
          const subStations = JSON.parse(savedSubStations) as string[];
          setSelectedSubStations(subStations);
        } else {
          setSelectedSubStations([]);
        }
      } catch (e) {
        console.error("Fehler beim Laden der Filter:", e);
        setPPSegments([]);
        setSelectedDistricts([]);
        setSelectedStations([]);
        setSelectedSubStations([]);
      }
    };

    loadFilters();

    // Höre auf Änderungen
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith("fahndung-selected-")) {
        loadFilters();
      }
    };

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string; value: string }>;
      if (customEvent.detail?.key?.startsWith("fahndung-selected-")) {
        loadFilters();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("fahndung-filter-change", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("fahndung-filter-change", handleCustomEvent);
    };
  }, []);

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

  // Click outside handler - schließt Dropdowns wenn außerhalb geklickt wird
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

  // Mouse leave handler mit Verzögerung - gibt Zeit, um zum Dropdown zu navigieren
  const handleDropdownMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      void setActiveDropdown(null);
    }, 300); // 300ms Verzögerung, damit die Maus zum Dropdown bewegt werden kann
  };

  const handleDropdownMouseEnter = () => {
    // Wenn die Maus wieder über den Bereich kommt, Timeout löschen
    if (dropdownTimeoutRef.current) {
      void clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
  };

  // Navigation Sections
  const navSections: NavSection[] = ["Service"];

  const handleDropdownClick = (section: string) => {
    // Filterleiste schließen wenn Dropdown geöffnet wird
    if (activeDropdown !== section) {
      onFilterClose?.();
    }
    void setActiveDropdown(activeDropdown === section ? null : section);
  };

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
      // 🔥 WENN ANGEMELDET: Zeige alle Items außer Anmelden/Registrieren
      // Erlaube Zugriff auf "Neue Fahndung" für alle angemeldeten Benutzer
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

  // VEREINFACHTE LOGOUT-FUNKTION
  const handleLogout = async () => {
    try {
      console.log("🚪 Starte Logout...");
      const supabase = getBrowserClient();
      await supabase.auth.signOut();

      // Sofortige Weiterleitung zur Login-Seite
      window.location.href = "/login";
    } catch (err) {
      console.error("❌ Logout-Fehler:", err);
      // Trotzdem zur Login-Seite weiterleiten
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* Center Actions - Search, Theme Toggle, Plus Button, Hamburger Menu, Filter */}
      <div className="flex items-center gap-3">
        {/* Search-Gruppe: Prominente Suche - größtes Element */}
        <div className="flex items-center justify-center">
          <HeaderSearch />
        </div>

        {/* Separator */}
        <div className="h-8 w-px bg-border/60" />

        {/* Theme Toggle - nur auf Desktop */}
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

        {/* Hamburger-Menü - enthält Leichte Sprache, Gebärdensprache und Service */}
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
                        return (
                          <div key={item.href} role="menuitem">
                            <Link
                              href={item.href}
                              target={item.external ? "_blank" : undefined}
                              rel={
                                item.external
                                  ? "noopener noreferrer"
                                  : undefined
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

        {/* Filter Icon - auf Desktop nicht mehr benötigt, da Filterleiste immer sichtbar ist */}
        {/* Mobile: Filter-Button wird in MobileHeader angezeigt */}
      </div>
    </>
  );
}
