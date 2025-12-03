import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Clock, Calendar, Check } from "lucide-react";
import type { CompactFilterState } from "./types";
import { TIME_RANGE_OPTIONS } from "./constants";

interface DateRangeDropdownProps {
  title: string;
  timeRange: CompactFilterState["timeRange"];
  dateFrom?: string;
  dateTo?: string;
  onTimeRangeChange: (value: CompactFilterState["timeRange"]) => void;
  onDateFromChange: (value: string | undefined) => void;
  onDateToChange: (value: string | undefined) => void;
  icon?: React.ComponentType<{ className?: string }>;
  isIconOnly?: boolean;
  iconSize?: string;
}

export const DateRangeDropdown: React.FC<DateRangeDropdownProps> = ({
  title: _title,
  timeRange,
  dateFrom,
  dateTo,
  onTimeRangeChange,
  onDateFromChange,
  onDateToChange,
  icon: Icon = Calendar,
  isIconOnly = false,
  iconSize = "h-3.5 w-3.5",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"preset" | "custom">(
    dateFrom || dateTo ? "custom" : "preset"
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        void setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Mouse leave handler mit Verzögerung
  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      void setIsOpen(false);
    }, 300);
  };

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      void clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
  };

  // Cleanup Timeout beim Unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        void clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  const getDisplayText = () => {
    if (mode === "custom" && (dateFrom || dateTo)) {
      const from = dateFrom ? new Date(dateFrom + "T00:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }) : "...";
      const to = dateTo ? new Date(dateTo + "T00:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }) : "...";
      return `${from} - ${to}`;
    }
    return TIME_RANGE_OPTIONS.find((t) => t.value === timeRange)?.label ?? "Alle Zeiträume";
  };

  const handlePresetSelect = (value: CompactFilterState["timeRange"]) => {
    onTimeRangeChange(value);
    if (value !== "all") {
      onDateFromChange(undefined);
      onDateToChange(undefined);
      setMode("preset");
    }
    void setIsOpen(false);
  };

  const handleCustomDate = () => {
    setMode("custom");
    if (!dateFrom && !dateTo) {
      const today = new Date().toISOString().split("T")[0];
      onDateFromChange(today);
    }
  };

  // Icon-only Modus
  if (isIconOnly) {
    return (
      <div 
        className="relative" 
        ref={dropdownRef}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center ${iconSize.includes('h-3') ? 'h-5 w-5' : 'h-6 w-6'} rounded transition-colors ${
            (dateFrom || dateTo) || (timeRange !== "all" && !dateFrom && !dateTo)
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground/80 hover:text-foreground hover:bg-accent'
          }`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          title={dateFrom || dateTo ? getDisplayText() : "Benutzerdefiniertes Datum"}
        >
          <Icon className={iconSize} />
        </button>

        {isOpen && (
          <div 
            className="absolute right-0 top-full mt-1 z-[60] w-64 rounded-md border border-border bg-popover shadow-lg max-h-80 overflow-y-auto"
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            role="menu"
            tabIndex={-1}
          >
            <div className="p-2">
              {/* Vordefinierte Zeiträume */}
              <div className="mb-2 border-b border-border pb-2">
                <div className="mb-1.5 px-2 text-[10px] font-semibold text-foreground/80 uppercase">Schnellauswahl</div>
                {TIME_RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handlePresetSelect(option.value as CompactFilterState["timeRange"])}
                    className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent ${
                      mode === "preset" && timeRange === option.value ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
                    }`}
                  >
                    <Clock className="h-3 w-3 text-foreground/70" />
                    <span className="flex-1">{option.label}</span>
                    {mode === "preset" && timeRange === option.value && (
                      <Check className="h-3 w-3 text-primary" />
                    )}
                  </button>
                ))}
              </div>

              {/* Benutzerdefiniertes Datum */}
              <div className="mb-2 border-b border-border pb-2">
                <button
                  type="button"
                  onClick={handleCustomDate}
                  className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent ${
                    mode === "custom" ? "bg-primary/10" : ""
                  }`}
                >
                  <Calendar className="h-3 w-3 text-foreground/70" />
                  <span className="flex-1">Nach Datum</span>
                  {mode === "custom" && (
                    <Check className="h-3 w-3 text-primary" />
                  )}
                </button>
              </div>

              {/* Datumsfelder (nur wenn custom aktiv) */}
              {mode === "custom" && (
                <div className="space-y-2">
                  <div>
                    <label htmlFor="date-from-input-icon" className="mb-1 block text-[10px] text-foreground/80">Von</label>
                    <input
                      id="date-from-input-icon"
                      type="date"
                      value={dateFrom ?? ""}
                      onChange={(e) => onDateFromChange(e.target.value || undefined)}
                      className="w-full rounded border border-input bg-background px-2 py-1.5 text-xs text-foreground focus:border-transparent focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label htmlFor="date-to-input-icon" className="mb-1 block text-[10px] text-foreground/80">Bis</label>
                    <input
                      id="date-to-input-icon"
                      type="date"
                      value={dateTo ?? ""}
                      onChange={(e) => onDateToChange(e.target.value || undefined)}
                      className="w-full rounded border border-input bg-background px-2 py-1.5 text-xs text-foreground focus:border-transparent focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vollständiges Dropdown (Original)
  return (
    <div 
      className="relative overflow-visible" 
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-9 w-full items-center justify-between rounded-md border border-border bg-background px-2 text-left font-medium text-foreground transition-all duration-200 hover:bg-accent focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
          (timeRange !== "all" || dateFrom || dateTo) ? "border-primary bg-primary/10 text-primary font-semibold" : "text-foreground"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
          <span className="text-sm whitespace-nowrap truncate">{getDisplayText()}</span>
        </div>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute z-[60] mt-1 w-full rounded-md border border-border bg-popover shadow-lg max-h-80 overflow-y-auto"
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
          role="menu"
          tabIndex={-1}
        >
          <div className="p-2">
            {/* Vordefinierte Zeiträume */}
            <div className="mb-2 border-b border-border pb-2">
              <div className="mb-1.5 px-2 text-[10px] font-semibold text-foreground/80 uppercase">Schnellauswahl</div>
                {TIME_RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handlePresetSelect(option.value as CompactFilterState["timeRange"])}
                    className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent ${
                      mode === "preset" && timeRange === option.value ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
                    }`}
                  >
                    <Clock className="h-3 w-3 text-foreground/70" />
                    <span className="flex-1">{option.label}</span>
                    {mode === "preset" && timeRange === option.value && (
                      <Check className="h-3 w-3 text-primary" />
                    )}
                  </button>
                ))}
              </div>

              {/* Benutzerdefiniertes Datum */}
              <div className="mb-2 border-b border-border pb-2">
                <button
                  type="button"
                  onClick={handleCustomDate}
                  className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent ${
                    mode === "custom" ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
                  }`}
                >
                  <Calendar className="h-3 w-3 text-foreground/70" />
                  <span className="flex-1">Nach Datum</span>
                  {mode === "custom" && (
                    <Check className="h-3 w-3 text-primary" />
                  )}
                </button>
              </div>

              {/* Datumsfelder (nur wenn custom aktiv) */}
              {mode === "custom" && (
                <div className="space-y-2">
                  <div>
                    <label htmlFor="date-from-input" className="mb-1 block text-[10px] text-foreground/80">Von</label>
                    <input
                      id="date-from-input"
                      type="date"
                      value={dateFrom ?? ""}
                      onChange={(e) => onDateFromChange(e.target.value || undefined)}
                      className="w-full rounded border border-input bg-background px-2 py-1.5 text-xs text-foreground focus:border-transparent focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label htmlFor="date-to-input" className="mb-1 block text-[10px] text-foreground/80">Bis</label>
                  <input
                    id="date-to-input"
                    type="date"
                    value={dateTo ?? ""}
                    onChange={(e) => onDateToChange(e.target.value || undefined)}
                    className="w-full rounded border border-input bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

