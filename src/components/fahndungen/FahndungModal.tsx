"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, MapPin, Calendar, User, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FahndungItem } from "@/lib/typo3Client";

interface FahndungModalProps {
  fahndung: FahndungItem;
  isOpen: boolean;
  onClose: () => void;
}

export function FahndungModal({
  fahndung,
  isOpen,
  onClose,
}: FahndungModalProps) {
  // ESC-Key schließt Modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full max-w-4xl max-h-[90vh] overflow-y-auto",
          "bg-white dark:bg-gray-900 rounded-xl shadow-2xl",
          "animate-in zoom-in-95"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fahndungsdetails
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Schließen"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Bild */}
          {fahndung.image && (
            <div className="relative h-96 mb-6 rounded-lg overflow-hidden">
              <Image
                src={fahndung.image.url}
                alt={fahndung.image.alternative || fahndung.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Titel & Status */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-full",
                  fahndung.status === "active" &&
                    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                  fahndung.status === "completed" &&
                    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                )}
              >
                {fahndung.status.toUpperCase()}
              </span>
              {fahndung.isNew && (
                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                  NEU
                </span>
              )}
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {fahndung.title}
            </h3>
          </div>

          {/* Meta-Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Tatort
                </div>
                <div className="font-semibold">
                  {fahndung.location || "Nicht angegeben"}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Tatzeit
                </div>
                <div className="font-semibold">
                  {fahndung.tatzeit || "Nicht angegeben"}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Delikt
                </div>
                <div className="font-semibold">
                  {fahndung.delikt || "Nicht angegeben"}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Phone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Dienststelle
                </div>
                <div className="font-semibold">
                  {fahndung.dienststelle || "LKA Baden-Württemberg"}
                </div>
              </div>
            </div>
          </div>

          {/* Beschreibung */}
          <div className="mb-6">
            <h4 className="text-lg font-bold mb-3">Sachverhalt</h4>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {fahndung.description}
              </p>
            </div>
          </div>

          {/* Hinweis-CTA */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h4 className="text-lg font-bold mb-2 text-blue-900 dark:text-blue-100">
              Haben Sie Hinweise zu diesem Fall?
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
              Ihre Informationen werden vertraulich behandelt und können zur
              Aufklärung beitragen.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/hinweise"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                Online-Hinweis melden
              </a>
              <a
                href="tel:110"
                className="px-6 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-bold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                Notruf: 110
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
