"use client";

import React, { useEffect, useRef } from "react";
import { FahndungenFilter } from "@/components/fahndungen/FahndungenFilter";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
  headerRef?: React.RefObject<HTMLElement | null>;
}

export default function FilterPanel({
  isOpen,
  onClose,
  isMobile = false,
  headerRef,
}: FilterPanelProps) {
  const filterPanelRef = useRef<HTMLDivElement | null>(null);

  // Positionierung des Filter-Panels
  useEffect(() => {
    if (!isOpen || !headerRef?.current || !filterPanelRef.current) return;

    const updatePosition = () => {
      const header = headerRef.current;
      const filterPanel = filterPanelRef.current;

      if (!header || !filterPanel) return;

      const headerRect = header.getBoundingClientRect();
      const headerBottom = headerRect.bottom;

      filterPanel.style.position = "fixed";
      filterPanel.style.zIndex = "40";
      filterPanel.style.top = `${headerBottom}px`;
      filterPanel.style.left = "0";
      filterPanel.style.right = "0";
      filterPanel.style.visibility = "visible";
      filterPanel.style.opacity = "1";
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition, { passive: true });

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, headerRef]);

  // Escape-Taste Handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape, true);
    return () => {
      document.removeEventListener("keydown", handleEscape, true);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={filterPanelRef}
      role="dialog"
      aria-modal="true"
      className={`
        fixed z-40
        glass-header glass-header-container
        ${
          isMobile
            ? "mx-0 rounded-none"
            : "mx-auto rounded-b-[10px] rounded-t-none max-w-[1273px]"
        }
        border-t-0
        ${isMobile ? "overflow-hidden" : "overflow-visible"}
      `}
      style={{
        touchAction: "pan-y" as const,
        pointerEvents: "auto" as const,
      }}
      aria-describedby="filter-panel-description"
    >
      <div id="filter-panel-description" className="sr-only">
        Verwenden Sie die Filteroptionen, um Fahndungen nach verschiedenen
        Kriterien zu durchsuchen. Drücken Sie Escape, um das Filter-Panel zu
        schließen.
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Fahndungen filtern</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-colors"
            aria-label="Filter schließen"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <FahndungenFilter />
      </div>
    </div>
  );
}
