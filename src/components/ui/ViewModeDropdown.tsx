"use client";

import React from "react";

export type ViewMode = "grid-3" | "grid-4";

interface ViewModeDropdownProps {
  viewMode?: ViewMode;
  onViewChange?: (view: ViewMode) => void;
}

/**
 * ViewModeDropdown Component
 * Segmented Control für Ansichtsauswahl (3 Spalten, 4 Spalten)
 * Wird nur auf Desktop angezeigt (ab sm breakpoint)
 */
export function ViewModeDropdown({
  viewMode = "grid-4",
  onViewChange,
}: ViewModeDropdownProps) {
  if (!onViewChange) return null;

  return (
    <fieldset
      aria-label="Ansichtsmodus"
      className="hidden sm:inline-flex rounded-lg border border-border bg-background p-1"
    >
      <button
        type="button"
        onClick={() => onViewChange("grid-4")}
        className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
            transition-all duration-200
            ${
              viewMode === "grid-4"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }
          `}
        aria-pressed={viewMode === "grid-4"}
      >
        <span>4 Spalten</span>
      </button>

      <button
        type="button"
        onClick={() => onViewChange("grid-3")}
        className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
            transition-all duration-200
            ${
              viewMode === "grid-3"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }
          `}
        aria-pressed={viewMode === "grid-3"}
      >
        <span>3 Spalten</span>
      </button>
    </fieldset>
  );
}
