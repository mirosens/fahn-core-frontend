// Vereinfachte Demo-Szenarien für Step 1
export type DemoScenario = "straftaeter" | "vermisste" | "tote" | "sachen";

export interface BaseDemoData {
  title: string;
  shortDescription: string;
  description: string;
  features: string;
  tags: string[];
}

export const SCENARIO_CONFIG = {
  straftaeter: {
    name: "Straftäter",
    category: "WANTED_PERSON" as const,
    variants: [
      "Diebstahl",
      "Raub",
      "Betrug",
      "Körperverletzung",
      "Cybercrime",
      "Terrorismus",
      "Drogenhandel",
      "Menschenhandel",
      "Sonstiges",
    ],
  },
  vermisste: {
    name: "Vermisste",
    category: "MISSING_PERSON" as const,
    variants: ["Standard", "Kind", "Senior", "Psychisch", "Flüchtling"],
  },
  tote: {
    name: "Tote",
    category: "UNKNOWN_DEAD" as const,
    variants: [
      "Standard",
      "Wasserfund",
      "Waldfund",
      "Grenzgebiet",
      "Flughafen",
    ],
  },
  sachen: {
    name: "Sachen",
    category: "STOLEN_GOODS" as const,
    variants: [
      "Fahrzeug",
      "Fahrrad",
      "Elektronik",
      "Schmuck",
      "Kunst",
      "Waffen",
      "Dokumente",
      "Sonstiges",
    ],
  },
} as const;

export function generateDemoDataForScenario(
  scenario: DemoScenario
): BaseDemoData {
  const config = SCENARIO_CONFIG[scenario];

  const titles: Record<DemoScenario, string> = {
    straftaeter: "Gesuchter Straftäter - Unbekannte Person",
    vermisste: "Vermisste Person - Unbekannte Person",
    tote: "Unbekannte/r Tote/r - Identifizierung erforderlich",
    sachen: "Gestohlene Sachen/Gegenstände",
  };

  return {
    title: titles[scenario] ?? "Demo-Fahndung",
    shortDescription: `Demo-Beschreibung für ${config.name}`,
    description: `Dies ist eine Demo-Beschreibung für das Szenario "${config.name}". Die vollständige Beschreibung wird später aus Typo3 geladen.`,
    features: "",
    tags: [config.category],
  };
}
