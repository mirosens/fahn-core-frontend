"use client";

import React, { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { WandSparkles } from "lucide-react";
import {
  generateDemoSachverhalt,
  generateDemoPersonenbeschreibung,
  generateStep2NewFieldsData,
} from "@/lib/demo/autofill";
import type { Step2Data, WizardData } from "../types/WizardTypes";
import { useResponsive } from "@/hooks/useResponsive";

interface Step2ComponentProps {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
  wizard?: Partial<WizardData>;
  showValidation?: boolean;
}

const Step2Component: React.FC<Step2ComponentProps> = ({
  data,
  onChange,
  wizard,
  showValidation = false,
}) => {
  const { isMobile, isTablet } = useResponsive();

  // Lokale States für die beiden Textfelder
  const [localSachverhalt, setLocalSachverhalt] = useState(
    data.sachverhalt ?? ""
  );
  const [localPersonenbeschreibung, setLocalPersonenbeschreibung] = useState(
    data.personenbeschreibung ?? ""
  );

  // Debounced values to reduce frequent state updates while typing
  const debouncedSachverhalt = useDebounce(localSachverhalt, 300);
  const debouncedPersonenbeschreibung = useDebounce(
    localPersonenbeschreibung,
    300
  );

  // Validierung
  const isSachverhaltInvalid = showValidation && localSachverhalt.length < 10;
  // Personenbeschreibung ist jetzt optional - keine Validierung mehr
  const isPersonenbeschreibungInvalid = false;

  // Synchronisiere mit externen Änderungen
  useEffect(() => {
    void setLocalSachverhalt(data.sachverhalt ?? "");
  }, [data.sachverhalt]);

  useEffect(() => {
    void setLocalPersonenbeschreibung(data.personenbeschreibung ?? "");
  }, [data.personenbeschreibung]);

  // Propagate debounced field values to the wizard state
  useEffect(() => {
    if (
      debouncedSachverhalt !== (data.sachverhalt ?? "") ||
      debouncedPersonenbeschreibung !== (data.personenbeschreibung ?? "")
    ) {
      onChange({
        ...data,
        sachverhalt: debouncedSachverhalt,
        personenbeschreibung: debouncedPersonenbeschreibung,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSachverhalt, debouncedPersonenbeschreibung]);

  return (
    <div
      className={`mx-auto max-w-4xl ${isMobile ? "space-y-4 px-4" : isTablet ? "space-y-5 px-6" : "space-y-6"}`}
    >
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2
          className={`mb-2 font-semibold text-muted-foreground dark:text-white ${
            isMobile ? "text-xl" : "text-2xl"
          }`}
        >
          Schritt 2: Beschreibung
        </h2>
        <p className="text-sm text-slate-500 dark:text-muted-foreground">
          Beschreiben Sie den Sachverhalt und – falls vorhanden – die Person.
        </p>
      </div>

      {/* Schnellstart: Auto-Ausfüllen für beide Felder */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 dark:border-blue-800 dark:from-blue-900/50 dark:to-blue-800/50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <WandSparkles
              className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} flex-shrink-0 text-blue-600 dark:text-blue-400`}
            />
            <span
              className={`${isMobile ? "text-xs" : "text-sm"} font-semibold text-blue-900 dark:text-blue-100`}
            >
              Schnellstart: Beide Felder automatisch ausfüllen
            </span>
          </div>
          <button
            onClick={async () => {
              try {
                const demoData = await generateStep2NewFieldsData({
                  ...(wizard ?? {}),
                  step1: wizard?.step1,
                  step2: data,
                });
                void setLocalSachverhalt(demoData.sachverhalt);
                void setLocalPersonenbeschreibung(
                  demoData.personenbeschreibung
                );
                onChange({
                  ...data,
                  sachverhalt: demoData.sachverhalt,
                  personenbeschreibung: demoData.personenbeschreibung,
                });
              } catch (error) {
                console.error("Fehler beim Auto-Ausfüllen:", error);
              }
            }}
            className={`rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isMobile ? "w-full" : ""
            }`}
          >
            Beide ausfüllen
          </button>
        </div>
      </div>

      {/* Hinweis-/Tipps-Box */}
      <div
        role="note"
        className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/30"
      >
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          Hinweise
        </h3>
        <p className="text-xs text-blue-800 dark:text-blue-200">
          Tipps für gute Beschreibungen
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-900 dark:text-blue-300">
          <li>Seien Sie präzise und sachlich</li>
          <li>Verwenden Sie klare und verständliche Sprache</li>
          <li>Fügen Sie relevante Details hinzu</li>
          <li>Vermeiden Sie Spekulationen</li>
        </ul>
      </div>

      {/* Formularfelder - Einspaltig */}
      <div className={isMobile ? "space-y-5" : "space-y-6"}>
        {/* 1. Sachverhalt */}
        <div className="space-y-2">
          <label
            htmlFor="sachverhalt-textarea"
            className={`block text-sm font-semibold text-muted-foreground dark:text-muted-foreground ${
              isSachverhaltInvalid ? "text-red-600 dark:text-red-400" : ""
            }`}
          >
            Sachverhalt *
            {isSachverhaltInvalid && (
              <span className="ml-2 inline-block animate-pulse rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                Pflichtfeld
              </span>
            )}
          </label>
          <p className="text-sm text-slate-500 dark:text-muted-foreground">
            Schildern Sie den Tathergang bzw. die Situation (mindestens 10
            Zeichen).
          </p>
          <div className="relative">
            <textarea
              id="sachverhalt-textarea"
              value={localSachverhalt}
              onChange={(e) => setLocalSachverhalt(e.target.value)}
              className={`min-h-[160px] w-full rounded-lg border px-4 py-3 pr-10 text-sm transition-all duration-200 focus:outline-none focus:ring-2 dark:bg-muted dark:text-white ${
                isSachverhaltInvalid
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                  : "border-slate-200 focus:ring-blue-500 dark:border-border"
              }`}
              placeholder="Schildern Sie den Tathergang bzw. die Situation..."
              rows={8}
              required
              aria-invalid={isSachverhaltInvalid}
              aria-describedby={
                isSachverhaltInvalid ? "sachverhalt-error" : undefined
              }
            />
            <button
              type="button"
              aria-label="Demo füllen"
              className="absolute right-2 top-2 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
              onClick={async () => {
                try {
                  const demo = await generateDemoSachverhalt({
                    ...(wizard ?? {}),
                    step2: {
                      ...data,
                      sachverhalt: localSachverhalt,
                    },
                  });
                  void setLocalSachverhalt(demo);
                } catch (error) {
                  console.error("Fehler beim Auto-Ausfüllen:", error);
                }
              }}
            >
              Auto
            </button>
          </div>
          {isSachverhaltInvalid && (
            <p
              id="sachverhalt-error"
              className="text-xs text-red-600 dark:text-red-400"
              role="alert"
              aria-live="polite"
            >
              Sachverhalt muss mindestens 10 Zeichen lang sein
            </p>
          )}
        </div>

        {/* 2. Personenbeschreibung - jetzt optional */}
        <div className="space-y-2">
          <label
            htmlFor="personenbeschreibung-textarea"
            className={`block text-sm font-semibold text-muted-foreground dark:text-muted-foreground ${
              isPersonenbeschreibungInvalid
                ? "text-red-600 dark:text-red-400"
                : ""
            }`}
          >
            Personenbeschreibung
          </label>
          <p className="text-sm text-slate-500 dark:text-muted-foreground">
            Beschreiben Sie Aussehen, besondere Merkmale oder Kleidung, sofern
            bekannt (optional).
          </p>
          <div className="relative">
            <textarea
              id="personenbeschreibung-textarea"
              value={localPersonenbeschreibung}
              onChange={(e) => setLocalPersonenbeschreibung(e.target.value)}
              className={`min-h-[160px] w-full rounded-lg border px-4 py-3 pr-10 text-sm transition-all duration-200 focus:outline-none focus:ring-2 dark:bg-muted dark:text-white ${
                isPersonenbeschreibungInvalid
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                  : "border-slate-200 focus:ring-blue-500 dark:border-border"
              }`}
              placeholder="Beschreiben Sie Aussehen, besondere Merkmale oder Kleidung..."
              rows={8}
              aria-invalid={isPersonenbeschreibungInvalid}
              aria-describedby={
                isPersonenbeschreibungInvalid
                  ? "personenbeschreibung-error"
                  : undefined
              }
            />
            <button
              type="button"
              aria-label="Demo füllen"
              className="absolute right-2 top-2 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
              onClick={async () => {
                try {
                  const demo = await generateDemoPersonenbeschreibung({
                    ...(wizard ?? {}),
                    step2: {
                      ...data,
                      personenbeschreibung: localPersonenbeschreibung,
                    },
                  });
                  void setLocalPersonenbeschreibung(demo);
                } catch (error) {
                  console.error("Fehler beim Auto-Ausfüllen:", error);
                }
              }}
            >
              Auto
            </button>
          </div>
          {/* Personenbeschreibung ist jetzt optional - keine Fehlermeldung mehr */}
        </div>
      </div>
    </div>
  );
};

export default Step2Component;
