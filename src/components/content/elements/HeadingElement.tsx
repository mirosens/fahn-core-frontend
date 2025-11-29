// components/content/elements/HeadingElement.tsx
// Server Component für Überschriften-Inhaltselemente

import { createElement } from "react";

interface HeadingElementData {
  text?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  [key: string]: unknown;
}

interface HeadingElementProps {
  data: unknown;
}

export function HeadingElement({ data }: HeadingElementProps) {
  const headingData = data as HeadingElementData;

  if (!headingData.text) {
    return null;
  }

  const level = headingData.level || 2;
  const tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

  const classNameMap: Record<number, string> = {
    1: "text-4xl font-bold mb-6",
    2: "text-3xl font-bold mb-4",
    3: "text-2xl font-semibold mb-3",
    4: "text-xl font-semibold mb-2",
    5: "text-lg font-semibold mb-2",
    6: "text-base font-semibold mb-2",
  };

  return createElement(
    tag,
    { className: classNameMap[level] },
    headingData.text
  );
}
