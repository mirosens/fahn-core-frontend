"use client";

import React, { useMemo } from "react";
import type { WizardData } from "../types/WizardTypes";
import { FlipCard } from "@/components/fahndungen/FlipCard";
import type { FahndungItem } from "@/lib/typo3Client";

export interface LivePreviewCardProps {
  data: Partial<WizardData>;
}

const LivePreviewCard: React.FC<LivePreviewCardProps> = ({ data }) => {
  // Konvertiere Wizard-Daten zu FahndungItem-Format für FlipCard
  const previewData = useMemo<FahndungItem>(() => {
    const category = data.step1?.category ?? "";

    // Mappe Kategorien zu FahndungItem-Typen
    const typeMap: Record<
      string,
      "missing_person" | "witness_appeal" | "wanted"
    > = {
      MISSING_PERSON: "missing_person",
      WANTED_PERSON: "wanted",
      UNKNOWN_DEAD: "missing_person",
      STOLEN_GOODS: "wanted",
    };

    // Kombiniere Beschreibung aus Step2
    const description =
      [data.step2?.sachverhalt, data.step2?.personenbeschreibung]
        .filter(Boolean)
        .join("\n\n") ||
      data.step2?.description ||
      "";

    // Bestimme Hauptbild-URL - verwende Platzhalterbild als Fallback
    const mainImageUrl =
      data.step3?.mainImageUrl ||
      (typeof data.step3?.mainImage === "string"
        ? data.step3.mainImage
        : undefined) ||
      (data.step3?.allMedia && data.step3.allMedia.length > 0
        ? data.step3.allMedia[0]?.url
        : undefined) ||
      "/platzhalterbild.svg"; // Fallback zum Platzhalterbild

    // Extrahiere Stadt aus Adresse oder Dienststelle
    const location =
      data.step4?.mainLocation?.address || data.step1?.office || "";

    return {
      id: 0,
      title: data.step1?.title || "Titel der Fahndung",
      description: description || "Beschreibung wird hier angezeigt...",
      summary:
        data.step2?.sachverhalt?.substring(0, 200) ||
        description.substring(0, 200) ||
        "",
      status: "active" as const,
      type: typeMap[category] || "missing_person",
      location: location,
      delikt: data.step1?.delikt,
      tatzeit: data.step1?.eventTime || undefined,
      publishedAt: data.step1?.eventTime
        ? new Date(data.step1.eventTime).toISOString()
        : new Date().toISOString(),
      slug: "preview",
      image: {
        url: mainImageUrl,
        alternative: data.step1?.title || "Fahndungsbild",
      },
      isNew: false,
    };
  }, [
    data.step1?.title,
    data.step1?.category,
    data.step1?.eventTime,
    data.step1?.office,
    data.step1?.delikt,
    data.step2?.sachverhalt,
    data.step2?.personenbeschreibung,
    data.step2?.description,
    data.step3?.mainImage,
    data.step3?.mainImageUrl,
    data.step3?.allMedia,
    data.step4?.mainLocation?.address,
  ]);

  return (
    <div className="flex w-full justify-center">
      <FlipCard
        fahndung={previewData}
        onDetailsClick={() => {
          // Preview-Modus - keine Navigation
        }}
        layoutMode="default"
        isCarousel={false}
      />
    </div>
  );
};

export default LivePreviewCard;
