"use client";

import React, { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { VerticalThemeToggle } from "@/components/ui/VerticalThemeToggle";
import { HeaderSearch } from "@/components/ui/header-search";

interface DesktopHeaderProps {
  onFilterToggle?: () => void;
  isFilterOpen?: boolean;
  onFilterClose?: () => void;
  resultCount?: number;
  hasActiveFilters?: boolean;
}

export default function DesktopHeader({ onFilterClose }: DesktopHeaderProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div className="hidden items-center gap-3 desktop:flex">
      {/* Search */}
      <div className="hidden items-center justify-center desktop:flex">
        <HeaderSearch />
      </div>

      {/* Separator */}
      <div className="hidden h-8 w-px bg-border/60 desktop:block" />

      {/* Theme Toggle */}
      <div className="hidden desktop:flex items-center justify-center">
        <VerticalThemeToggle />
      </div>

      {/* Separator */}
      <div className="hidden h-8 w-px bg-border/60 desktop:block" />

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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
