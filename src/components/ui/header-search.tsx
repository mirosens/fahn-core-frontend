"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/?q=${encodeURIComponent(query.trim())}`);
        handleClose();
      }
    },
    [query, router, handleClose]
  );

  // Focus Management
  useEffect(() => {
    if (open && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, handleClose]);

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center justify-center text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-300"
        aria-label="Fahndungssuche öffnen"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Search className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      </button>

      {/* Search Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4"
          onClick={handleClose}
        >
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit} className="p-4">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nach Fahndungen suchen..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Suche schließen"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
