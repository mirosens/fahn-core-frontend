"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FahndungItem } from "@/lib/typo3Client";
import { FlipCard } from "@/components/fahndungen/FlipCard";
import { FahndungModal } from "@/components/fahndungen/FahndungModal";

interface FahndungenCarouselProps {
  category: "missing" | "wanted";
  title: string;
  subtitle: string;
  fahndungen: FahndungItem[];
}

/**
 * FahndungenCarousel - Carousel für Fahndungen (Vermisste oder Gesuchte)
 * Zeigt eine rotierende Liste von Fahndungen mit Navigation
 */
export function FahndungenCarousel({
  category,
  subtitle,
  fahndungen,
}: FahndungenCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedFahndung, setSelectedFahndung] = useState<FahndungItem | null>(
    null
  );

  // Filtere Fahndungen nach Kategorie
  const filteredFahndungen = fahndungen
    .filter((f) => {
      if (category === "missing") {
        return f.type === "missing_person";
      } else {
        return f.type === "wanted";
      }
    })
    .slice(0, 5);

  useEffect(() => {
    if (
      filteredFahndungen.length > 0 &&
      currentIndex >= filteredFahndungen.length
    ) {
      // Verwende setTimeout, um setState asynchron aufzurufen
      const timeoutId = setTimeout(() => {
        setCurrentIndex(0);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [filteredFahndungen.length, currentIndex]);

  if (filteredFahndungen.length === 0) {
    return (
      <div className="relative">
        {/* Header */}
        <div className="text-center mb-1">
          <p className="text-base text-slate-600 dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        {/* Empty State */}
        <div
          className="relative w-full mx-auto max-w-[280px]"
          style={{ height: "380px" }}
        >
          <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm flex items-center justify-center p-8">
            <p className="text-center text-slate-600 dark:text-slate-400 text-lg">
              Aktuell keine{" "}
              {category === "missing" ? "Vermissten" : "Straftäter"}-Fahndungen
              verfügbar
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentFahndung = filteredFahndungen[currentIndex];

  return (
    <>
      <div className="relative group">
        {/* Card Container */}
        <div className="relative">
          <div
            className="relative w-full mx-auto max-w-[280px]"
            style={{ height: "380px" }}
          >
            <AnimatePresence mode="wait">
              {currentFahndung && (
                <motion.div
                  key={`${currentFahndung.id}-${currentIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <FlipCard
                    fahndung={currentFahndung}
                    onDetailsClick={() => setSelectedFahndung(currentFahndung)}
                    layoutMode="grid-4"
                    isCarousel={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Controls */}
            {filteredFahndungen.length > 1 && (
              <>
                {/* Previous Button - Weniger sichtbar, bei Hover/Focus stark sichtbar */}
                <button
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      prev === 0 ? filteredFahndungen.length - 1 : prev - 1
                    )
                  }
                  className="absolute -left-3 lg:-left-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm shadow-sm opacity-40 group-hover:opacity-100 group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:shadow-xl hover:scale-105 focus:opacity-100 focus:bg-white dark:focus:bg-slate-800 focus:shadow-xl focus:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:ring-offset-2 flex items-center justify-center"
                  aria-label="Vorherige Fahndung"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                </button>

                {/* Next Button - Weniger sichtbar, bei Hover/Focus stark sichtbar */}
                <button
                  onClick={() =>
                    setCurrentIndex(
                      (prev) => (prev + 1) % filteredFahndungen.length
                    )
                  }
                  className="absolute -right-3 lg:-right-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm shadow-sm opacity-40 group-hover:opacity-100 group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:shadow-xl hover:scale-105 focus:opacity-100 focus:bg-white dark:focus:bg-slate-800 focus:shadow-xl focus:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:ring-offset-2 flex items-center justify-center"
                  aria-label="Nächste Fahndung"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                </button>
              </>
            )}
          </div>

          {/* Modern Pagination Dots - unter dem Carousel */}
          {filteredFahndungen.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-4 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              {filteredFahndungen.map((_item, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "rounded-full transition-all duration-100 ease-out",
                    idx === currentIndex
                      ? category === "missing"
                        ? "w-8 h-2 bg-blue-500 dark:bg-blue-400"
                        : "w-8 h-2 bg-red-500 dark:bg-red-400"
                      : "w-2 h-2 bg-slate-400 dark:bg-slate-600 hover:bg-slate-500 dark:hover:bg-slate-500"
                  )}
                  aria-label={`Zur Fahndung ${idx + 1} springen`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal für Fahndungsdetails */}
      {selectedFahndung && (
        <FahndungModal
          fahndung={selectedFahndung}
          isOpen={!!selectedFahndung}
          onClose={() => setSelectedFahndung(null)}
        />
      )}
    </>
  );
}
