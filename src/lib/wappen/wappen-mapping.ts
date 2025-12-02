/**
 * Wappen-Mapping für Polizeipräsidien
 * Ordnet Städten ihre entsprechenden Wappen zu
 */

export interface WappenInfo {
  path: string;
  alt: string;
  city: string;
}

/**
 * PP-Farben-Mapping für PR/PPost-Kreise
 * Definiert die Farben für die Zugehörigkeit zu verschiedenen Polizeipräsidien
 */
export const PP_COLORS: Record<string, string> = {
  Stuttgart: "#8B5CF6", // Purple 600
  Nauheimer: "#8B5CF6", // Purple 600
  "Stuttgart-Mitte": "#8B5CF6", // Purple 600
  "Stuttgart-Zentrum": "#8B5CF6", // Purple 600
  Technik: "#8B5CF6", // Purple 600
  Logistik: "#8B5CF6", // Purple 600
  Service: "#8B5CF6", // Purple 600
  Hahnemann: "#8B5CF6", // Purple 600
  Karlsruhe: "#2563EB", // Blue 600
  Mannheim: "#0891B2", // Cyan 600
  Freiburg: "#059669", // Emerald 600
  Heilbronn: "#EA580C", // Orange 600
  Konstanz: "#DB2777", // Pink 600
  Ludwigsburg: "#7C3AED", // Violet 600
  Offenburg: "#16A34A", // Green 600
  Pforzheim: "#D97706", // Amber 600
  Ravensburg: "#2563EB", // Blue 600
  Reutlingen: "#0EA5E9", // Sky 600
  Ulm: "#3B82F6", // Blue 500
  Aalen: "#DC2626", // Red 600
  Göppingen: "#7C2D12", // Red 800
  Goeppingen: "#7C2D12", // Red 800
  Einsatz: "#7C2D12", // Red 800
};

/**
 * Mapping von Städtenamen zu Wappen-Dateien
 */
export const wappenMapping: Record<string, WappenInfo> = {
  Stuttgart: {
    path: "/images/wappen/DEU_Stuttgart_COA.svg",
    alt: "Wappen Stuttgart",
    city: "Stuttgart",
  },
  Nauheimer: {
    path: "/logo.svg",
    alt: "PTLS Logo Stuttgart",
    city: "Stuttgart",
  },
  "Stuttgart-Mitte": {
    path: "/logo.svg",
    alt: "PTLS Logo Stuttgart",
    city: "Stuttgart",
  },
  "Stuttgart-Zentrum": {
    path: "/logo.svg",
    alt: "PTLS Logo Stuttgart",
    city: "Stuttgart",
  },
  Technik: {
    path: "/logo.svg",
    alt: "PTLS Logo Stuttgart",
    city: "Stuttgart",
  },
  Logistik: {
    path: "/logo.svg",
    alt: "PTLS Logo Stuttgart",
    city: "Stuttgart",
  },
  Service: {
    path: "/logo.svg",
    alt: "PTLS Logo Stuttgart",
    city: "Stuttgart",
  },
  Hahnemann: {
    path: "/images/wappen/DEU_Stuttgart_COA.svg",
    alt: "Wappen Stuttgart",
    city: "Stuttgart",
  },
  Karlsruhe: {
    path: "/images/wappen/DEU_Karlsruhe_COA.svg",
    alt: "Wappen Karlsruhe",
    city: "Karlsruhe",
  },
  Freiburg: {
    path: "/images/wappen/DEU_Freiburg_im_Breisgau_COA.svg",
    alt: "Wappen Freiburg",
    city: "Freiburg",
  },
  Heilbronn: {
    path: "/images/wappen/DEU_Heilbronn_COA.svg",
    alt: "Wappen Heilbronn",
    city: "Heilbronn",
  },
  Konstanz: {
    path: "/images/wappen/DEU_Landkreis_Konstanz_COA.svg",
    alt: "Wappen Konstanz",
    city: "Konstanz",
  },
  Ludwigsburg: {
    path: "/images/wappen/DEU_Ludwigsburg_COA.svg",
    alt: "Wappen Ludwigsburg",
    city: "Ludwigsburg",
  },
  Offenburg: {
    path: "/images/wappen/DEU_Offenburg_COA.svg",
    alt: "Wappen Offenburg",
    city: "Offenburg",
  },
  Ulm: {
    path: "/images/wappen/DEU_Ulm_COA.svg",
    alt: "Wappen Ulm",
    city: "Ulm",
  },
  Mannheim: {
    path: "/images/wappen/Wappen_Mannheim.svg",
    alt: "Wappen Mannheim",
    city: "Mannheim",
  },
  Pforzheim: {
    path: "/images/wappen/Wappen_Pforzheim.svg",
    alt: "Wappen Pforzheim",
    city: "Pforzheim",
  },
  Ravensburg: {
    path: "/images/wappen/Wappen_Ravensburg.svg",
    alt: "Wappen Ravensburg",
    city: "Ravensburg",
  },
  Reutlingen: {
    path: "/images/wappen/Wappen_Stadt_Reutlingen.svg",
    alt: "Wappen Reutlingen",
    city: "Reutlingen",
  },
  Aalen: {
    path: "/images/wappen/DEU_Aalen_COA.svg",
    alt: "Wappen Aalen",
    city: "Aalen",
  },
  Göppingen: {
    path: "/images/wappen/DEU_Göppingen_COA.svg",
    alt: "Wappen Göppingen",
    city: "Göppingen",
  },
  Goeppingen: {
    path: "/images/wappen/DEU_Göppingen_COA.svg",
    alt: "Wappen Göppingen",
    city: "Göppingen",
  },
  Einsatz: {
    path: "/images/wappen/DEU_Göppingen_COA.svg",
    alt: "Wappen Göppingen",
    city: "Göppingen",
  },
};

/**
 * Gibt das passende Wappen für eine Stadt zurück
 */
export function getWappenForCity(cityName: string): WappenInfo | null {
  if (!cityName) return null;

  // Normalisiere den Städtenamen
  const normalizedCity = (cityName.trim().split(/[\s/]/)[0] ?? "") // Nur Hauptstadtname
    .replace(/[^\wäöüßÄÖÜ]/g, "") // Entferne Sonderzeichen
    .toLowerCase();

  // Suche nach exakter Übereinstimmung
  for (const [key, wappen] of Object.entries(wappenMapping)) {
    if (key.toLowerCase() === normalizedCity) {
      return wappen;
    }
  }

  // Fallback: Suche nach Teilübereinstimmung
  for (const [key, wappen] of Object.entries(wappenMapping)) {
    if (
      key.toLowerCase().includes(normalizedCity) ||
      normalizedCity.includes(key.toLowerCase())
    ) {
      return wappen;
    }
  }

  // Spezielle Behandlung für Göppingen (mit und ohne Umlaut)
  if (
    normalizedCity.includes("göppingen") ||
    normalizedCity.includes("goeppingen")
  ) {
    return wappenMapping["Göppingen"] ?? null;
  }

  // Spezielle Behandlung für "Einsatz" (Göppingen)
  if (normalizedCity.includes("einsatz")) {
    return wappenMapping["Einsatz"] ?? null;
  }

  // Spezielle Behandlung für "Nauheimer" (Stuttgart)
  if (normalizedCity.includes("nauheimer")) {
    return wappenMapping["Nauheimer"] ?? null;
  }

  // Spezielle Behandlung für alle Stuttgart-Varianten
  if (normalizedCity.includes("stuttgart")) {
    return wappenMapping["Stuttgart"] ?? null;
  }

  // Spezielle Behandlung für PTLS-Begriffe (Stuttgart) - höhere Priorität
  if (
    normalizedCity.includes("technik") ||
    normalizedCity.includes("logistik") ||
    normalizedCity.includes("service")
  ) {
    return wappenMapping["Technik"] ?? null;
  }

  // Spezielle Behandlung für "Präsidium Technik, Logistik, Service"
  if (
    cityName.toLowerCase().includes("technik") &&
    cityName.toLowerCase().includes("logistik") &&
    cityName.toLowerCase().includes("service")
  ) {
    return wappenMapping["Technik"] ?? null;
  }

  // Spezielle Behandlung für "Hahnemann" (Stuttgart)
  if (normalizedCity.includes("hahnemann")) {
    return wappenMapping["Hahnemann"] ?? null;
  }

  return null;
}

/**
 * Gibt die Farbe für ein Polizeipräsidium zurück
 */
export function getPPColor(cityName: string): string {
  if (!cityName) return "#64748B"; // slate-500 fallback

  const normalizedCity = (cityName.trim().split(/[\s/]/)[0] ?? "") // Nur Hauptstadtname
    .replace(/[^\wäöüßÄÖÜ]/g, "") // Entferne Sonderzeichen
    .toLowerCase();

  // Suche nach exakter Übereinstimmung
  for (const [key, color] of Object.entries(PP_COLORS)) {
    if (key.toLowerCase() === normalizedCity) {
      return color;
    }
  }

  // Fallback: Suche nach Teilübereinstimmung
  for (const [key, color] of Object.entries(PP_COLORS)) {
    if (
      key.toLowerCase().includes(normalizedCity) ||
      normalizedCity.includes(key.toLowerCase())
    ) {
      return color;
    }
  }

  return "#64748B"; // slate-500 fallback
}
