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

// Hilfsfunktion: Extrahiere Stadtname aus Department-String
function extractCity(department: string): string | null {
  if (!department) return null;

  const cities = [
    "Stuttgart",
    "Karlsruhe",
    "Mannheim",
    "Freiburg",
    "Ulm",
    "Heilbronn",
    "Pforzheim",
    "Ravensburg",
    "Reutlingen",
    "Ludwigsburg",
    "Offenburg",
    "Aalen",
    "Konstanz",
  ];

  for (const city of cities) {
    if (department.includes(city)) {
      return city;
    }
  }

  return null;
}

// Generiert Demo-Kontaktperson
export function generateDemoContactPerson(data: Partial<WizardData>): string {
  const department =
    data.step1?.department ?? data.step5?.department ?? "Stuttgart";

  // Deutsche Kontaktpersonen
  const contacts = [
    "KHK Müller",
    "KK Weber",
    "PHK Schmidt",
    "KOK Fischer",
    "Kriminalhauptkommissar Meyer",
    "Kriminalkommissar Wagner",
    "Polizeihauptkommissar Schulz",
    "Kriminaloberkommissar Hoffmann",
  ];

  return contacts[Math.floor(Math.random() * contacts.length)] ?? "KHK Müller";
}

// Generiert Demo-Telefonnummer
export function generateDemoContactPhone(data: Partial<WizardData>): string {
  const department =
    data.step1?.department ?? data.step5?.department ?? "Stuttgart";
  const city = extractCity(department);

  // Deutsche Telefonnummern
  const phoneNumbers = [
    "0711 899-0000", // Stuttgart
    "0721 666-0000", // Karlsruhe
    "0621 174-0000", // Mannheim
    "0761 882-0000", // Freiburg
    "0731 188-0000", // Ulm
    "0751 366-0000", // Ravensburg
    "07121 301-0000", // Reutlingen
    "07141 910-0000", // Ludwigsburg
    "07131 56-0000", // Heilbronn
    "0781 82-0000", // Offenburg
    "07231 39-0000", // Pforzheim
    "07361 52-0000", // Aalen
    "07531 98-0000", // Konstanz
  ];

  // Versuche passende Nummer zur Stadt zu finden
  if (city) {
    const cityMap: Record<string, string> = {
      Stuttgart: "0711 899-0000",
      Karlsruhe: "0721 666-0000",
      Mannheim: "0621 174-0000",
      Freiburg: "0761 882-0000",
      Ulm: "0731 188-0000",
      Ravensburg: "0751 366-0000",
      Reutlingen: "07121 301-0000",
      Ludwigsburg: "07141 910-0000",
      Heilbronn: "07131 56-0000",
      Offenburg: "0781 82-0000",
      Pforzheim: "07231 39-0000",
      Aalen: "07361 52-0000",
      Konstanz: "07531 98-0000",
    };

    const phone = cityMap[city];
    if (phone !== undefined) {
      return phone;
    }
  }

  // Fallback: zufällige Nummer
  const randomIndex = Math.floor(Math.random() * phoneNumbers.length);
  const randomPhone = phoneNumbers[randomIndex]!;
  return randomPhone;
}

// Generiert Demo-E-Mail-Adresse
export function generateDemoContactEmail(data: Partial<WizardData>): string {
  const department =
    data.step1?.department ?? data.step5?.department ?? "Stuttgart";
  const city = extractCity(department);

  // Deutsche E-Mail-Adressen
  const emailTemplates = [
    "hinweise@polizei-bw.de",
    "kriminalpolizei@polizei-bw.de",
    "fahndung@polizei-bw.de",
    "kontakt@polizei-bw.de",
  ];

  // Spezielle E-Mails für alle Baden-Württemberg Städte
  if (city) {
    const cityEmails: Record<string, string> = {
      Stuttgart: "hinweise@polizei-stuttgart.de",
      Karlsruhe: "hinweise@polizei-karlsruhe.de",
      Mannheim: "hinweise@polizei-mannheim.de",
      Freiburg: "hinweise@polizei-freiburg.de",
      Ulm: "hinweise@polizei-ulm.de",
      Heilbronn: "hinweise@polizei-heilbronn.de",
      Pforzheim: "hinweise@polizei-pforzheim.de",
      Ravensburg: "hinweise@polizei-ravensburg.de",
      Reutlingen: "hinweise@polizei-reutlingen.de",
      Ludwigsburg: "hinweise@polizei-ludwigsburg.de",
      Offenburg: "hinweise@polizei-offenburg.de",
      Aalen: "hinweise@polizei-aalen.de",
      Konstanz: "hinweise@polizei-konstanz.de",
    };

    const email = cityEmails[city];
    if (email !== undefined) {
      return email;
    }
  }

  // Fallback: zufällige E-Mail
  const randomIndex = Math.floor(Math.random() * emailTemplates.length);
  const randomEmail = emailTemplates[randomIndex]!;
  return randomEmail;
}

// Generiert Demo-Organisationseinheit
export function generateDemoDepartment(data: Partial<WizardData>): string {
  const category = data.step1?.category ?? "MISSING_PERSON";
  const existingDepartment = data.step1?.department ?? data.step5?.department;

  // Baden-Württemberg Städte (kurze Namen)
  const lkaDepartments = [
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
  ];

  // Wenn bereits eine Abteilung vorhanden ist, verwende diese
  if (existingDepartment && lkaDepartments.includes(existingDepartment)) {
    return existingDepartment;
  }

  // Versuche aus Step1 Office zu extrahieren
  const office = data.step1?.office;
  if (office) {
    const city = extractCity(office);
    if (city && lkaDepartments.includes(city)) {
      return city;
    }
  }

  // Fallback: zufällige Abteilung
  const randomIndex = Math.floor(Math.random() * lkaDepartments.length);
  return lkaDepartments[randomIndex] ?? "Stuttgart";
}
