"use client";

import React, { useState } from "react";
import { Eye, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from "../types/WizardTypes";
import type { WizardData } from "../types/WizardTypes";
import { useResponsive } from "@/hooks/useResponsive";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Step6ComponentProps {
  data: WizardData;
  showPreview: boolean;
  onTogglePreview: () => void;
}

const Step6Component: React.FC<Step6ComponentProps> = ({
  data,
  showPreview,
  onTogglePreview,
}) => {
  const { isMobile, isTablet } = useResponsive();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const toValidCategory = (
    value: unknown
  ): "WANTED_PERSON" | "MISSING_PERSON" | "UNKNOWN_DEAD" | "STOLEN_GOODS" =>
    value === "WANTED_PERSON" ||
    value === "MISSING_PERSON" ||
    value === "UNKNOWN_DEAD" ||
    value === "STOLEN_GOODS"
      ? (value as
          | "WANTED_PERSON"
          | "MISSING_PERSON"
          | "UNKNOWN_DEAD"
          | "STOLEN_GOODS")
      : "MISSING_PERSON";

  // Provisorische Funktion: Speichere Fahndung lokal
  // Später wird dies durch Typo3-Integration ersetzt
  const saveInvestigation = async (publishStatus: "draft" | "immediate") => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Erstelle Fahndungsobjekt aus Wizard-Daten
      const investigation = {
        id: `fahndung-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: data.step1.title,
        category: data.step1.category,
        description: data.step2.sachverhalt,
        personenbeschreibung: data.step2.personenbeschreibung,
        caseNumber: data.step1.caseNumber,
        office: data.step1.office,
        delikt: data.step1.delikt,
        eventTime: data.step1.eventTime,
        mainLocation: data.step4.mainLocation,
        additionalLocations: data.step4.additionalLocations,
        contactPerson: data.step5.contactPerson,
        contactPhone: data.step5.contactPhone,
        contactEmail: data.step5.contactEmail,
        organizationalUnit: data.step5.organizationalUnit,
        publishStatus,
        scheduledDate: data.step5.scheduledDate,
        deletionDate: data.step5.deletionDate,
        reminderDate: data.step5.reminderDate,
        reminderEmail: data.step5.reminderEmail,
        heroSettings: data.step5.heroSettings,
        mainImage: data.step3.mainImageUrl || data.step3.mainImage,
        additionalImages:
          data.step3.additionalImageUrls || data.step3.additionalImages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // PROVISORISCH: Speichere in localStorage
      // Später: API-Call zu Typo3
      if (typeof window !== "undefined") {
        const existingInvestigations = JSON.parse(
          localStorage.getItem("fahndungen") || "[]"
        ) as unknown[];
        existingInvestigations.push(investigation);
        localStorage.setItem(
          "fahndungen",
          JSON.stringify(existingInvestigations)
        );
      }

      // Simuliere API-Call (später durch echten Typo3-Call ersetzt)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmitSuccess(true);

      // Nach erfolgreichem Speichern: Weiterleitung zur Startseite
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      console.error("Fehler beim Speichern der Fahndung:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Fehler beim Speichern der Fahndung. Bitte versuchen Sie es erneut."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (publishStatus: "draft" | "immediate") => {
    void saveInvestigation(publishStatus);
  };

  return (
    <div
      className={cn(
        "mx-auto space-y-6",
        isMobile
          ? "max-w-full px-4 space-y-4"
          : isTablet
            ? "max-w-4xl px-6 space-y-5"
            : "max-w-4xl space-y-6"
      )}
    >
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2
          className={cn(
            "font-semibold text-muted-foreground dark:text-white",
            isMobile ? "text-xl mb-1" : "text-2xl mb-2"
          )}
        >
          Schritt 6: Zusammenfassung & Abschluss
        </h2>
        <p
          className={cn(
            "text-muted-foreground",
            isMobile ? "text-xs" : "text-sm"
          )}
        >
          Überprüfen Sie alle Daten vor der finalen Speicherung
        </p>
      </div>

      {/* Erfolgsmeldung */}
      {submitSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/30">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-semibold text-green-900 dark:text-green-100">
                Fahndung erfolgreich gespeichert!
              </p>
              <p className="text-sm text-green-800 dark:text-green-200">
                Sie werden gleich weitergeleitet...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fehlermeldung */}
      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-100">
                Fehler
              </p>
              <p className="text-sm text-red-800 dark:text-red-200">
                {submitError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Zusammenfassung */}
      <div
        className={cn(
          "grid gap-6",
          isMobile ? "grid-cols-1" : "md:grid-cols-2"
        )}
      >
        {/* Grundinformationen */}
        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4 dark:bg-muted">
            <h3
              className={cn(
                "mb-2 font-semibold text-muted-foreground dark:text-white",
                isMobile ? "text-sm" : "text-base"
              )}
            >
              Grundinformationen
            </h3>
            <dl className={cn("space-y-1", isMobile ? "text-xs" : "text-sm")}>
              <div>
                <dt className="inline font-medium">Titel:</dt>{" "}
                <dd className="ml-2 inline">
                  {data.step1?.title || "Nicht angegeben"}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">Kategorie:</dt>{" "}
                <dd className="ml-2 inline">
                  {CATEGORY_CONFIG[toValidCategory(data.step1?.category)].label}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">Aktenzeichen:</dt>{" "}
                <dd className="ml-2 inline">
                  {data.step1?.caseNumber || "Nicht angegeben"}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">Dienststelle:</dt>{" "}
                <dd className="ml-2 inline">
                  {data.step1?.office || "Nicht angegeben"}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">Ereigniszeit:</dt>{" "}
                <dd className="ml-2 inline">
                  {data.step1?.eventTime || "Nicht angegeben"}
                </dd>
              </div>
              {data.step1?.delikt && (
                <div>
                  <dt className="inline font-medium">Delikt:</dt>{" "}
                  <dd className="ml-2 inline">{data.step1.delikt}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Beschreibung */}
          <div className="rounded-lg bg-muted p-4 dark:bg-muted">
            <h3
              className={cn(
                "mb-2 font-semibold text-muted-foreground dark:text-white",
                isMobile ? "text-sm" : "text-base"
              )}
            >
              Beschreibung
            </h3>
            <p
              className={cn(
                "line-clamp-3 text-muted-foreground dark:text-muted-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              {data.step2?.sachverhalt || "Keine Beschreibung vorhanden"}
            </p>
            {data.step2?.personenbeschreibung && (
              <div className="mt-2">
                <p
                  className={cn(
                    "line-clamp-2 text-muted-foreground dark:text-muted-foreground",
                    isMobile ? "text-xs" : "text-sm"
                  )}
                >
                  <strong>Personenbeschreibung:</strong>{" "}
                  {data.step2.personenbeschreibung}
                </p>
              </div>
            )}
            <div className="mt-2">
              {(() => {
                const p: keyof typeof PRIORITY_CONFIG = "normal";
                const cfg = PRIORITY_CONFIG[p];
                return (
                  <span
                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${cfg.color} text-white`}
                  >
                    {cfg.label}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Medien, Standort, Kontakt */}
        <div className="space-y-4">
          {/* Medien */}
          <div className="rounded-lg bg-muted p-4 dark:bg-muted">
            <h3
              className={cn(
                "mb-2 font-semibold text-muted-foreground dark:text-white",
                isMobile ? "text-sm" : "text-base"
              )}
            >
              Medien
            </h3>
            <div
              className={cn(
                "text-muted-foreground dark:text-muted-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              <div>
                Hauptbild:{" "}
                {data.step3?.mainImageUrl ||
                data.step3?.mainImage ||
                (data.step3?.allMedia && data.step3.allMedia.length > 0)
                  ? "✓ Vorhanden"
                  : "✗ Nicht vorhanden"}
              </div>
              <div>
                Weitere Bilder:{" "}
                {(data.step3?.additionalImageUrls?.length ?? 0) +
                  (data.step3?.additionalImages?.length ?? 0) +
                  (data.step3?.allMedia && data.step3.allMedia.length > 1
                    ? data.step3.allMedia.length - 1
                    : 0)}
              </div>
              <div>Dokumente: {data.step3?.documents?.length ?? 0}</div>
            </div>
          </div>

          {/* Standort */}
          <div className="rounded-lg bg-muted p-4 dark:bg-muted">
            <h3
              className={cn(
                "mb-2 font-semibold text-muted-foreground dark:text-white",
                isMobile ? "text-sm" : "text-base"
              )}
            >
              Standort
            </h3>
            <div
              className={cn(
                "text-muted-foreground dark:text-muted-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              <div>
                Hauptort:{" "}
                {data.step4?.mainLocation?.address ?? "Nicht festgelegt"}
              </div>
              <div>
                Weitere Orte: {data.step4?.additionalLocations?.length ?? 0}
              </div>
            </div>
          </div>

          {/* Kontakt & Veröffentlichung */}
          <div className="rounded-lg bg-muted p-4 dark:bg-muted">
            <h3
              className={cn(
                "mb-2 font-semibold text-muted-foreground dark:text-white",
                isMobile ? "text-sm" : "text-base"
              )}
            >
              Kontakt & Veröffentlichung
            </h3>
            <div
              className={cn(
                "text-muted-foreground dark:text-muted-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              <div>
                Kontakt: {data.step5?.contactPerson ?? "Nicht angegeben"}
              </div>
              <div>
                Organisationseinheit:{" "}
                {data.step5?.organizationalUnit ??
                  data.step5?.department ??
                  "Nicht angegeben"}
              </div>
              <div>
                Status:{" "}
                {data.step5?.publishStatus === "draft"
                  ? "Entwurf"
                  : data.step5?.publishStatus === "immediate"
                    ? "Sofort veröffentlichen"
                    : data.step5?.publishStatus === "scheduled"
                      ? "Geplant"
                      : data.step5?.publishStatus === "review"
                        ? "Zur Überprüfung"
                        : "Entwurf"}
              </div>
              {data.step5?.contactEmail && (
                <div>E-Mail: {data.step5.contactEmail}</div>
              )}
              {data.step5?.contactPhone && (
                <div>Telefon: {data.step5.contactPhone}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hinweis: Provisorische Speicherung */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="flex-1">
            <p
              className={cn(
                "font-semibold text-amber-900 dark:text-amber-100",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              Provisorische Speicherung
            </p>
            <p
              className={cn(
                "mt-1 text-amber-800 dark:text-amber-200",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              Die Fahndung wird aktuell lokal gespeichert. Später wird die
              Speicherung über headless Typo3 erfolgen.
            </p>
          </div>
        </div>
      </div>

      {/* Aktion Buttons */}
      <div
        className={cn(
          "flex justify-between border-t border-border pt-6 dark:border-border",
          isMobile && "flex-col gap-3"
        )}
      >
        <div className={cn("flex gap-3", isMobile && "w-full")}>
          <button
            onClick={onTogglePreview}
            disabled={isSubmitting}
            className={cn(
              "flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-muted-foreground hover:bg-muted/80 disabled:opacity-50 dark:bg-muted dark:text-muted-foreground",
              isMobile && "flex-1"
            )}
          >
            <Eye className="h-4 w-4" />
            {showPreview ? "Vorschau ausblenden" : "Kartenvorschau anzeigen"}
          </button>
        </div>

        <div className={cn("flex gap-3", isMobile && "w-full")}>
          <button
            onClick={() => handleSubmit("draft")}
            disabled={isSubmitting}
            className={cn(
              "flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-2 text-foreground hover:bg-muted disabled:opacity-50",
              isMobile && "flex-1"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Speichert...
              </>
            ) : (
              "Entwurf speichern"
            )}
          </button>

          <button
            onClick={() => handleSubmit("immediate")}
            disabled={isSubmitting}
            className={cn(
              "flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50",
              isMobile && "flex-1"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Veröffentlicht...
              </>
            ) : (
              "Veröffentlichen"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step6Component;
