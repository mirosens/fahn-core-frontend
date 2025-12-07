"use client";

import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

import { SquareMenuIcon } from "../../ui/SquareMenuIcon";
import { ModernMobileMenu } from "../MobileMenu";
import { useAuth } from "@/hooks/useAuth";

interface MobileHeaderProps {
  onFilterToggle?: () => void;
  isFilterOpen?: boolean;
  onFilterClose?: () => void;
}

/**
 * MobileHeader Component
 * Mobile-spezifische Navigation mit Hamburger-Menü
 */
export default function MobileHeader({ onFilterClose }: MobileHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  // Click outside handler - schließt Mobile-Menü wenn außerhalb geklickt wird
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

  // Cleanup Timeout beim Unmount
  useEffect(() => {
    return () => {
      if (menuTimeoutRef.current) {
        void clearTimeout(menuTimeoutRef.current);
      }
    };
  }, []);

  // Mouse leave handler mit Verzögerung - gibt Zeit, um zum Menü zu navigieren
  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setIsMobileMenuOpen(false);
    }, 300); // 300ms Verzögerung, damit die Maus zum Menü bewegt werden kann
  };

  const handleMouseEnter = () => {
    // Wenn die Maus wieder über den Bereich kommt, Timeout löschen
    if (menuTimeoutRef.current) {
      void clearTimeout(menuTimeoutRef.current);
      menuTimeoutRef.current = null;
    }
  };

  // Logout-Funktion mit useAuth Hook
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect wird im useAuth Hook durchgeführt
    } catch (err) {
      console.error("❌ Logout-Fehler:", err);
      // Fallback: Trotzdem zur Login-Seite weiterleiten
      window.location.href = "/login";
    }
  };

  return (
    <div ref={menuRef}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="p-2 text-foreground hover:bg-accent focus:outline-none focus:ring-1 focus:ring-primary/50"
        aria-label="Mobilmenü öffnen"
        aria-expanded={isMobileMenuOpen}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        {isMobileMenuOpen ? (
          <X className="h-8 w-8" />
        ) : (
          <SquareMenuIcon className="h-8 w-8" />
        )}
      </button>

      {/* Mobile Menu */}
      <ModernMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        session={user ? { user } : null}
        onLogout={handleLogout}
        onFilterClose={onFilterClose}
      />
    </div>
  );
}
