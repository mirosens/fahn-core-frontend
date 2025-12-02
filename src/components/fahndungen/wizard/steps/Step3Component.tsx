"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  WandSparkles,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import type { Step3Data, WizardData } from "../types/WizardTypes";
import { useResponsive } from "@/hooks/useResponsive";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Step3ComponentProps {
  data: Step3Data;
  onChange: (data: Step3Data) => void;
  wizard?: Partial<WizardData>;
  showValidation?: boolean;
}

const Step3Component: React.FC<Step3ComponentProps> = ({
  data,
  onChange,
  showValidation = false,
}) => {
  const { isMobile, isTablet } = useResponsive();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedPreviewUrls, setUploadedPreviewUrls] = useState<{
    main: string | null;
    additional: string[];
  }>({
    main: null,
    additional: [],
  });

  // Berechne Preview-URLs aus Props (nicht in useEffect)
  const computedPreviewUrls = useMemo(() => {
    let mainUrl: string | null = null;
    let additionalUrls: string[] = [];

    if (data.mainImageUrl) {
      mainUrl = data.mainImageUrl;
    } else if (data.mainImage && typeof data.mainImage === "string") {
      mainUrl = data.mainImage;
    } else if (data.allMedia && data.allMedia.length > 0) {
      mainUrl = data.allMedia[0]?.url || null;
    }

    if (data.additionalImageUrls && data.additionalImageUrls.length > 0) {
      additionalUrls = data.additionalImageUrls;
    } else if (data.allMedia && data.allMedia.length > 1) {
      additionalUrls = data.allMedia
        .slice(1)
        .map((m) => m.url)
        .filter(Boolean) as string[];
    }

    return { main: mainUrl, additional: additionalUrls };
  }, [
    data.mainImage,
    data.mainImageUrl,
    data.allMedia,
    data.additionalImageUrls,
  ]);

  // Kombiniere berechnete URLs mit hochgeladenen URLs (Uploads haben Priorität)
  const previewUrls = useMemo(
    () => ({
      main: uploadedPreviewUrls.main || computedPreviewUrls.main,
      additional:
        uploadedPreviewUrls.additional.length > 0
          ? uploadedPreviewUrls.additional
          : computedPreviewUrls.additional,
    }),
    [uploadedPreviewUrls, computedPreviewUrls]
  );

  // Prüfe ob ein Hauptbild vorhanden ist
  const hasMainImageString =
    data.mainImage &&
    typeof data.mainImage === "string" &&
    data.mainImage.length > 0;
  const hasMainImageUrl = data.mainImageUrl && data.mainImageUrl.length > 0;
  const hasAllMedia =
    data.allMedia &&
    data.allMedia.length > 0 &&
    data.allMedia.some((media) => media.url && media.url.length > 0);

  const hasMainImage = Boolean(
    hasMainImageString ?? hasMainImageUrl ?? hasAllMedia ?? previewUrls.main
  );

  // Handler für Hauptbild-Upload
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Prüfe Dateityp
    if (!file.type.startsWith("image/")) {
      alert("Bitte wählen Sie eine Bilddatei aus.");
      return;
    }

    // Prüfe Dateigröße (max 10 MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Die Datei ist zu groß. Maximale Größe: 10 MB");
      return;
    }

    // Erstelle Object URL für Preview
    const objectUrl = URL.createObjectURL(file);
    setUploadedPreviewUrls((prev) => ({ ...prev, main: objectUrl }));

    // Aktualisiere Daten
    // PROVISORISCH: Speichere als File-Objekt
    // Später: Upload zu Typo3 und URL speichern
    onChange({
      ...data,
      mainImage: file,
      mainImageUrl: objectUrl, // Provisorisch: Object URL, später: Typo3 URL
      allMedia: [
        {
          id: `temp-${Date.now()}`,
          public_id: `temp-${Date.now()}`,
          type: "image" as const,
          url: objectUrl,
          resource_type: "image",
        },
      ],
    });
  };

  // Handler für zusätzliche Bilder
  const handleAdditionalImagesUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      alert("Bitte wählen Sie Bilddateien aus.");
      return;
    }

    // Prüfe Dateigröße
    const oversizedFiles = imageFiles.filter(
      (file) => file.size > 10 * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      alert("Einige Dateien sind zu groß. Maximale Größe: 10 MB");
      return;
    }

    // Erstelle Object URLs für Preview
    const newUrls = imageFiles.map((file) => URL.createObjectURL(file));
    setUploadedPreviewUrls((prev) => ({
      ...prev,
      additional: [...prev.additional, ...newUrls],
    }));

    // Aktualisiere Daten
    const newMedia = imageFiles.map((file, index) => ({
      id: `temp-${Date.now()}-${index}`,
      public_id: `temp-${Date.now()}-${index}`,
      type: "image" as const,
      url: newUrls[index]!,
      resource_type: "image",
    }));

    onChange({
      ...data,
      additionalImages: [
        ...(data.additionalImages || []),
        ...imageFiles.map((f) => f.name),
      ],
      additionalImageUrls: [...(data.additionalImageUrls || []), ...newUrls],
      allMedia: [...(data.allMedia || []), ...newMedia],
    });
  };

  // Entferne Hauptbild
  const removeMainImage = () => {
    if (
      uploadedPreviewUrls.main &&
      uploadedPreviewUrls.main.startsWith("blob:")
    ) {
      URL.revokeObjectURL(uploadedPreviewUrls.main);
    }
    setUploadedPreviewUrls((prev) => ({ ...prev, main: null }));
    onChange({
      ...data,
      mainImage: undefined,
      mainImageUrl: undefined,
      allMedia: data.allMedia?.filter((m, i) => i !== 0) || [],
    });
  };

  // Entferne zusätzliches Bild
  const removeAdditionalImage = (index: number) => {
    const url = uploadedPreviewUrls.additional[index];
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
    setUploadedPreviewUrls((prev) => ({
      ...prev,
      additional: prev.additional.filter((_, i) => i !== index),
    }));
    onChange({
      ...data,
      additionalImages: data.additionalImages?.filter((_, i) => i !== index),
      additionalImageUrls: data.additionalImageUrls?.filter(
        (_, i) => i !== index
      ),
      allMedia: data.allMedia?.filter((_, i) => i !== index + 1) || [],
    });
  };

  // Demo-Daten generieren (verwendet Platzhalterbild)
  const generateDemoMedia = () => {
    const placeholderUrl = "/platzhalterbild.svg";
    onChange({
      ...data,
      mainImage: placeholderUrl,
      mainImageUrl: placeholderUrl,
      allMedia: [
        {
          id: "demo-main",
          public_id: "demo-main",
          type: "image" as const,
          url: placeholderUrl,
          resource_type: "image",
        },
      ],
    });
    setUploadedPreviewUrls({ main: placeholderUrl, additional: [] });
  };

  // Cleanup Object URLs beim Unmount
  useEffect(() => {
    const mainUrl = uploadedPreviewUrls.main;
    const additionalUrls = uploadedPreviewUrls.additional;
    return () => {
      if (mainUrl && mainUrl.startsWith("blob:")) {
        URL.revokeObjectURL(mainUrl);
      }
      additionalUrls.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [uploadedPreviewUrls.main, uploadedPreviewUrls.additional]);

  return (
    <div
      className={cn(
        "mx-auto max-w-4xl",
        isMobile ? "space-y-4 px-4" : isTablet ? "space-y-5 px-6" : "space-y-6"
      )}
    >
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2
          className={cn(
            "mb-2 font-semibold text-muted-foreground dark:text-white",
            isMobile ? "text-xl" : "text-2xl"
          )}
        >
          Schritt 3: Medien
        </h2>
        <p className="text-sm text-slate-500 dark:text-muted-foreground">
          Wählen Sie ein Hauptbild für die Fahndung. Weitere Bilder können
          optional hinzugefügt werden.
        </p>
      </div>

      {/* Schnellstart: Demo-Medien */}
      <div className="rounded-xl border border-blue-200 bg-linear-to-r from-blue-50 to-blue-100 dark:border-blue-800 dark:from-blue-900/50 dark:to-blue-800/50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <WandSparkles
              className={cn(
                "shrink-0 text-blue-600 dark:text-blue-400",
                isMobile ? "h-4 w-4" : "h-5 w-5"
              )}
            />
            <span
              className={cn(
                "font-semibold text-blue-900 dark:text-blue-100",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              Schnellstart: Platzhalterbild verwenden
            </span>
          </div>
          <button
            onClick={generateDemoMedia}
            className={cn(
              "rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              isMobile && "w-full"
            )}
          >
            Platzhalterbild verwenden
          </button>
        </div>
      </div>

      {/* Hinweise-Box */}
      <div
        role="note"
        className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/30"
      >
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Hinweise
            </h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-900 dark:text-blue-300">
              <li>
                Das Hauptbild wird als Vorschaubild für die Fahndung verwendet
              </li>
              <li>Unterstützte Formate: JPG, PNG, GIF, WebP</li>
              <li>Maximale Dateigröße: 10 MB pro Bild</li>
              <li>
                <strong>Hinweis:</strong> Medien werden später aus Typo3 geladen
                (provisorisch: lokale Uploads)
              </li>
            </ul>
            <div className="mt-3 flex items-start gap-2 rounded-lg border-2 border-amber-400 bg-amber-100 p-3 dark:border-amber-600 dark:bg-amber-900/40">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                ⚠️ Bitte beachten: Unbeteiligte sollten nicht zu sehen (besser:
                nicht zu erkennen) sein.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Validierung */}
      {showValidation && !hasMainImage && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <h3 className="text-sm font-medium text-destructive">
                Hauptbild erforderlich
              </h3>
              <p className="mt-1 text-sm text-destructive">
                Bitte wählen Sie mindestens ein Hauptbild aus, um fortzufahren.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Erfolgsmeldung */}
      {hasMainImage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                Medien erfolgreich ausgewählt
              </h3>
              <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                Sie können jetzt zu Schritt 4 (Standort) weitergehen.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hauptbild Upload */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-muted-foreground dark:text-muted-foreground">
          Hauptbild *
        </label>
        <div className="space-y-3">
          {previewUrls.main ? (
            <div className="relative rounded-lg border border-border overflow-hidden">
              <div className="relative aspect-video w-full bg-muted">
                <Image
                  src={previewUrls.main}
                  alt="Hauptbild Vorschau"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <button
                  onClick={removeMainImage}
                  className="absolute right-2 top-2 rounded-full bg-red-600 p-2 text-white transition-colors hover:bg-red-700"
                  aria-label="Bild entfernen"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-8 transition-colors hover:bg-muted"
            >
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">
                Bild hochladen
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Klicken Sie hier oder ziehen Sie ein Bild hierher
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleMainImageUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Zusätzliche Bilder */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-muted-foreground dark:text-muted-foreground">
          Zusätzliche Bilder (optional)
        </label>
        <div className="space-y-3">
          {previewUrls.additional.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {previewUrls.additional.map((url, index) => (
                <div
                  key={index}
                  className="relative rounded-lg border border-border overflow-hidden"
                >
                  <div className="relative aspect-square w-full bg-muted">
                    <Image
                      src={url}
                      alt={`Zusätzliches Bild ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    <button
                      onClick={() => removeAdditionalImage(index)}
                      className="absolute right-1 top-1 rounded-full bg-red-600 p-1.5 text-white transition-colors hover:bg-red-700"
                      aria-label="Bild entfernen"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div
            onClick={() => additionalFileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-6 transition-colors hover:bg-muted"
          >
            <ImageIcon className="mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              Weitere Bilder hinzufügen
            </p>
          </div>
          <input
            ref={additionalFileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleAdditionalImagesUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default Step3Component;
