import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

interface MultiSelectDropdownProps {
  title: string;
  options: Array<{ value: string; label: string; icon?: React.ComponentType<{ className?: string }>; color?: string }>;
  selectedValues: string[];
  onToggle: (value: string) => void;
  icon?: React.ComponentType<{ className?: string }>;
  placeholder?: string;
  maxHeight?: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  title,
  options,
  selectedValues,
  onToggle,
  icon: _Icon,
  placeholder,
  maxHeight = "max-h-48"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectedLabels = options
    .filter(opt => selectedValues.includes(opt.value))
    .map(opt => opt.label);

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

  return (
    <div 
      className="relative overflow-visible" 
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-9 w-full items-center justify-between rounded-md border border-border bg-background px-3 text-left font-medium text-foreground transition-all duration-200 hover:bg-accent focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
          selectedValues.length > 0 ? "border-primary bg-primary/10 text-foreground" : "text-foreground"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium whitespace-nowrap truncate">
            {selectedLabels.length > 0 
              ? `${selectedLabels.length} ausgewählt` 
              : placeholder ?? title}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div 
          className={`absolute z-[60] mt-1 w-full rounded-md border border-border bg-popover shadow-lg ${maxHeight} overflow-y-auto`}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
          role="menu"
          tabIndex={-1}
        >
          <div className="p-1">
            {options.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onToggle(option.value)}
                  className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent ${
                    isSelected ? "bg-primary/10 text-foreground" : "text-foreground"
                  }`}
                >
                  <div className="flex h-4 w-4 items-center justify-center flex-shrink-0">
                    {isSelected ? (
                      <Check className="h-4 w-4 text-foreground" />
                    ) : (
                      <div className="h-4 w-4 rounded border-2 border-foreground/30" />
                    )}
                  </div>
                  <span className="flex-1 truncate text-sm font-medium text-foreground">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

