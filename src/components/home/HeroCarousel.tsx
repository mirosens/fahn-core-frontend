"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type FahndungItem } from "@/lib/typo3Client";
import { FlipCard } from "@/components/fahndungen/FlipCard";
import { FahndungModal } from "@/components/fahndungen/FahndungModal";

interface HeroCarouselProps {
  fahndungen: FahndungItem[];
}

export function HeroCarousel({ fahndungen }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedFahndung, setSelectedFahndung] = useState<FahndungItem | null>(
    null
  );

  // Filtere nach Kategorien für die beiden Carousels
  const vermisste = useMemo(
    () => fahndungen.filter((f) => f.type === "missing_person").slice(0, 5),
    [fahndungen]
  );

  const gesuchte = useMemo(
    () => fahndungen.filter((f) => f.type === "wanted").slice(0, 5),
    [fahndungen]
  );

  // Auto-rotate für Vermisste
  useEffect(() => {
    if (vermisste.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % vermisste.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [vermisste.length]);

  const currentVermisste = vermisste[currentIndex] || null;
  const currentGesuchte = gesuchte[0] || null;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        {/* Hero Header */}
        <div className="mx-auto max-w-4xl text-center text-white mb-12">
          <h1 className="mb-4 text-4xl font-bold lg:text-5xl">
            Die Polizei bittet um Ihre Mithilfe
          </h1>
          <p className="text-lg opacity-90 lg:text-xl">
            Das Fahndungsportal der Polizei Baden-Württemberg unterstützt die
            Öffentlichkeit bei der Aufklärung von Straftaten. Bitte melden Sie
            sich, wenn Sie Hinweise zu den hier veröffentlichten Fahndungen
            haben.
          </p>
        </div>

        {/* Carousel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Vermisste Personen Carousel */}
          <div className="relative">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-white mb-1">
                Vermisste Personen
              </h3>
              <p className="text-sm text-white/80">
                Wir brauchen Ihre Hinweise
              </p>
            </div>

            {vermisste.length > 0 ? (
              <div className="relative group">
                <div className="relative aspect-[3/4] w-full mx-auto max-w-[300px]">
                  {currentVermisste && (
                    <div className="absolute inset-0">
                      <FlipCard
                        fahndung={currentVermisste}
                        onDetailsClick={() =>
                          setSelectedFahndung(currentVermisste)
                        }
                      />
                    </div>
                  )}

                  {/* Navigation Controls */}
                  {vermisste.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setCurrentIndex((prev) =>
                            prev === 0 ? vermisste.length - 1 : prev - 1
                          )
                        }
                        className="absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm shadow-sm opacity-40 group-hover:opacity-100 group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:shadow-xl hover:scale-105 focus:opacity-100 focus:bg-white dark:focus:bg-slate-800 focus:shadow-xl focus:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:ring-offset-2 flex items-center justify-center"
                        aria-label="Vorherige Fahndung"
                      >
                        <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                      </button>

                      <button
                        onClick={() =>
                          setCurrentIndex(
                            (prev) => (prev + 1) % vermisste.length
                          )
                        }
                        className="absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm shadow-sm opacity-40 group-hover:opacity-100 group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:shadow-xl hover:scale-105 focus:opacity-100 focus:bg-white dark:focus:bg-slate-800 focus:shadow-xl focus:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:ring-offset-2 flex items-center justify-center"
                        aria-label="Nächste Fahndung"
                      >
                        <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                      </button>
                    </>
                  )}
                </div>

                {/* Pagination Dots */}
                {vermisste.length > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-4 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                    {vermisste.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`rounded-full transition-all duration-100 ease-out ${
                          idx === currentIndex
                            ? "w-8 h-2 bg-white"
                            : "w-2 h-2 bg-white/50 hover:bg-white/75"
                        }`}
                        aria-label={`Zur Fahndung ${idx + 1} springen`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative aspect-[3/4] w-full mx-auto max-w-[300px]">
                <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-white/30 bg-white/10 backdrop-blur-sm flex items-center justify-center p-8">
                  <p className="text-center text-white/80 text-lg">
                    Aktuell keine Vermissten-Fahndungen verfügbar
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Gesuchte Straftäter Carousel */}
          <div className="relative">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-white mb-1">
                Gesuchte Straftäter
              </h3>
              <p className="text-sm text-white/80">
                Haben Sie diese Person gesehen?
              </p>
            </div>

            {gesuchte.length > 0 ? (
              <div className="relative aspect-[3/4] w-full mx-auto max-w-[300px]">
                <FlipCard
                  fahndung={currentGesuchte}
                  onDetailsClick={() => setSelectedFahndung(currentGesuchte)}
                />
              </div>
            ) : (
              <div className="relative aspect-[3/4] w-full mx-auto max-w-[300px]">
                <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-white/30 bg-white/10 backdrop-blur-sm flex items-center justify-center p-8">
                  <p className="text-center text-white/80 text-lg">
                    Aktuell keine Straftäter-Fahndungen verfügbar
                  </p>
                </div>
              </div>
            )}
          </div>
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
    </div>
  );
}
