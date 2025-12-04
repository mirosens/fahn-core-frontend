"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { FahndungItem } from "@/lib/typo3Client";
import NeuBadge from "@/components/ui/NeuBadge";
import { EyeOff } from "lucide-react";

interface FlipCardProps {
  fahndung: FahndungItem;
  onDetailsClick: () => void;
  layoutMode?: "default" | "grid-4" | "grid-3";
  isCarousel?: boolean;
}

export function FlipCard({
  fahndung,
  onDetailsClick,
  layoutMode = "default",
  isCarousel = false,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  // Kategorie-Labels
  const getCategoryLabel = (type: FahndungItem["type"]) => {
    switch (type) {
      case "missing_person":
        return "Vermisste Personen";
      case "wanted":
        return "Gesuchte Straftäter";
      case "witness_appeal":
        return "Zeugenaufruf";
      default:
        return "Fahndung";
    }
  };

  const getCategoryBadgeColor = (type: FahndungItem["type"]) => {
    switch (type) {
      case "missing_person":
        return "bg-blue-600/80 dark:bg-blue-600/90 border-blue-400/40 dark:border-blue-400/30";
      case "wanted":
        return "bg-red-600/80 dark:bg-red-600/90 border-red-400/40 dark:border-red-400/30";
      default:
        return "bg-gray-600/80 dark:bg-gray-600/90 border-gray-400/40 dark:border-gray-400/30";
    }
  };

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Keyboard & Click-Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!cardRef.current?.contains(document.activeElement)) return;
      if (e.key === "Escape" && isFlipped) {
        e.preventDefault();
        flipCard();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        isFlipped &&
        cardRef.current &&
        !cardRef.current.contains(e.target as Node)
      ) {
        flipCard();
      }
    };

    const cardElement = cardRef.current;
    if (cardElement) cardElement.addEventListener("keydown", handleKeyDown);
    if (isFlipped) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      if (cardElement)
        cardElement.removeEventListener("keydown", handleKeyDown);
      if (isFlipped) {
        document.removeEventListener("mousedown", handleClickOutside);
      }
    };
  }, [isFlipped, flipCard]);

  // Tab-Index Management
  useEffect(() => {
    if (backRef.current) {
      const focusableElements = backRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusableElements.forEach((element) => {
        element.setAttribute("tabindex", isFlipped ? "0" : "-1");
      });
    }
  }, [isFlipped]);

  const cardHeight =
    layoutMode === "grid-4"
      ? "450px"
      : layoutMode === "grid-3"
        ? "580px"
        : "513px";

  return (
    <section
      ref={cardRef}
      className={cn(
        "relative mx-auto w-full",
        layoutMode === "grid-3" ? "" : "max-w-sm"
      )}
      style={{
        height: cardHeight,
        perspective: "1000px",
        WebkitPerspective: "1000px",
      }}
      aria-label={`Fahndungskarte: ${fahndung.title}`}
    >
      <div
        className="relative h-full w-full"
        style={{
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.9s ease-in-out",
          willChange: "transform",
        }}
      >
        {/* FRONT SIDE */}
        <div
          className={cn(
            "absolute inset-0 flex h-full w-full flex-col overflow-hidden rounded-[10px] shadow-xl",
            layoutMode === "grid-4" || layoutMode === "grid-3"
              ? "bg-transparent border border-border/20"
              : "bg-white dark:bg-gray-800"
          )}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
            WebkitTransform: "rotateY(0deg)",
          }}
        >
          {/* Image Section */}
          <div
            className={cn(
              "relative w-full overflow-hidden bg-muted dark:bg-muted",
              layoutMode === "grid-4" || layoutMode === "grid-3"
                ? "aspect-square flex-shrink-0 rounded-t-[10px]"
                : "rounded-t-[10px]"
            )}
            style={{
              height:
                layoutMode === "grid-4" || layoutMode === "grid-3"
                  ? undefined
                  : "65%",
            }}
          >
            {/* Logo oben links */}
            <div className="absolute left-1 top-1 z-20">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                style={{
                  display: "block",
                  margin: 0,
                }}
              />
            </div>

            {/* Bild */}
            {fahndung.image ? (
              <div className="relative h-full w-full transition-transform duration-500 group-hover:scale-105">
                <Image
                  src={fahndung.image.url}
                  alt={fahndung.image.alternative || fahndung.title}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ) : (
              <div className="relative h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                <Image
                  src="/platzhalterbild.svg"
                  alt="Platzhalterbild"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}

            {/* NEU Badge */}
            {fahndung.isNew && !isFlipped && <NeuBadge variant="police" />}
          </div>

          {/* Content Section - Unter dem Bild, ohne eigenen Rahmen/Hintergrund */}
          <div
            className={cn(
              "flex flex-1 flex-col text-left",
              layoutMode === "grid-4" || layoutMode === "grid-3"
                ? "flex-shrink-0 px-4 pt-4 pb-4"
                : "h-1/3 px-4 pt-4 pb-4"
            )}
            style={{
              contain: "layout style paint",
              minHeight:
                layoutMode === "grid-4"
                  ? "120px"
                  : layoutMode === "grid-3"
                    ? "200px"
                    : "193px",
              height:
                layoutMode === "grid-4" || layoutMode === "grid-3"
                  ? "auto"
                  : undefined,
            }}
          >
            <div
              className={cn(
                "space-y-2",
                layoutMode === "grid-4"
                  ? "space-y-1.5"
                  : layoutMode === "grid-3"
                    ? "space-y-2"
                    : "space-y-2"
              )}
            >
              {/* Meta: Stadt · Datum · Kategorie */}
              <div
                className={cn(
                  "flex items-center gap-1.5 font-medium text-muted-foreground dark:text-muted-foreground",
                  layoutMode === "grid-4"
                    ? "text-[11px]"
                    : layoutMode === "grid-3"
                      ? "text-[12px]"
                      : "text-[13px]"
                )}
              >
                {fahndung.location && (
                  <>
                    <span className="truncate font-semibold">
                      {fahndung.location}
                    </span>
                    <span className="text-muted-foreground/60">·</span>
                  </>
                )}
                {fahndung.publishedAt && (
                  <>
                    <span>
                      {new Date(fahndung.publishedAt).toLocaleDateString(
                        "de-DE",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </span>
                    <span className="text-muted-foreground/60">·</span>
                  </>
                )}
                {isCarousel ? (
                  <div
                    className={cn(
                      "rounded-full backdrop-blur-sm border",
                      getCategoryBadgeColor(fahndung.type),
                      layoutMode === "grid-4" || layoutMode === "grid-3"
                        ? "px-2 py-0.5"
                        : "px-2.5 py-1"
                    )}
                  >
                    <span
                      className={cn(
                        "font-inter font-medium text-white text-center drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] tracking-wide whitespace-nowrap",
                        layoutMode === "grid-4"
                          ? "text-[10px]"
                          : layoutMode === "grid-3"
                            ? "text-[11px]"
                            : "text-[11px]"
                      )}
                      style={{ fontVariationSettings: '"wght" 500' }}
                    >
                      {getCategoryLabel(fahndung.type)}
                    </span>
                  </div>
                ) : (
                  <span className="font-semibold">
                    {getCategoryLabel(fahndung.type)}
                  </span>
                )}
              </div>

              {/* Titel und Button in einer Zeile */}
              <div className="flex items-start justify-between gap-3">
                {/* Titel */}
                <div
                  className={cn(
                    "line-clamp-2 font-bold leading-tight text-foreground dark:text-white flex-1",
                    layoutMode === "grid-4"
                      ? "text-sm mt-1"
                      : layoutMode === "grid-3"
                        ? "text-base mt-1.5"
                        : "text-base mt-2"
                  )}
                >
                  {fahndung.title}
                </div>

                {/* Modern Button - Rechts neben dem Text */}
                <div
                  className="flex-shrink-0"
                  style={{
                    opacity: isFlipped ? 0 : 1,
                    visibility: isFlipped ? "hidden" : "visible",
                    transition: "opacity 0.3s ease, visibility 0.3s ease",
                  }}
                >
                  <button
                    className="flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95 min-h-[40px] whitespace-nowrap"
                    onClick={(e) => {
                      e.stopPropagation();
                      flipCard();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        flipCard();
                      }
                    }}
                    aria-label="Details anzeigen"
                    tabIndex={0}
                  >
                    <span>Details</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BACK SIDE */}
        <div
          ref={backRef}
          className="absolute inset-0 flex h-full w-full flex-col overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950 rounded-[10px] shadow-xl"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            WebkitTransform: "rotateY(180deg)",
          }}
        >
          <div className="flex items-center justify-between border-b border-white/20 p-4">
            <h3 className="text-lg font-semibold text-white">Details</h3>
            <button
              onClick={flipCard}
              className="rounded-full p-1 text-white transition-colors hover:bg-white/20 min-h-[44px] min-w-[44px]"
              style={{
                height: "44px",
                width: "44px",
                minHeight: "44px",
                minWidth: "44px",
              }}
              aria-label="Karte schließen"
            >
              <EyeOff className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 text-white">
            <h3 className="font-bold text-xl mb-4">{fahndung.title}</h3>

            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-semibold opacity-80">Delikt:</dt>
                <dd>{fahndung.delikt || "Nicht angegeben"}</dd>
              </div>
              <div>
                <dt className="font-semibold opacity-80">Tatort:</dt>
                <dd>{fahndung.location || "Nicht angegeben"}</dd>
              </div>
              <div>
                <dt className="font-semibold opacity-80">Tatzeit:</dt>
                <dd>{fahndung.tatzeit || "Nicht angegeben"}</dd>
              </div>
              <div>
                <dt className="font-semibold opacity-80">Status:</dt>
                <dd className="inline-block px-2 py-1 bg-white/20 rounded">
                  {fahndung.status}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <p className="text-sm opacity-90 line-clamp-4">
                {fahndung.description || fahndung.summary}
              </p>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 z-20 bg-blue-800/95 dark:bg-blue-950/95 backdrop-blur-lg border-t border-white/20 px-4 py-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDetailsClick();
              }}
              className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-white hover:bg-gray-100 text-blue-600 rounded-xl transition-colors font-semibold shadow-lg min-h-[56px]"
            >
              Vollständige Ansicht
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
