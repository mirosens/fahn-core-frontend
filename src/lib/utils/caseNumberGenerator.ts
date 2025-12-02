export const CATEGORY_TO_SUBJECT: Record<string, string> = {
  WANTED_PERSON: "K",
  MISSING_PERSON: "K",
  UNKNOWN_DEAD: "K",
  STOLEN_GOODS: "K",
};

export const STATUS_TO_CODE: Record<string, "A" | "G" | "Ü"> = {
  draft: "A",
  active: "A",
  published: "A",
  closed: "G",
  transferred: "Ü",
};

export function generateNewCaseNumber(
  category: string,
  status: string,
  authority = "POL",
  currentYear?: number
): string {
  const year = currentYear ?? new Date().getFullYear();
  const subject = CATEGORY_TO_SUBJECT[category] ?? "K";
  const statusCode = STATUS_TO_CODE[status] ?? "A";
  const timestamp = Date.now();
  const sequence = (timestamp % 999999) + 1;
  const formattedSequence = sequence.toString().padStart(6, "0");
  return `${authority}-${year}-${subject}-${formattedSequence}-${statusCode}`;
}
