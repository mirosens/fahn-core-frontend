"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  Building,
  WandSparkles,
  Info,
  Star,
  Calendar,
  AlertCircle,
} from "lucide-react";
import {
  generateDemoContactPerson,
  generateDemoContactPhone,
  generateDemoContactEmail,
  generateDemoDepartment,
} from "@/lib/demo/autofill";
import type { Step5Data, WizardData } from "../types/WizardTypes";
import { useResponsive } from "@/hooks/useResponsive";
import { cn } from "@/lib/utils";

interface Step5ComponentProps {
  data: Step5Data;
  onChange: (data: Step5Data) => void;
  wizard?: Partial<WizardData>;
  showValidation?: boolean;
}

const Step5Component: React.FC<Step5ComponentProps> = ({
  data,
  onChange,
  wizard,
  showValidation = false,
}) => {
  const { isMobile, isTablet } = useResponsive();

  // 🚀 DEMO-MODUS: Für Demo-Zwecke erlauben wir allen Usern Hero-Settings zu bearbeiten
  // In Produktion sollte dies nur für Admin/Super-Admin erlaubt sein
  const DEMO_MODE = true; // Setze auf false für Produktion
  const canEditHeroSettings = DEMO_MODE; // Vereinfacht für jetzt

  // Local state for all contact fields
  const [localContactPerson, setLocalContactPerson] = useState<string>(
    data.contactPerson ?? ""
  );
  const [localContactPhone, setLocalContactPhone] = useState<string>(
    data.contactPhone ?? ""
  );
  const [localContactEmail, setLocalContactEmail] = useState<string>(
    data.contactEmail ?? ""
  );
  const [localOrganizationalUnit, setLocalOrganizationalUnit] =
    useState<string>(data.organizationalUnit ?? data.department ?? "");

  // State for publication settings
  const [scheduledDate, setScheduledDate] = useState<string>(
    data.scheduledDate ?? ""
  );
  const [deletionDate, setDeletionDate] = useState<string>(
    data.deletionDate ?? ""
  );
  const [reminderDate, setReminderDate] = useState<string>(
    data.reminderDate ?? ""
  );
  const [reminderEmail, setReminderEmail] = useState<string>(
    data.reminderEmail ?? ""
  );

  // Hero-Settings initialisieren
  const heroSettings: NonNullable<Step5Data["heroSettings"]> =
    data.heroSettings ?? {
      enabled: false,
      position: 1 as const,
      displayMode: "unlimited" as const,
    };

  // Sync with external changes
  useEffect(() => {
    if (data.contactPerson && typeof data.contactPerson === "string") {
      setLocalContactPerson(data.contactPerson);
    }
    if (data.contactPhone && typeof data.contactPhone === "string") {
      setLocalContactPhone(data.contactPhone);
    }
    if (data.contactEmail && typeof data.contactEmail === "string") {
      setLocalContactEmail(data.contactEmail);
    }
    const orgUnit = data.organizationalUnit ?? data.department ?? "";
    setLocalOrganizationalUnit(orgUnit);
    const schedDate = data.scheduledDate ?? "";
    setScheduledDate(schedDate);
    const delDate = data.deletionDate ?? "";
    setDeletionDate(delDate);
    const remDate = data.reminderDate ?? "";
    setReminderDate(remDate);
    const remEmail = data.reminderEmail ?? "";
    setReminderEmail(remEmail);
  }, [
    data.contactPerson,
    data.contactPhone,
    data.contactEmail,
    data.organizationalUnit,
    data.department,
    data.scheduledDate,
    data.deletionDate,
    data.reminderDate,
    data.reminderEmail,
  ]);

  // Immediate synchronization on changes
  const handleContactPersonChange = (value: string) => {
    setLocalContactPerson(value);
    onChange({
      ...data,
      contactPerson: value,
    });
  };

  const handleContactPhoneChange = (value: string) => {
    setLocalContactPhone(value);
    onChange({
      ...data,
      contactPhone: value,
    });
  };

  const handleContactEmailChange = (value: string) => {
    setLocalContactEmail(value);
    onChange({
      ...data,
      contactEmail: value,
    });
  };

  const handleOrganizationalUnitChange = (value: string) => {
    setLocalOrganizationalUnit(value);
    onChange({
      ...data,
      organizationalUnit: value,
    });
  };

  // Automatic calculation: Deletion date = Publication + 6 months
  useEffect(() => {
    if (data.publishStatus === "immediate" && !deletionDate) {
      const sixMonthsLater = new Date();
      sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
      const dateStr = sixMonthsLater.toISOString().split("T")[0] ?? "";
      setDeletionDate(dateStr);
      onChange({
        ...data,
        deletionDate: dateStr,
      });
    } else if (
      scheduledDate &&
      typeof scheduledDate === "string" &&
      scheduledDate.length > 0 &&
      !deletionDate
    ) {
      const publishDate = new Date(scheduledDate);
      if (!isNaN(publishDate.getTime())) {
        const sixMonthsLater = new Date(publishDate);
        sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
        const dateStr = sixMonthsLater.toISOString().split("T")[0] ?? "";
        setDeletionDate(dateStr);
        onChange({
          ...data,
          deletionDate: dateStr,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.publishStatus, scheduledDate, deletionDate]);

  // Automatic calculation: Reminder date = Deletion date - 7 days
  useEffect(() => {
    if (
      deletionDate &&
      typeof deletionDate === "string" &&
      deletionDate.length > 0 &&
      !reminderDate
    ) {
      const deletion = new Date(deletionDate);
      if (!isNaN(deletion.getTime())) {
        const oneWeekBefore = new Date(deletion);
        oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);
        const dateStr = oneWeekBefore.toISOString().split("T")[0] ?? "";
        setReminderDate(dateStr);
        onChange({
          ...data,
          reminderDate: dateStr,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletionDate, reminderDate]);

  // Auto-fill: Use email from contact data
  useEffect(() => {
    if (data.contactEmail && !reminderEmail) {
      setReminderEmail(data.contactEmail);
      onChange({
        ...data,
        reminderEmail: data.contactEmail,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.contactEmail, reminderEmail]);

  const updateNotifications = (
    key: keyof Step5Data["notifications"],
    value: boolean
  ) => {
    onChange({
      ...data,
      notifications: {
        ...data.notifications,
        [key]: value,
      },
    });
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
            "font-semibold text-foreground",
            isMobile ? "text-xl mb-1" : "text-2xl mb-2"
          )}
        >
          Kontakt und Veröffentlichung
        </h2>
        <p
          className={cn(
            "text-muted-foreground",
            isMobile ? "text-xs" : "text-sm"
          )}
        >
          Definieren Sie Kontaktdaten und Veröffentlichungseinstellungen für das
          Intranet
        </p>
      </div>

      {/* Schnellstart: Alle Felder ausfüllen */}
      <div
        className={cn(
          "rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900",
          isMobile ? "p-3" : "p-4"
        )}
      >
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
              Schnellstart: Alle Kontaktdaten & Einstellungen
            </span>
          </div>
          <button
            onClick={() => {
              const step1Data = wizard?.step1;
              const category = (step1Data?.category ?? "MISSING_PERSON") as
                | "WANTED_PERSON"
                | "MISSING_PERSON"
                | "UNKNOWN_DEAD"
                | "STOLEN_GOODS";

              const contactPerson = generateDemoContactPerson({
                ...(wizard ?? {}),
                step1: step1Data,
                step5: data,
              });
              const contactPhone = generateDemoContactPhone({
                ...(wizard ?? {}),
                step1: step1Data,
                step5: data,
              });
              const contactEmail = generateDemoContactEmail({
                ...(wizard ?? {}),
                step1: step1Data,
                step5: data,
              });
              const finalOrganizationalUnit = generateDemoDepartment({
                ...(wizard ?? {}),
                step1: step1Data,
                step5: data,
              });

              const publishStatus: Step5Data["publishStatus"] = "draft";
              const urgencyLevel: Step5Data["urgencyLevel"] = "medium";

              const visibility = {
                internal: true,
                regional: false,
                national: category === "MISSING_PERSON",
                international: category === "WANTED_PERSON",
              };

              const notifications = {
                emailAlerts: true,
                smsAlerts: false,
                appNotifications: true,
                pressRelease: false,
              };

              const sixMonthsLater = new Date();
              sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
              const deletionDateStr =
                sixMonthsLater.toISOString().split("T")[0] ?? "";

              let reminderDateStr = "";
              if (deletionDateStr && deletionDateStr.length > 0) {
                const oneWeekBefore = new Date(deletionDateStr);
                if (!isNaN(oneWeekBefore.getTime())) {
                  oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);
                  reminderDateStr =
                    oneWeekBefore.toISOString().split("T")[0] ?? "";
                }
              }

              handleContactPersonChange(contactPerson);
              handleContactPhoneChange(contactPhone);
              handleContactEmailChange(contactEmail);
              handleOrganizationalUnitChange(finalOrganizationalUnit);

              onChange({
                ...data,
                contactPerson,
                contactPhone,
                contactEmail,
                organizationalUnit: finalOrganizationalUnit,
                publishStatus,
                urgencyLevel,
                visibility,
                notifications,
                deletionDate: deletionDateStr,
                reminderDate: reminderDateStr,
                reminderEmail: contactEmail,
              });
            }}
            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
          >
            Ausfüllen
          </button>
        </div>
      </div>

      {/* Hinweise-Box */}
      <div
        className={cn(
          "rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/30",
          isMobile ? "p-3" : "p-4"
        )}
      >
        <div className="flex items-start gap-3">
          <Info
            className={cn(
              "mt-0.5 shrink-0 text-blue-600 dark:text-blue-400",
              isMobile ? "h-4 w-4" : "h-5 w-5"
            )}
          />
          <div className="flex-1">
            <h3
              className={cn(
                "font-semibold text-blue-900 dark:text-blue-100",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              Hinweise
            </h3>
            <ul
              className={cn(
                "mt-2 list-inside list-disc space-y-1 text-blue-900 dark:text-blue-300",
                isMobile ? "text-xs space-y-0.5" : "text-sm"
              )}
            >
              <li>
                <strong>Entwurf:</strong> Nur für interne Bearbeitung sichtbar
              </li>
              <li>
                <strong>Zur Überprüfung:</strong> Wartet auf Freigabe
              </li>
              <li>
                <strong>Geplant:</strong> Wird zu einem bestimmten Zeitpunkt
                veröffentlicht
              </li>
              <li>
                <strong>Sofort:</strong> Wird sofort öffentlich verfügbar
              </li>
              <li className="mt-2 border-t border-blue-200 pt-2 dark:border-blue-700">
                <strong>Workflow:</strong> Die Fahndung wird erst nach
                Überprüfung durch I720 im Intranet veröffentlicht. Sobald eine
                Fahndung ins Portal eingestellt wurde, erhält I720 eine
                automatisierte E-Mail.
              </li>
              <li>
                <strong>Papierkorb:</strong> Wenn Fahndungen depubliziert
                werden, erscheinen diese im Papierkorb. Der Papierkorb wird nach
                30 Tagen gelöscht (nur sichtbar für Superadmins).
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Kontaktdaten */}
      <div
        className={cn(
          "rounded-lg border border-border bg-card p-6 shadow-sm dark:bg-muted",
          isMobile && "p-4"
        )}
      >
        <div
          className={cn(
            "mb-6 flex items-center justify-between border-b border-border pb-4",
            isMobile && "mb-4 flex-col items-start gap-2 border-b pb-3"
          )}
        >
          <h3
            className={cn(
              "font-semibold text-foreground",
              isMobile ? "text-base" : "text-lg"
            )}
          >
            Kontaktdaten
          </h3>
          <span
            className={cn(
              "rounded bg-blue-100 px-2.5 py-1 font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300",
              isMobile ? "text-xs" : "text-xs"
            )}
          >
            Veröffentlichung nur im INTRANET
          </span>
        </div>

        <div
          className={cn(
            "grid gap-6",
            isMobile ? "grid-cols-1 gap-4" : "grid-cols-2 gap-6"
          )}
        >
          <div className={cn("space-y-2", isMobile && "space-y-1.5")}>
            <label
              htmlFor="contact-person"
              className={cn(
                "block font-medium text-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              Ansprechpartner *
            </label>
            <p
              className={cn(
                "text-muted-foreground",
                isMobile ? "text-xs mb-1" : "text-xs mb-2"
              )}
            >
              Pflichtfeld. Mindestens 1 Zeichen (Vor- und Nachname empfohlen).
            </p>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="contact-person"
                type="text"
                value={localContactPerson}
                onChange={(e) => handleContactPersonChange(e.target.value)}
                className={cn(
                  "w-full rounded-lg border pl-10 pr-10 focus:outline-none focus:ring-1 dark:border-border dark:bg-muted dark:text-white",
                  isMobile ? "py-2.5 text-sm" : "py-2",
                  showValidation && (localContactPerson?.length ?? 0) < 1
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                    : "border-border focus:border-blue-500 focus:ring-blue-500"
                )}
                placeholder="z.B. Kriminalhauptkommissar Müller"
                required
              />
              <button
                type="button"
                aria-label="Demo füllen"
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-blue-100 text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800",
                  isMobile ? "px-2.5 py-1.5 text-xs" : "px-2 py-1 text-xs"
                )}
                onClick={() => {
                  const demo = generateDemoContactPerson({
                    ...(wizard ?? {}),
                    step1: wizard?.step1,
                    step5: data,
                  });
                  handleContactPersonChange(demo);
                }}
              >
                Auto
              </button>
            </div>
            {showValidation && (localContactPerson?.length ?? 0) < 1 && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                Kontaktperson erforderlich
              </p>
            )}
          </div>

          <div className={cn("space-y-2", isMobile && "space-y-1.5")}>
            <label
              htmlFor="contact-phone"
              className={cn(
                "block font-medium text-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              Telefonnummer
            </label>
            <p
              className={cn(
                "text-muted-foreground",
                isMobile ? "text-xs mb-1" : "text-xs mb-2"
              )}
            >
              Optional. Gültiges Format, mindestens 7 Ziffern.
            </p>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="contact-phone"
                type="tel"
                value={localContactPhone}
                onChange={(e) => handleContactPhoneChange(e.target.value)}
                className={cn(
                  "w-full rounded-lg border border-border pl-10 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white",
                  isMobile ? "py-2.5 text-sm" : "py-2"
                )}
                placeholder="0711 899-0000"
              />
              <button
                type="button"
                aria-label="Demo füllen"
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-blue-100 text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800",
                  isMobile ? "px-2.5 py-1.5 text-xs" : "px-2 py-1 text-xs"
                )}
                onClick={() => {
                  const demo = generateDemoContactPhone({
                    ...(wizard ?? {}),
                    step1: wizard?.step1,
                    step5: data,
                  });
                  handleContactPhoneChange(demo);
                }}
              >
                Auto
              </button>
            </div>
          </div>

          <div className={cn("space-y-2", isMobile && "space-y-1.5")}>
            <label
              htmlFor="contact-email"
              className={cn(
                "block font-medium text-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              E-Mail-Adresse
            </label>
            <p
              className={cn(
                "text-muted-foreground",
                isMobile ? "text-xs mb-1" : "text-xs mb-2"
              )}
            >
              Optional. Falls angegeben, muss es eine gültige E-Mail sein.
            </p>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="contact-email"
                type="email"
                value={localContactEmail}
                onChange={(e) => handleContactEmailChange(e.target.value)}
                className={cn(
                  "w-full rounded-lg border pl-10 pr-10 focus:outline-none focus:ring-1 dark:border-border dark:bg-muted dark:text-white",
                  isMobile ? "py-2.5 text-sm" : "py-2",
                  showValidation &&
                    localContactEmail &&
                    localContactEmail.length > 0 &&
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localContactEmail)
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                    : "border-border focus:border-blue-500 focus:ring-blue-500"
                )}
                placeholder="kontakt@polizei.de"
              />
              <button
                type="button"
                aria-label="Demo füllen"
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-blue-100 text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800",
                  isMobile ? "px-2.5 py-1.5 text-xs" : "px-2 py-1 text-xs"
                )}
                onClick={() => {
                  const demo = generateDemoContactEmail({
                    ...(wizard ?? {}),
                    step1: wizard?.step1,
                    step5: data,
                  });
                  handleContactEmailChange(demo);
                }}
              >
                Auto
              </button>
            </div>
            {showValidation &&
              localContactEmail &&
              localContactEmail.length > 0 &&
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localContactEmail) && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  Ungültige E-Mail-Adresse
                </p>
              )}
          </div>

          <div className={cn("space-y-2", isMobile && "space-y-1.5")}>
            <label
              htmlFor="organizational-unit-input"
              className={cn(
                "block font-medium text-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              Organisationseinheit *
            </label>
            <p
              className={cn(
                "text-muted-foreground",
                isMobile ? "text-xs mb-1" : "text-xs mb-2"
              )}
            >
              Pflichtfeld. Die Organisationseinheit, die für diese Fahndung
              zuständig ist.
            </p>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="organizational-unit-input"
                type="text"
                value={localOrganizationalUnit}
                onChange={(e) => handleOrganizationalUnitChange(e.target.value)}
                className={cn(
                  "w-full rounded-lg border border-border pl-10 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white",
                  isMobile ? "py-2.5 text-sm" : "py-2"
                )}
                placeholder="z.B. Kriminalpolizei"
              />
              <button
                type="button"
                aria-label="Demo füllen"
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-blue-100 text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800",
                  isMobile ? "px-2.5 py-1.5 text-xs" : "px-2 py-1 text-xs"
                )}
                onClick={() => {
                  const demo = generateDemoDepartment({
                    ...(wizard ?? {}),
                    step1: wizard?.step1,
                    step5: data,
                  });
                  handleOrganizationalUnitChange(demo);
                }}
              >
                Auto
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Veröffentlichungseinstellungen */}
      <div
        className={cn(
          "rounded-lg border border-border bg-card p-6 shadow-sm dark:bg-muted",
          isMobile && "p-4"
        )}
      >
        <div
          className={cn(
            "mb-6 border-b border-border pb-4",
            isMobile && "mb-4 pb-3"
          )}
        >
          <h3
            className={cn(
              "font-semibold text-foreground",
              isMobile ? "text-base" : "text-lg"
            )}
          >
            Einstellungen für Veröffentlichung
          </h3>
        </div>

        <div className={cn("space-y-6", isMobile && "space-y-4")}>
          <div
            className={cn(
              "grid gap-6",
              isMobile ? "grid-cols-1 gap-4" : "grid-cols-2 gap-6"
            )}
          >
            <div className={cn("space-y-2", isMobile && "space-y-1.5")}>
              <label
                htmlFor="publish-status"
                className={cn(
                  "block font-medium text-foreground",
                  isMobile ? "text-xs" : "text-sm"
                )}
              >
                Veröffentlichungsstatus
              </label>
              <div className="relative">
                <select
                  id="publish-status"
                  value={data.publishStatus}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      publishStatus: e.target
                        .value as Step5Data["publishStatus"],
                    })
                  }
                  className={cn(
                    "w-full rounded-lg border border-border pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white",
                    isMobile ? "px-3 py-2.5 text-sm" : "px-3 py-2"
                  )}
                >
                  <option value="draft">Entwurf</option>
                  <option value="review">Zur Überprüfung</option>
                  <option value="scheduled">Geplant</option>
                  <option value="immediate">Sofort veröffentlichen</option>
                </select>
              </div>
              <p
                className={cn(
                  "text-muted-foreground",
                  isMobile ? "text-xs mt-1" : "text-xs mt-1"
                )}
              >
                {data.publishStatus === "draft" &&
                  "Nur für interne Bearbeitung sichtbar"}
                {data.publishStatus === "review" &&
                  "Wartet auf Freigabe durch I720"}
                {data.publishStatus === "scheduled" &&
                  "Wird zu einem bestimmten Zeitpunkt veröffentlicht"}
                {data.publishStatus === "immediate" &&
                  "Wird nach I720-Prüfung sofort veröffentlicht"}
              </p>
            </div>
          </div>

          {/* Geplantes Veröffentlichungsdatum (nur bei "Scheduled") */}
          {data.publishStatus === "scheduled" && (
            <div
              className={cn(
                "rounded-md border border-border bg-muted/30 p-4",
                isMobile && "p-3"
              )}
            >
              <div className={cn("space-y-2", isMobile && "space-y-1.5")}>
                <label
                  htmlFor="scheduled-date"
                  className={cn(
                    "block font-medium text-foreground",
                    isMobile ? "text-xs" : "text-sm"
                  )}
                >
                  Geplantes Veröffentlichungsdatum *
                </label>
                <input
                  id="scheduled-date"
                  type="datetime-local"
                  value={scheduledDate ?? ""}
                  onChange={(e) => {
                    setScheduledDate(e.target.value);
                    onChange({
                      ...data,
                      scheduledDate: e.target.value,
                    });
                  }}
                  className={cn(
                    "mt-1 w-full rounded-md border border-input",
                    isMobile ? "px-3 py-2.5 text-sm" : "px-3 py-2"
                  )}
                />
                <p
                  className={cn(
                    "text-muted-foreground",
                    isMobile ? "text-xs mt-1" : "text-xs mt-1"
                  )}
                >
                  💡 Die Fahndung wird zu diesem Zeitpunkt automatisch
                  veröffentlicht (nach I720-Prüfung)
                </p>
              </div>
            </div>
          )}

          {/* Automatische Verwaltung */}
          <div
            className={cn(
              "rounded-md border border-border bg-muted/30 p-4",
              isMobile && "p-3"
            )}
          >
            <h4
              className={cn(
                "mb-4 font-medium text-foreground",
                isMobile ? "text-xs mb-3" : "text-sm mb-4"
              )}
            >
              Automatische Verwaltung
            </h4>
            <div className={cn("space-y-5", isMobile && "space-y-4")}>
              {/* Löschdatum */}
              <div className={cn("space-y-2", isMobile && "space-y-1.5")}>
                <label
                  htmlFor="deletion-date"
                  className={cn(
                    "block font-medium text-foreground",
                    isMobile ? "text-xs" : "text-sm"
                  )}
                >
                  Löschdatum (automatisch nach 6 Monaten) *
                </label>
                <input
                  id="deletion-date"
                  type="date"
                  value={deletionDate ?? ""}
                  onChange={(e) => {
                    setDeletionDate(e.target.value);
                    onChange({
                      ...data,
                      deletionDate: e.target.value,
                    });
                  }}
                  className="mt-1 w-full rounded-md border border-input px-3 py-2"
                />
                <p
                  className={cn(
                    "text-muted-foreground",
                    isMobile ? "text-xs mt-1" : "text-xs mt-1"
                  )}
                >
                  💡 Standard: 6 Monate nach Veröffentlichung. Kann manuell
                  angepasst werden.
                </p>
              </div>

              {/* Erinnerungsdatum */}
              <div className={cn("space-y-2", isMobile && "space-y-1.5")}>
                <label
                  htmlFor="reminder-date"
                  className={cn(
                    "block font-medium text-foreground",
                    isMobile ? "text-xs" : "text-sm"
                  )}
                >
                  Erinnerungsdatum (1 Woche vor Löschung) *
                </label>
                <input
                  id="reminder-date"
                  type="date"
                  value={reminderDate ?? ""}
                  onChange={(e) => {
                    setReminderDate(e.target.value);
                    onChange({
                      ...data,
                      reminderDate: e.target.value,
                    });
                  }}
                  className="mt-1 w-full rounded-md border border-input px-3 py-2"
                />
                <p
                  className={cn(
                    "text-muted-foreground",
                    isMobile ? "text-xs mt-1" : "text-xs mt-1"
                  )}
                >
                  💡 Standard: 1 Woche vor Löschdatum. Erinnerungs-E-Mail wird
                  automatisch versendet.
                </p>
              </div>

              {/* E-Mail für Erinnerung */}
              <div className={cn("space-y-2", isMobile && "space-y-1.5")}>
                <label
                  htmlFor="reminder-email"
                  className={cn(
                    "block font-medium text-foreground",
                    isMobile ? "text-xs" : "text-sm"
                  )}
                >
                  E-Mail für Erinnerungsmail *
                </label>
                <input
                  id="reminder-email"
                  type="email"
                  value={reminderEmail ?? ""}
                  onChange={(e) => {
                    setReminderEmail(e.target.value);
                    onChange({
                      ...data,
                      reminderEmail: e.target.value,
                    });
                  }}
                  placeholder="beispiel@polizei.bwl.de"
                  className="mt-1 w-full rounded-md border border-input px-3 py-2"
                />
                <p
                  className={cn(
                    "text-muted-foreground",
                    isMobile ? "text-xs mt-1" : "text-xs mt-1"
                  )}
                >
                  💡 An diese Adresse wird 1 Woche vor Löschung eine Erinnerung
                  gesendet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* E-Mail-Benachrichtigung */}
      <div
        className={cn(
          "rounded-lg border border-border bg-card p-6 shadow-sm dark:bg-muted",
          isMobile && "p-4"
        )}
      >
        <div
          className={cn(
            "mb-6 border-b border-border pb-4",
            isMobile && "mb-4 pb-3"
          )}
        >
          <h3
            className={cn(
              "font-semibold text-foreground",
              isMobile ? "text-base" : "text-lg"
            )}
          >
            E-Mail-Benachrichtigung
          </h3>
        </div>
        <div className={cn("space-y-3", isMobile && "space-y-2")}>
          <label
            className={cn(
              "flex items-center space-x-2 rounded-lg border border-border hover:bg-muted dark:border-border dark:hover:bg-muted",
              isMobile ? "p-2 space-x-1.5" : "p-3"
            )}
          >
            <input
              type="checkbox"
              checked={data.notifications?.emailAlerts ?? false}
              onChange={(e) =>
                updateNotifications("emailAlerts", e.target.checked)
              }
              className={cn(
                "text-blue-600 focus:ring-blue-500",
                isMobile ? "h-3.5 w-3.5" : "h-4 w-4"
              )}
            />
            <span
              className={cn(
                "text-muted-foreground dark:text-muted-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              E-Mail-Benachrichtigungen aktivieren
            </span>
          </label>
        </div>
      </div>

      {/* Hero-Section Einstellungen */}
      <div
        className={cn(
          "rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-sm dark:border-blue-800 dark:bg-blue-950/30",
          isMobile && "p-4",
          !canEditHeroSettings && "opacity-60"
        )}
      >
        <div
          className={cn(
            "mb-6 border-b border-blue-200 pb-4 dark:border-blue-800",
            isMobile && "mb-4 pb-3"
          )}
        >
          <div className="flex items-start gap-3">
            <Star
              className={cn(
                "mt-0.5 text-blue-600 dark:text-blue-400",
                isMobile ? "h-4 w-4" : "h-5 w-5"
              )}
            />
            <div className="flex-1">
              <h3
                className={cn(
                  "font-semibold text-blue-900 dark:text-blue-100",
                  isMobile ? "text-base" : "text-lg"
                )}
              >
                Hero-Section Hervorhebung
              </h3>
              <p
                className={cn(
                  "mt-1 text-blue-700 dark:text-blue-300",
                  isMobile ? "text-xs" : "text-sm"
                )}
              >
                Fahndung prominent auf der Startseite anzeigen
                {!canEditHeroSettings && " (nur Admin/I720 kann bearbeiten)"}
              </p>
            </div>
          </div>
          <div className={cn("space-y-6", isMobile && "space-y-4")}>
            {/* Toggle für Hero-Featured */}
            <div>
              <label
                className={cn(
                  "flex items-center gap-3",
                  canEditHeroSettings ? "cursor-pointer" : "cursor-not-allowed"
                )}
              >
                <input
                  type="checkbox"
                  checked={heroSettings.enabled}
                  disabled={!canEditHeroSettings}
                  onChange={(e) => {
                    if (!canEditHeroSettings) return;
                    const enabled = e.target.checked;
                    onChange({
                      ...data,
                      heroSettings: {
                        ...heroSettings,
                        enabled,
                        position: enabled ? heroSettings.position : 1,
                      },
                    });
                  }}
                  className={cn(
                    "rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500",
                    isMobile ? "h-4 w-4" : "h-5 w-5",
                    !canEditHeroSettings && "opacity-50 cursor-not-allowed"
                  )}
                />
                <span
                  className={cn(
                    "font-medium",
                    isMobile ? "text-sm" : "text-base",
                    canEditHeroSettings
                      ? "text-gray-900 dark:text-gray-100"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  In Hero-Section hervorheben{" "}
                  {!canEditHeroSettings && "(nur Admin)"}
                </span>
              </label>
            </div>

            {/* Konditionale Einstellungen wenn enabled */}
            {heroSettings.enabled && (
              <div
                className={cn(
                  "space-y-4 border-l-2 border-blue-300 pl-8 dark:border-blue-700",
                  isMobile && "pl-4 space-y-3",
                  !canEditHeroSettings && "opacity-60"
                )}
              >
                {/* Info: Auto-Kategorie */}
                {(() => {
                  const investigationCategory = wizard?.step1?.category as
                    | "WANTED_PERSON"
                    | "MISSING_PERSON"
                    | "UNKNOWN_DEAD"
                    | "STOLEN_GOODS"
                    | undefined;
                  const heroCategory =
                    investigationCategory === "MISSING_PERSON"
                      ? "missing"
                      : "wanted";
                  const heroCategoryLabel =
                    heroCategory === "missing"
                      ? "Vermisste Personen"
                      : "Gesuchte Straftäter";
                  const heroCategoryPosition =
                    heroCategory === "missing"
                      ? "Linke Spalte"
                      : "Rechte Spalte";
                  const heroCategorySubtitle =
                    heroCategory === "missing"
                      ? "Wir brauchen Ihre Hinweise"
                      : "Haben Sie diese Person gesehen?";

                  return (
                    <div
                      className={cn(
                        "flex items-start gap-2 rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30",
                        isMobile && "p-2"
                      )}
                    >
                      <Info
                        className={cn(
                          "mt-0.5 shrink-0 text-blue-600 dark:text-blue-400",
                          isMobile ? "h-3.5 w-3.5" : "h-4 w-4"
                        )}
                      />
                      <div
                        className={cn(
                          "text-blue-800 dark:text-blue-200",
                          isMobile ? "text-xs" : "text-sm"
                        )}
                      >
                        <strong>Kategorie:</strong> {heroCategoryLabel} (
                        {heroCategoryPosition})
                        <br />
                        <span className="mt-1 block text-xs italic opacity-90">
                          &quot;{heroCategorySubtitle}&quot;
                        </span>
                        <br />
                        <span className="mt-1 block text-xs opacity-80">
                          Wird automatisch basierend auf Fahndungstyp zugewiesen
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Position Auswahl */}
                <div>
                  <div
                    className={cn(
                      "mb-2 block font-medium text-gray-700 dark:text-gray-300",
                      isMobile ? "text-xs" : "text-sm"
                    )}
                  >
                    Position im Hero-Bereich
                  </div>
                  <div className="flex gap-2">
                    {[
                      { pos: 1, label: "Links" },
                      { pos: 2, label: "Rechts" },
                    ].map(({ pos, label }) => (
                      <button
                        key={pos}
                        type="button"
                        disabled={!canEditHeroSettings}
                        onClick={() => {
                          if (!canEditHeroSettings) return;
                          onChange({
                            ...data,
                            heroSettings: {
                              ...heroSettings,
                              position: pos as 1 | 2,
                            },
                          });
                        }}
                        className={cn(
                          "flex-1 rounded-lg border-2 text-center font-semibold transition-all",
                          isMobile ? "px-2 py-2 text-sm" : "px-4 py-3",
                          heroSettings.position === pos
                            ? "border-blue-600 bg-blue-600 text-white shadow-lg"
                            : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:shadow-md dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200",
                          !canEditHeroSettings &&
                            "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-lg font-bold">{pos}</span>
                          <span className="text-xs opacity-90">{label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p
                    className={cn(
                      "mt-2 text-gray-600 dark:text-gray-400",
                      isMobile ? "text-xs" : "text-xs"
                    )}
                  >
                    <span className="inline-block">
                      Position 1 = Links (Vermisste Personen)
                    </span>
                    <span className="mx-1">•</span>
                    <span className="inline-block">
                      Position 2 = Rechts (Gesuchte Straftäter)
                    </span>
                  </p>
                </div>

                {/* Anzeigedauer */}
                <div>
                  <div
                    className={cn(
                      "mb-3 block font-medium text-gray-700 dark:text-gray-300",
                      isMobile ? "text-xs" : "text-sm"
                    )}
                  >
                    Anzeigedauer
                  </div>
                  <div className="space-y-2">
                    {/* Unbegrenzt */}
                    <label
                      className={cn(
                        "flex items-start gap-3 rounded-lg p-3 transition-colors",
                        canEditHeroSettings
                          ? "cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          : "cursor-not-allowed opacity-60"
                      )}
                    >
                      <input
                        type="radio"
                        name="displayMode"
                        value="unlimited"
                        checked={heroSettings.displayMode === "unlimited"}
                        disabled={!canEditHeroSettings}
                        onChange={() => {
                          if (!canEditHeroSettings) return;
                          onChange({
                            ...data,
                            heroSettings: {
                              ...heroSettings,
                              displayMode: "unlimited",
                              validUntil: undefined,
                            },
                          });
                        }}
                        className={cn(
                          "mt-0.5 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500",
                          isMobile ? "h-3.5 w-3.5" : "h-4 w-4",
                          !canEditHeroSettings &&
                            "opacity-50 cursor-not-allowed"
                        )}
                        aria-label="Bis auf Weiteres anzeigen"
                      />
                      <div className="flex-1">
                        <span
                          className={cn(
                            "block font-medium text-gray-900 dark:text-gray-100",
                            isMobile ? "text-sm" : "text-base"
                          )}
                        >
                          Bis auf Weiteres anzeigen
                        </span>
                        <span
                          className={cn(
                            "text-gray-600 dark:text-gray-400",
                            isMobile ? "text-xs" : "text-sm"
                          )}
                        >
                          Die Fahndung bleibt dauerhaft im Hero-Bereich
                        </span>
                      </div>
                    </label>

                    {/* Zeitlich begrenzt */}
                    <label
                      className={cn(
                        "flex items-start gap-3 rounded-lg p-3 transition-colors",
                        canEditHeroSettings
                          ? "cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          : "cursor-not-allowed opacity-60"
                      )}
                    >
                      <input
                        type="radio"
                        name="displayMode"
                        value="time_limited"
                        checked={heroSettings.displayMode === "time_limited"}
                        disabled={!canEditHeroSettings}
                        onChange={() => {
                          if (!canEditHeroSettings) return;
                          onChange({
                            ...data,
                            heroSettings: {
                              ...heroSettings,
                              displayMode: "time_limited",
                            },
                          });
                        }}
                        className={cn(
                          "mt-0.5 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500",
                          isMobile ? "h-3.5 w-3.5" : "h-4 w-4",
                          !canEditHeroSettings &&
                            "opacity-50 cursor-not-allowed"
                        )}
                        aria-label="Zeitlich begrenzt"
                      />
                      <div className="flex-1">
                        <span
                          className={cn(
                            "block font-medium text-gray-900 dark:text-gray-100",
                            isMobile ? "text-sm" : "text-base"
                          )}
                        >
                          Zeitlich begrenzt
                        </span>
                        <span
                          className={cn(
                            "text-gray-600 dark:text-gray-400",
                            isMobile ? "text-sm" : "text-sm"
                          )}
                        >
                          Automatische Entfernung nach Ablauf
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Datum-Picker (nur bei time_limited) */}
                {heroSettings.displayMode === "time_limited" && (
                  <div className="pt-2">
                    <label
                      htmlFor="hero-valid-until"
                      className={cn(
                        "mb-2 flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300",
                        isMobile ? "text-xs" : "text-sm"
                      )}
                    >
                      <Calendar
                        className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")}
                      />
                      Anzeigen bis
                    </label>
                    <input
                      id="hero-valid-until"
                      type="datetime-local"
                      value={
                        heroSettings.validUntil
                          ? new Date(heroSettings.validUntil)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      disabled={!canEditHeroSettings}
                      onChange={(e) => {
                        if (!canEditHeroSettings) return;
                        const dateValue = e.target.value;
                        const isoDate = dateValue
                          ? new Date(dateValue).toISOString()
                          : undefined;
                        onChange({
                          ...data,
                          heroSettings: {
                            ...heroSettings,
                            validUntil: isoDate,
                          },
                        });
                      }}
                      min={new Date().toISOString().slice(0, 16)}
                      className={cn(
                        "w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white",
                        isMobile ? "px-3 py-2 text-sm" : "px-4 py-2.5",
                        !canEditHeroSettings && "opacity-50 cursor-not-allowed"
                      )}
                      required={
                        heroSettings.displayMode === "time_limited" &&
                        canEditHeroSettings
                      }
                    />
                    {!heroSettings.validUntil &&
                      heroSettings.displayMode === "time_limited" && (
                        <div className="mt-2 flex items-start gap-2 text-red-600 dark:text-red-400">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span className="text-xs">
                            Bitte wählen Sie ein Enddatum für die zeitlich
                            begrenzte Anzeige
                          </span>
                        </div>
                      )}
                  </div>
                )}

                {/* Wichtige Hinweise */}
                <div
                  className={cn(
                    "rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20",
                    isMobile && "p-2"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle
                      className={cn(
                        "mt-0.5 shrink-0 text-amber-600 dark:text-amber-400",
                        isMobile ? "h-3.5 w-3.5" : "h-4 w-4"
                      )}
                    />
                    <div
                      className={cn(
                        "text-amber-800 dark:text-amber-200",
                        isMobile ? "text-xs" : "text-xs"
                      )}
                    >
                      <strong className="mb-1 block">Wichtige Hinweise:</strong>
                      <ul className="list-inside list-disc space-y-1">
                        <li>
                          Maximal 3 Fahndungen pro Kategorie im Hero-Bereich
                          (Links: Vermisste, Rechts: Straftäter)
                        </li>
                        <li>
                          <strong>
                            Die Fahndung muss veröffentlicht sein, um im Hero
                            angezeigt zu werden
                          </strong>
                        </li>
                        <li>
                          Nach Veröffentlichung erscheint die Fahndung
                          automatisch im Hero-Bereich, wenn aktiviert
                        </li>
                        <li>
                          Abgelaufene zeitbegrenzte Einträge werden automatisch
                          entfernt
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5Component;
