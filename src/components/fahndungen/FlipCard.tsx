"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { FahndungItem } from "@/lib/typo3Client";
import { FahndungCardLink } from "./FahndungCardLink";
import NeuBadge from "@/components/ui/NeuBadge";
import { ArrowRight, EyeOff } from "lucide-react";

interface FlipCardProps {
  fahndung: FahndungItem;
  onDetailsClick: () => void;
  layoutMode?: "default" | "grid-4";
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

  const cardHeight = layoutMode === "grid-4" ? "400px" : "513px";

  return (
    <section
      ref={cardRef}
      className="relative mx-auto w-full max-w-sm"
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
          className="absolute inset-0 flex h-full w-full flex-col overflow-hidden bg-white dark:bg-gray-800 rounded-[10px] shadow-xl"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
            WebkitTransform: "rotateY(0deg)",
          }}
        >
          {/* Image Section */}
          <div
            className="relative w-full overflow-hidden bg-muted dark:bg-muted rounded-t-[10px]"
            style={{
              height: layoutMode === "grid-4" ? "65%" : "65%",
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
              <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-700">
                <span className="text-gray-400">Kein Bild verfügbar</span>
              </div>
            )}

            {/* NEU Badge */}
            {fahndung.isNew && !isFlipped && <NeuBadge variant="police" />}
          </div>

          {/* Content Section */}
          <div
            className={cn(
              "flex flex-1 flex-col justify-start text-left",
              layoutMode === "grid-4" ? "h-[35%]" : "h-1/3"
            )}
            style={{
              contain: "layout style paint",
              minHeight: layoutMode === "grid-4" ? "140px" : "193px",
              cursor: "pointer",
              paddingTop: "0rem",
              paddingBottom: "0.75rem",
              paddingLeft: "0.625rem",
              paddingRight: "0.625rem",
            }}
          >
            <div
              className="space-y-1.5"
              style={{
                paddingTop: layoutMode === "grid-4" ? "0.5rem" : "0.75rem",
                paddingBottom: layoutMode === "grid-4" ? "0.5rem" : "0rem",
              }}
            >
              {/* Meta: Stadt · Datum · Kategorie */}
              <div
                className={cn(
                  "flex items-center gap-1.5 font-medium text-muted-foreground dark:text-muted-foreground",
                  layoutMode === "grid-4" ? "text-[11px]" : "text-[13px]"
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
                      layoutMode === "grid-4" ? "px-2 py-0.5" : "px-2.5 py-1"
                    )}
                  >
                    <span
                      className={cn(
                        "font-inter font-medium text-white text-center drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] tracking-wide whitespace-nowrap",
                        layoutMode === "grid-4" ? "text-[10px]" : "text-[11px]"
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

              {/* Titel */}
              <div
                className={cn(
                  "mt-2.5 line-clamp-2 font-bold leading-tight text-muted-foreground dark:text-white",
                  layoutMode === "grid-4" ? "text-sm" : "text-base"
                )}
              >
                {fahndung.title}
              </div>
            </div>
          </div>

          {/* Controls - nur auf der Vorderseite sichtbar */}
          <div
            className="absolute left-3 right-3 flex items-center justify-between gap-2 border-t border-border/50 pt-2 dark:border-border/50"
            style={{
              bottom: "0.75rem",
              opacity: isFlipped ? 0 : 1,
              visibility: isFlipped ? "hidden" : "visible",
              transition: "opacity 0.3s ease, visibility 0.3s ease",
            }}
          >
            <div className="flex-1">
              <FahndungCardLink slug={fahndung.slug}>
                <button
                  className="flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:border-border dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted min-h-[36px]"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDetailsClick();
                  }}
                  aria-label="Mehr erfahren"
                  tabIndex={0}
                >
                  <span>Mehr erfahren</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </FahndungCardLink>
            </div>

            {/* Details Button */}
            <button
              className="flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:border-border dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted min-h-[36px]"
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
