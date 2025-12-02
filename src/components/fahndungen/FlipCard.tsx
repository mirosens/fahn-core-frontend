"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { FahndungItem } from "@/lib/typo3Client";

interface FlipCardProps {
  fahndung: FahndungItem;
  onDetailsClick: () => void;
}

export function FlipCard({ fahndung, onDetailsClick }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="perspective-1000 h-[450px]">
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-700 transform-style-3d",
          isFlipped && "rotate-y-180"
        )}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        {/* Vorderseite */}
        <div className="absolute inset-0 backface-hidden bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* NEU Badge */}
          {fahndung.isNew && (
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                NEU
              </span>
            </div>
          )}

          {/* Bild */}
          <div className="relative h-64 bg-gray-200 dark:bg-gray-700">
            {fahndung.image ? (
              <Image
                src={fahndung.image.url}
                alt={fahndung.image.alternative || fahndung.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-400">Kein Bild verfügbar</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Meta */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>{fahndung.location || "Unbekannt"}</span>
              <span>|</span>
              <span>
                {fahndung.date
                  ? new Date(fahndung.date).toLocaleDateString("de-DE")
                  : "Unbekannt"}
              </span>
            </div>

            {/* Kategorie Badge */}
            <div className="mb-2">
              <span className="inline-block px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs font-bold rounded">
                {fahndung.kategorie || "STRAFTÄTER"}
              </span>
            </div>

            {/* Titel */}
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
              {fahndung.title}
            </h3>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Link
                href={`/fahndungen/${fahndung.id}`}
                className="flex-1 text-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                Mehr erfahren →
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDetailsClick();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Details
              </button>
            </div>
          </div>
        </div>

        {/* Rückseite */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950 rounded-lg shadow-lg p-6 text-white">
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
              {fahndung.description}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              onDetailsClick();
            }}
            className="absolute bottom-6 left-6 right-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Vollständige Details ansehen
          </button>
        </div>
      </div>
    </div>
  );
}
