"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Menu } from "lucide-react";

interface MobileHeaderProps {
  onFilterToggle?: () => void;
  isFilterOpen?: boolean;
  onFilterClose?: () => void;
}

export default function MobileHeader({ onFilterClose }: MobileHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <div ref={menuRef}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="p-2 text-foreground hover:bg-accent focus:outline-none focus:ring-1 focus:ring-primary/50 desktop:hidden"
        aria-label="Mobilmenü öffnen"
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? (
          <X className="h-8 w-8" />
        ) : (
          <Menu className="h-8 w-8" />
        )}
      </button>

      {/* Mobile Menu - vereinfacht */}
      {isMobileMenuOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 z-[70] rounded-xl border border-border/50 bg-popover/95 shadow-xl backdrop-blur-2xl dark:bg-popover/90 p-2">
          <div className="space-y-1">
            <Link
              href="/leichte-sprache"
              onClick={() => {
                onFilterClose?.();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-accent"
            >
              <span className="text-sm font-medium text-foreground">
                Leichte Sprache
              </span>
            </Link>
            <Link
              href="/gebaerdensprache"
              onClick={() => {
                onFilterClose?.();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-accent"
            >
              <span className="text-sm font-medium text-foreground">
                Gebärdensprache
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
