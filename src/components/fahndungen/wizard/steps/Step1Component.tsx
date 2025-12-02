"use client";

import React, { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { WandSparkles, Info } from "lucide-react";
import { getCategoryOptions } from "@/types/categories";
import { generateNewCaseNumber } from "@/lib/utils/caseNumberGenerator";
import type { Step1Data, WizardData } from "../types/WizardTypes";
import { useResponsive } from "@/hooks/useResponsive";
import {
  SCENARIO_CONFIG,
  type DemoScenario,
  generateDemoDataForScenario,
} from "@/lib/demo/scenarios";
import {
  OFFICE_OPTIONS,
  DELIKT_OPTIONS_STRAFTATER,
  DELIKT_OPTIONS_SACHEN,
} from "@/lib/data/officeOptions";

interface Step1ComponentProps {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
  wizard?: Partial<WizardData>;
  showValidation?: boolean;
}

const Step1Component: React.FC<Step1ComponentProps> = ({
  data,
  onChange,
  wizard,
  showValidation = false,
}) => {
  const { isMobile, isTablet } = useResponsive();

  // Lokaler State für die Felder - LKA-Anforderungen
  const [localTitle, setLocalTitle] = useState(data.title);
  const [titleTouched, setTitleTouched] = useState(false);
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [localCategory, setLocalCategory] = useState(data.category);
  const [localOffice, setLocalOffice] = useState(data.office ?? "");
  const [localCustomOffice, setLocalCustomOffice] = useState(
    data.customOffice ?? ""
  );
  const [localEventTime, setLocalEventTime] = useState<string>(
    data.eventTime ?? data.caseDate ?? ""
  );
  const [localDelikt, setLocalDelikt] = useState(
    data.delikt ?? data.variant ?? ""
  );
  const [localCaseNumber, setLocalCaseNumber] = useState(data.caseNumber ?? "");

  // Aktuelles Szenario für Button-Highlighting
  const [currentScenario, setCurrentScenario] = useState<DemoScenario | null>(
    null
  );

  // Debounced version of the title
  const debouncedTitle = useDebounce(localTitle, 300);

  // Synchronisiere lokalen State mit data
  useEffect(() => {
    void setLocalTitle(data.title);
  }, [data.title]);

  useEffect(() => {
    void setLocalCategory(data.category);
  }, [data.category]);

  useEffect(() => {
    void setLocalOffice(data.office ?? "");
  }, [data.office]);

  useEffect(() => {
    void setLocalCustomOffice(data.customOffice ?? "");
  }, [data.customOffice]);

  useEffect(() => {
    void setLocalEventTime(data.eventTime ?? data.caseDate ?? "");
  }, [data.eventTime, data.caseDate]);

  useEffect(() => {
    void setLocalDelikt(data.delikt ?? data.variant ?? "");
  }, [data.delikt, data.variant]);

  useEffect(() => {
    void setLocalCaseNumber(data.caseNumber ?? "");
  }, [data.caseNumber]);

  // Aktuelles Szenario basierend auf Kategorie bestimmen
  useEffect(() => {
    const category = data.category;
    if (category === "WANTED_PERSON") {
      setCurrentScenario("straftaeter");
    } else if (category === "MISSING_PERSON") {
      setCurrentScenario("vermisste");
    } else if (category === "UNKNOWN_DEAD") {
      setCurrentScenario("tote");
    } else if (category === "STOLEN_GOODS") {
      setCurrentScenario("sachen");
    } else {
      setCurrentScenario(null);
    }
  }, [data.category]);

  // Propagate debounced title changes
  useEffect(() => {
    if (debouncedTitle !== data.title) {
      void onChange({
        ...data,
        title: debouncedTitle,
        office: data.office ?? localOffice,
        customOffice: data.customOffice ?? localCustomOffice,
        eventTime: data.eventTime ?? localEventTime,
        delikt: data.delikt ?? localDelikt,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTitle]);

  const generateCaseNumber = (category: string): string => {
    return generateNewCaseNumber(category as Step1Data["category"], "draft");
  };

  const handleCategoryChange = (category: string) => {
    const newCaseNumber = generateCaseNumber(category);
    void setLocalCategory(category as Step1Data["category"]);
    void setLocalCaseNumber(newCaseNumber);
    void setLocalDelikt(""); // Reset Delikt bei Kategoriewechsel
    onChange({
      ...data,
      category: category as Step1Data["category"],
      caseNumber: newCaseNumber,
      delikt: "", // Reset Delikt bei Kategoriewechsel
      variant: "", // Legacy
      office: data.office ?? localOffice,
      customOffice: data.customOffice ?? localCustomOffice,
      eventTime: data.eventTime ?? localEventTime,
    });
  };

  // Validierung
  const isTitleInvalid =
    (showValidation || titleTouched) &&
    (localTitle.length < 5 || localTitle.length > 100);
  const isCategoryInvalid =
    (showValidation || categoryTouched) && !localCategory;
  const isOfficeInvalid = showValidation && !localOffice;
  const isCustomOfficeInvalid =
    showValidation &&
    localOffice === "Andere Dienststelle" &&
    !localCustomOffice;
  const isEventTimeInvalid = showValidation && !localEventTime;
  const isDeliktInvalid =
    showValidation &&
    (localCategory === "WANTED_PERSON" || localCategory === "STOLEN_GOODS") &&
    !localDelikt;

  return (
    <div
      className={`mx-auto max-w-4xl ${isMobile ? "space-y-4 px-4" : isTablet ? "space-y-5 px-6" : "space-y-6"}`}
    >
      {/* Header mit responsivem Design */}
      <div className="text-center sm:text-left">
        <h2
          className={`mb-2 font-semibold text-muted-foreground dark:text-white ${
            isMobile ? "text-xl" : "text-2xl"
          }`}
        >
          Schritt 1: Grundinformationen
        </h2>
        <p className="text-sm text-slate-500 dark:text-muted-foreground">
          Legen Sie die grundlegenden Informationen für die Fahndung fest.
        </p>
      </div>

      {/* Responsive Demo-Szenarien-Auswahl */}
      <div
        className={`rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 dark:border-blue-800 dark:from-blue-900/50 dark:to-blue-800/50 ${
          isMobile ? "p-3" : "p-4"
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <WandSparkles
              className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} flex-shrink-0 text-blue-600 dark:text-blue-400`}
            />
            <span
              className={`${isMobile ? "text-xs" : "text-sm"} font-semibold text-blue-900 dark:text-blue-100`}
            >
              Schnellstart: Szenario auswählen
            </span>
          </div>

          {/* Responsive Button-Grid - Nur 4 Szenarien */}
          <div
            className={
              isMobile ? "grid grid-cols-2 gap-2" : "flex flex-wrap gap-3"
            }
          >
            {(
              ["straftaeter", "vermisste", "tote", "sachen"] as DemoScenario[]
            ).map((key) => {
              const config = SCENARIO_CONFIG[key];
              const isActive = currentScenario === key;
              return (
                <button
                  key={key}
                  onClick={async () => {
                    try {
                      // Einfacher Context für Demo-Daten erstellen
                      const now = new Date();
                      const context = {
                        city: data.office || "Stuttgart",
                        dienststelle: data.office || "Stuttgart",
                        date: now.toISOString().slice(0, 10),
                        time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
                        caseNumber: data.caseNumber || "",
                        amount: "1000",
                        age: "35",
                        height: "180",
                        build: "schlanke",
                        clothing: "dunkle Jacke, Jeans",
                        itemBrand: "",
                        model: "",
                        serial: "",
                        color: "",
                        features: "",
                        hintUrl: "https://hinweisportal.polizei-bw.de",
                        phone: "0711 899-0000",
                        email: "hinweise@polizei-bw.de",
                        locationDetail: "Innenstadt",
                        tattoo: "Herz",
                        personName: "Unbekannte Person",
                        pronoun: "die Person",
                      };

                      // Demo-Daten für das ausgewählte Szenario generieren
                      const demoData = generateDemoDataForScenario(
                        key,
                        wizard ?? {},
                        context
                      );

                      // Szenario-Konfiguration abrufen
                      const scenarioConfig = SCENARIO_CONFIG[key];

                      // Lokale States aktualisieren
                      void setLocalTitle(demoData.title);
                      void setLocalCategory(scenarioConfig.category);
                      void setLocalOffice(
                        "Landeskriminalamt Baden-Württemberg"
                      );
                      void setLocalCustomOffice("");
                      void setLocalEventTime(context.date);
                      void setLocalDelikt(scenarioConfig.variants[0] ?? "");
                      void setLocalCaseNumber(
                        generateCaseNumber(scenarioConfig.category)
                      );

                      // Parent onChange aufrufen
                      onChange({
                        ...data,
                        title: demoData.title,
                        category: scenarioConfig.category,
                        office: "Landeskriminalamt Baden-Württemberg",
                        customOffice: "",
                        eventTime: context.date,
                        delikt: scenarioConfig.variants[0] ?? "",
                        variant: scenarioConfig.variants[0] ?? "", // Legacy
                        caseNumber: generateCaseNumber(scenarioConfig.category),
                      });
                    } catch (error) {
                      console.error(
                        `Fehler beim Generieren der Demo-Daten für Szenario ${key}:`,
                        error
                      );
                    }
                  }}
                  className={`rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation ${
                    isMobile
                      ? "min-h-[44px] px-2.5 py-2 text-xs"
                      : "px-3 py-2 text-xs"
                  } ${
                    isActive
                      ? "bg-green-600 text-white shadow-lg ring-2 ring-green-400"
                      : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                  }`}
                  title={`${config.name} Szenario - ${config.variants.length} Varianten verfügbar`}
                  aria-label={`${config.name} Szenario auswählen`}
                >
                  {config.name}
                </button>
              );
            })}
          </div>
        </div>

        {currentScenario && (
          <div className="mt-3 rounded-lg bg-blue-100 p-2 dark:bg-blue-800/30">
            <p className="text-center text-xs text-blue-700 dark:text-blue-300">
              <strong>Aktuelles Szenario:</strong>{" "}
              {SCENARIO_CONFIG[currentScenario]?.name ?? ""} (
              {SCENARIO_CONFIG[currentScenario]?.variants.length ?? 0} Varianten
              verfügbar)
            </p>
          </div>
        )}
      </div>

      {/* Formularfelder - Einspaltig */}
      <div className={isMobile ? "space-y-4" : "space-y-6"}>
        {/* 1. Kategorie */}
        <div className={isMobile ? "space-y-1.5" : "space-y-2"}>
          <label
            htmlFor="category-select"
            className={`block font-semibold text-muted-foreground dark:text-muted-foreground ${
              isMobile ? "text-xs" : "text-sm"
            } ${isCategoryInvalid ? "text-red-600 dark:text-red-400" : ""}`}
          >
            1. Kategorie *
            {isCategoryInvalid && (
              <span className="ml-2 inline-block animate-pulse rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                Pflichtfeld
              </span>
            )}
          </label>
          <p className="text-sm text-slate-500 dark:text-muted-foreground">
            Bitte eine passende Kategorie auswählen.
          </p>
          <select
            id="category-select"
            value={localCategory || ""}
            onChange={(e) => {
              if (!categoryTouched) setCategoryTouched(true);
              void handleCategoryChange(e.target.value);
            }}
            required
            aria-label="Kategorie auswählen"
            aria-invalid={isCategoryInvalid}
            aria-describedby={isCategoryInvalid ? "category-error" : undefined}
            className={`w-full rounded-lg border border-slate-200 bg-background text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white ${
              isMobile ? "h-12 px-3" : "h-11 px-4"
            } ${
              isCategoryInvalid
                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                : ""
            }`}
          >
            <option value="">Bitte Kategorie auswählen …</option>
            {getCategoryOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {isCategoryInvalid && (
            <p
              id="category-error"
              className="text-xs text-red-600 dark:text-red-400"
              role="alert"
              aria-live="polite"
            >
              Bitte eine Kategorie auswählen
            </p>
          )}
        </div>

        {/* 2. Polizeipräsidium / Dienststelle */}
        <div className="space-y-2">
          <label
            htmlFor="office-select"
            className={`block text-sm font-semibold text-muted-foreground dark:text-muted-foreground ${
              isOfficeInvalid ? "text-red-600 dark:text-red-400" : ""
            }`}
          >
            2. Polizeipräsidium / Dienststelle *
            {isOfficeInvalid && (
              <span className="ml-2 inline-block animate-pulse rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                Pflichtfeld
              </span>
            )}
          </label>
          <select
            id="office-select"
            value={localOffice}
            onChange={(e) => {
              void setLocalOffice(e.target.value);
              void setLocalCustomOffice(""); // Reset customOffice wenn sich office ändert
              onChange({
                ...data,
                office: e.target.value,
                customOffice:
                  e.target.value === "Andere Dienststelle"
                    ? data.customOffice
                    : "",
              });
            }}
            required
            aria-label="Polizeipräsidium oder Dienststelle auswählen"
            aria-invalid={isOfficeInvalid}
            aria-describedby={isOfficeInvalid ? "office-error" : undefined}
            className={`w-full rounded-lg border border-slate-200 bg-background text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white ${
              isMobile ? "h-12 px-3" : "h-11 px-4"
            } ${
              isOfficeInvalid
                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                : ""
            }`}
          >
            <option value="">Bitte Dienststelle auswählen …</option>
            {OFFICE_OPTIONS.filter(
              (option) => option !== "Bitte Dienststelle auswählen …"
            ).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {isOfficeInvalid && (
            <p
              id="office-error"
              className="text-xs text-red-600 dark:text-red-400"
              role="alert"
              aria-live="polite"
            >
              Bitte Dienststelle auswählen
            </p>
          )}
          {/* Conditional: Freitext bei "Andere Dienststelle" */}
          {localOffice === "Andere Dienststelle" && (
            <div className="mt-2 space-y-2">
              <label
                htmlFor="custom-office-input"
                className={`block text-sm font-semibold text-muted-foreground dark:text-muted-foreground ${
                  isCustomOfficeInvalid ? "text-red-600 dark:text-red-400" : ""
                }`}
              >
                Freies Textfeld zur Erklärung von &quot;Andere
                Dienststelle&quot; *
              </label>
              <input
                id="custom-office-input"
                type="text"
                value={localCustomOffice}
                onChange={(e) => {
                  void setLocalCustomOffice(e.target.value);
                  onChange({ ...data, customOffice: e.target.value });
                }}
                placeholder="z. B. Polizeidirektion XY"
                required
                aria-label="Freies Textfeld zur Erklärung von Andere Dienststelle"
                aria-invalid={isCustomOfficeInvalid}
                aria-describedby={
                  isCustomOfficeInvalid ? "custom-office-error" : undefined
                }
                className={`w-full rounded-lg border border-slate-200 bg-background text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white ${
                  isMobile ? "h-12 px-3" : "h-11 px-4"
                } ${
                  isCustomOfficeInvalid
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
              />
              {isCustomOfficeInvalid && (
                <p
                  id="custom-office-error"
                  className="text-xs text-red-600 dark:text-red-400"
                  role="alert"
                  aria-live="polite"
                >
                  Bitte Dienststelle angeben
                </p>
              )}
            </div>
          )}
        </div>

        {/* 3. Ereigniszeit */}
        <div className="space-y-2">
          <label
            htmlFor="event-time-input"
            className={`block text-sm font-semibold text-muted-foreground dark:text-muted-foreground ${
              isEventTimeInvalid ? "text-red-600 dark:text-red-400" : ""
            }`}
          >
            3. Ereigniszeit *
            {isEventTimeInvalid && (
              <span className="ml-2 inline-block animate-pulse rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                Pflichtfeld
              </span>
            )}
          </label>
          <input
            id="event-time-input"
            type="date"
            value={localEventTime}
            onChange={(e) => {
              void setLocalEventTime(e.target.value);
              onChange({
                ...data,
                eventTime: e.target.value,
                caseDate: e.target.value, // Legacy
              });
            }}
            required
            aria-label="Ereigniszeit auswählen"
            aria-invalid={isEventTimeInvalid}
            aria-describedby={
              isEventTimeInvalid ? "event-time-error" : undefined
            }
            className={`w-full rounded-lg border border-slate-200 bg-background text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white ${
              isMobile ? "h-12 px-3" : "h-11 px-4"
            } ${
              isEventTimeInvalid
                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                : ""
            }`}
          />
          {isEventTimeInvalid && (
            <p
              id="event-time-error"
              className="text-xs text-red-600 dark:text-red-400"
              role="alert"
              aria-live="polite"
            >
              Bitte Ereigniszeit angeben
            </p>
          )}
        </div>

        {/* 4. Delikt (conditional) - Nur bei Straftäter oder Sachen/Gegenstände */}
        {(localCategory === "WANTED_PERSON" ||
          localCategory === "STOLEN_GOODS") && (
          <div className="space-y-2">
            <label
              htmlFor="delikt-select"
              className={`block text-sm font-semibold text-muted-foreground dark:text-muted-foreground ${
                isDeliktInvalid ? "text-red-600 dark:text-red-400" : ""
              }`}
            >
              4. Delikt *
              {isDeliktInvalid && (
                <span className="ml-2 inline-block animate-pulse rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  Pflichtfeld
                </span>
              )}
            </label>
            <select
              id="delikt-select"
              value={localDelikt}
              onChange={(e) => {
                void setLocalDelikt(e.target.value);
                onChange({
                  ...data,
                  delikt: e.target.value,
                  variant: e.target.value, // Legacy
                });
              }}
              required
              aria-label="Delikt auswählen"
              aria-invalid={isDeliktInvalid}
              aria-describedby={isDeliktInvalid ? "delikt-error" : undefined}
              className={`w-full rounded-lg border border-slate-200 bg-background text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white ${
                isMobile ? "h-12 px-3" : "h-11 px-4"
              } ${
                isDeliktInvalid
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
            >
              <option value="">Bitte Delikt auswählen …</option>
              {localCategory === "WANTED_PERSON" &&
                DELIKT_OPTIONS_STRAFTATER.filter(
                  (option) => option !== "Bitte Delikt auswählen …"
                ).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              {localCategory === "STOLEN_GOODS" &&
                DELIKT_OPTIONS_SACHEN.filter(
                  (option) => option !== "Bitte Delikt auswählen …"
                ).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
            </select>
            {isDeliktInvalid && (
              <p
                id="delikt-error"
                className="text-xs text-red-600 dark:text-red-400"
                role="alert"
                aria-live="polite"
              >
                Bitte Delikt auswählen
              </p>
            )}
          </div>
        )}

        {/* 5. Titel der Fahndung */}
        <div className="space-y-2">
          <label
            htmlFor="title-input"
            className={`block text-sm font-semibold text-muted-foreground dark:text-muted-foreground ${
              isTitleInvalid ? "text-red-600 dark:text-red-400" : ""
            }`}
          >
            5. Titel der Fahndung *
            {isTitleInvalid && (
              <span className="ml-2 inline-block animate-pulse rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                Pflichtfeld
              </span>
            )}
          </label>
          <input
            id="title-input"
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={() => setTitleTouched(true)}
            required
            aria-label="Titel der Fahndung"
            aria-invalid={isTitleInvalid}
            aria-describedby={isTitleInvalid ? "title-error" : undefined}
            maxLength={100}
            className={`w-full rounded-lg border border-slate-200 bg-background text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white ${
              isMobile ? "h-12 px-3" : "h-11 px-4"
            } ${
              isTitleInvalid
                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                : ""
            }`}
            placeholder="z.B. Vermisste - Maria Schmidt"
          />
          {isTitleInvalid && (
            <p
              id="title-error"
              className="text-xs text-red-600 dark:text-red-400"
              role="alert"
              aria-live="polite"
            >
              Titel muss 5–100 Zeichen lang sein
            </p>
          )}
        </div>

        {/* 6. Aktenzeichen - Editierbar */}
        <div className="space-y-2">
          <label
            htmlFor="case-number-input"
            className="block text-sm font-semibold text-muted-foreground dark:text-muted-foreground"
          >
            Aktenzeichen
          </label>
          <input
            id="case-number-input"
            type="text"
            value={localCaseNumber || data.caseNumber || ""}
            onChange={(e) => {
              void setLocalCaseNumber(e.target.value);
              onChange({ ...data, caseNumber: e.target.value });
            }}
            aria-label="Aktenzeichen"
            placeholder="Wird automatisch erstellt"
            className={`w-full rounded-lg border border-slate-200 bg-background font-mono text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white ${
              isMobile ? "h-12 px-3" : "h-11 px-4"
            }`}
          />
          <div className="flex gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/30">
            <Info className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Nur im Intranet sichtbar. Kann manuell angepasst werden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1Component;
