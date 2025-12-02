// Enhanced Types für den Fahndung Wizard
import type React from "react";

export interface Step1Data {
  title: string;
  category:
    | ""
    | "WANTED_PERSON"
    | "MISSING_PERSON"
    | "UNKNOWN_DEAD"
    | "STOLEN_GOODS"
    | "INTERNATIONAL";
  caseNumber: string;
  office: string; // Polizeipräsidium / Dienststelle
  customOffice?: string; // Optional: Freitext bei "Andere Dienststelle"
  eventTime: string; // Ereigniszeit (ISO Datum yyyy-mm-dd oder datetime)
  delikt?: string; // Delikt (nur bei Straftäter oder Sachen/Gegenstände)
  variant?: string; // Legacy-Feld, wird durch delikt ersetzt
  department?: string; // Legacy-Feld, wird durch office ersetzt
  caseDate?: string; // Legacy-Feld, wird durch eventTime ersetzt
  regionCity?: string; // Optionales Zusatzfeld für Übergangsphasen bis Step 4 gesetzt ist
}

export interface Step2Data {
  sachverhalt?: string;
  personenbeschreibung?: string;
  // Legacy-Felder (deprecated, für Rückwärtskompatibilität)
  shortDescription?: string;
  description?: string;
  tags?: string[];
  features?: string;
}

export interface Step3Data {
  mainImage?: string | File;
  mainImageUrl?: string;
  cover_media_id?: string;
  video: File | null;
  videoUrl?: string | null;
  video_media_id?: string;
  additionalImages?: string[];
  additionalImageUrls?: string[];
  allMedia?: Array<{
    id: string;
    public_id: string;
    type: "image" | "video";
    url: string;
    resource_type: string;
  }>;
  documents: File[];
}

export interface Step4Data {
  mainLocation: {
    id: string;
    address: string;
    lat: number;
    lng: number;
    type:
      | "main"
      | "tatort"
      | "wohnort"
      | "arbeitsplatz"
      | "sichtung"
      | "sonstiges";
    description?: string;
    timestamp?: Date;
  } | null;
  additionalLocations: Array<{
    id: string;
    lat: number;
    lng: number;
    address: string;
    type:
      | "main"
      | "tatort"
      | "wohnort"
      | "arbeitsplatz"
      | "sichtung"
      | "sonstiges";
    description?: string;
    timestamp?: Date;
  }>;
}

export interface Step5Data {
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  organizationalUnit: string;
  publishStatus: "draft" | "review" | "scheduled" | "immediate";
  scheduledDate?: string;
  deletionDate?: string;
  reminderDate?: string;
  reminderEmail?: string;
  urgencyLevel: "low" | "medium" | "high" | "critical";
  requiresApproval: boolean;
  visibility: {
    internal: boolean;
    regional: boolean;
    national: boolean;
    international: boolean;
  };
  notifications: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    appNotifications: boolean;
    pressRelease: boolean;
  };
  heroSettings?: {
    enabled: boolean;
    position: 1 | 2;
    displayMode: "unlimited" | "time_limited";
    validUntil?: string;
  };
  department?: string;
  availableHours?: string;
}

export interface WizardData {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
}

export interface PreviewMode {
  id: "card" | "detail" | "stats";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CATEGORY_CONFIG = {
  WANTED_PERSON: {
    label: "STRAFTÄTER",
    icon: "Shield",
    gradient: "from-red-500 to-red-600",
    bg: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
  },
  MISSING_PERSON: {
    label: "VERMISSTE",
    icon: "Search",
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
  },
  UNKNOWN_DEAD: {
    label: "UNBEKANNTE TOTE",
    icon: "FileText",
    gradient: "from-gray-500 to-gray-600",
    bg: "bg-muted border-border dark:bg-gray-950 dark:border-border",
  },
  STOLEN_GOODS: {
    label: "SACHEN",
    icon: "Camera",
    gradient: "from-orange-500 to-orange-600",
    bg: "bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800",
  },
} as const;

export const PRIORITY_CONFIG = {
  urgent: { label: "DRINGEND", color: "bg-red-600", pulse: true },
  new: { label: "NEU", color: "bg-blue-600", pulse: false },
  normal: { label: "STANDARD", color: "bg-muted", pulse: false },
} as const;

export const defaultHeroSettings: Step5Data["heroSettings"] = {
  enabled: false,
  position: 1,
  displayMode: "unlimited",
  validUntil: undefined,
};
