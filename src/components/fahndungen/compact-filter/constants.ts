import { Users, UserX, Skull, Package } from "lucide-react";

// Konfigurationsdaten
export const LKA_STATIONS = [
  "Aalen",
  "Freiburg",
  "Heilbronn",
  "Karlsruhe",
  "Konstanz",
  "Ludwigsburg",
  "Mannheim",
  "Offenburg",
  "Pforzheim",
  "Ravensburg",
  "Reutlingen",
  "Stuttgart",
  "Ulm",
  "LKA",
  "Allgemein",
  "Zentral",
  "Hauptstelle",
  "Polizeipräsidium",
];

export const FAHNDUNGSTYPEN = [
  { value: "straftaeter", label: "Straftäter", icon: Users, color: "red" },
  { value: "vermisste", label: "Vermisste", icon: UserX, color: "blue" },
  { value: "unbekannte_tote", label: "Unbekannte Tote", icon: Skull, color: "gray" },
  { value: "sachen", label: "Sachen", icon: Package, color: "green" },
];

export const TIME_RANGE_OPTIONS = [
  { value: "all", label: "Alle Zeiträume" },
  { value: "24h", label: "Letzte 24h" },
  { value: "7d", label: "Letzte 7 Tage" },
  { value: "30d", label: "Letzte 30 Tage" },
];

export const REGIONEN = [
  "Bodensee",
  "Donau-Iller",
  "Heilbronn-Franken",
  "Hochrhein",
  "Karlsruhe",
  "Neckar-Alb",
  "Nordschwarzwald",
  "Ostwürttemberg",
  "Rhein-Neckar",
  "Schwarzwald-Baar",
  "Stuttgart",
  "Südlicher Oberrhein",
];

