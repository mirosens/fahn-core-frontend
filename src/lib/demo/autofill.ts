import type { WizardData } from "@/components/fahndungen/wizard/types/WizardTypes";

// Vereinfachte Demo-Daten für Step 2
function buildContext(data: Partial<WizardData>): Record<string, string> {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const yyyy = now.getFullYear();
  const mmNum = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  const city = data.step1?.office || "Stuttgart";

  return {
    city: city,
    dienststelle: data.step1?.office || "Stuttgart",
    date: `${yyyy}-${mmNum}-${dd}`,
    time: `${hh}:${mm}`,
    caseNumber: data.step1?.caseNumber || "",
    amount: "1000",
    age: "35",
    height: "180",
    build: "schlanke",
    clothing: "dunkle Jacke, Jeans",
    itemBrand: "",
    model: "",
    serial: "",
    color: "",
    features: data.step2?.features || "",
    hintUrl: "https://www.polizei-bw.de/hinweise",
    phone: "0711 899-0000",
    email: "hinweise@polizei-bw.de",
    locationDetail: "Innenstadt",
    tattoo: "Herz",
    personName: "Unbekannte Person",
    pronoun: "die Person",
  } as Record<string, string>;
}

function resolvePlaceholders(
  template: string,
  ctx: Record<string, string>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return ctx[key] ?? match;
  });
}

function wizardToPresetCategory(
  cat: WizardData["step1"]["category"]
): "Straftaeter" | "Vermisst" | "UnbekannteTote" | "Sachen" | null {
  switch (cat) {
    case "WANTED_PERSON":
      return "Straftaeter";
    case "MISSING_PERSON":
      return "Vermisst";
    case "UNKNOWN_DEAD":
      return "UnbekannteTote";
    case "STOLEN_GOODS":
      return "Sachen";
    default:
      return null;
  }
}

// Generiert Sachverhalt (Tathergang/Situation)
export async function generateDemoSachverhalt(
  data: Partial<WizardData>
): Promise<string> {
  const catKey = wizardToPresetCategory(data.step1?.category ?? "");
  const ctx = buildContext(data);

  if (!catKey) {
    return resolvePlaceholders(
      "Am {date} gegen {time} wurde in {city} ein Vorfall gemeldet. Weitere Details werden noch ermittelt.",
      ctx
    );
  }

  // Sachverhalte je nach Kategorie
  if (catKey === "Vermisst") {
    const templates = [
      "Am {date} gegen {time} wurde {personName} in {city} zuletzt gesehen. Die Person wurde seitdem nicht mehr aufgefunden. Zeugen werden gesucht.",
      "Vermisstmeldung: {personName} wurde am {date} gegen {time} in {city} zuletzt gesehen. Die Person ist seitdem verschwunden. Hinweise bitte an die Polizei.",
      "Am {date} gegen {time} wurde {personName} in der {locationDetail} von {city} zuletzt gesehen. Die Person wird vermisst.",
    ];
    return resolvePlaceholders(
      templates[Math.floor(Math.random() * templates.length)]!,
      ctx
    );
  } else if (catKey === "Straftaeter") {
    const delikt = data.step1?.delikt || "Diebstahl";
    const templates = [
      "Am {date} gegen {time} wurde in {city} ein {delikt} verübt. Der Täter konnte flüchten. Zeugen werden gesucht.",
      "Tatvorwurf: {delikt} am {date} gegen {time} in {city}. Der Täter wurde beobachtet, konnte aber entkommen.",
      "Am {date} gegen {time} ereignete sich in {city} ein {delikt}. Der Täter wird gesucht.",
    ];
    return resolvePlaceholders(
      templates[Math.floor(Math.random() * templates.length)]!.replace(
        "{delikt}",
        delikt
      ),
      ctx
    );
  } else if (catKey === "UnbekannteTote") {
    const templates = [
      "Am {date} gegen {time} wurde in {city} eine unbekannte Leiche aufgefunden. Die Identität der Person ist noch nicht geklärt.",
      "Leichenfund: Am {date} gegen {time} wurde in {city} eine unbekannte Person tot aufgefunden. Identifikation erforderlich.",
      "Am {date} gegen {time} wurde in {city} eine Leiche gefunden. Die Identität ist unbekannt.",
    ];
    return resolvePlaceholders(
      templates[Math.floor(Math.random() * templates.length)]!,
      ctx
    );
  } else if (catKey === "Sachen") {
    const variant = data.step1?.delikt || "Fahrzeug";
    const templates = [
      "Am {date} gegen {time} wurde in {city} ein {variant} gestohlen. Der Diebstahl wurde beobachtet, der Täter konnte aber entkommen.",
      "Diebstahl: Am {date} gegen {time} wurde in {city} ein {variant} entwendet. Zeugen werden gesucht.",
      "Am {date} gegen {time} ereignete sich in {city} ein Diebstahl. Gestohlen wurde: {variant}.",
    ];
    return resolvePlaceholders(
      templates[Math.floor(Math.random() * templates.length)]!.replace(
        "{variant}",
        variant
      ),
      ctx
    );
  }

  return resolvePlaceholders(
    "Am {date} gegen {time} wurde in {city} ein Vorfall gemeldet.",
    ctx
  );
}

// Generiert Personenbeschreibung (Aussehen, Merkmale, Kleidung)
export async function generateDemoPersonenbeschreibung(
  data: Partial<WizardData>
): Promise<string> {
  const catKey = wizardToPresetCategory(data.step1?.category ?? "");
  const ctx = buildContext(data);

  if (!catKey) {
    return resolvePlaceholders(
      "Personenbeschreibung: {age} Jahre alt, ca. {height} cm groß, {build} Statur, {clothing}.",
      ctx
    );
  }

  // Personenbeschreibungen je nach Kategorie
  if (catKey === "Vermisst" || catKey === "Straftaeter") {
    const templates = [
      "Die Person ist {age} Jahre alt, etwa {height} cm groß und hat eine {build} Statur. Bekleidung: {clothing}.",
      "Beschreibung: {age} Jahre, {height} cm, {build} Statur. Kleidung: {clothing}. Besondere Merkmale: Auffällige {tattoo}-Tätowierung am Unterarm.",
      "Person: {age} Jahre, {height} cm, {build}. Zuletzt gesehen in {clothing}. Trägt häufig Kappe.",
    ];
    return resolvePlaceholders(
      templates[Math.floor(Math.random() * templates.length)]!,
      ctx
    );
  } else if (catKey === "UnbekannteTote") {
    const templates = [
      "Geschätztes Alter: {age} Jahre. Größe: ca. {height} cm. Statur: {build}. Bekleidung: {clothing}.",
      "Leiche: Alter {age}, Größe {height} cm, {build} Statur. Kleidung: {clothing}.",
    ];
    return resolvePlaceholders(
      templates[Math.floor(Math.random() * templates.length)]!,
      ctx
    );
  } else if (catKey === "Sachen") {
    // Bei Sachen keine Personenbeschreibung, aber Täterbeschreibung falls vorhanden
    return resolvePlaceholders(
      "Täterbeschreibung: {age} Jahre, {height} cm, {build} Statur. Bekleidung: {clothing}.",
      ctx
    );
  }

  return resolvePlaceholders(
    "Personenbeschreibung: {age} Jahre, {height} cm, {build} Statur, {clothing}.",
    ctx
  );
}

// Master-Funktion für neue Step 2 Felder
export async function generateStep2NewFieldsData(
  data: Partial<WizardData>
): Promise<{
  sachverhalt: string;
  personenbeschreibung: string;
}> {
  const sachverhalt = await generateDemoSachverhalt(data);
  const personenbeschreibung = await generateDemoPersonenbeschreibung(data);

  return {
    sachverhalt,
    personenbeschreibung,
  };
}
