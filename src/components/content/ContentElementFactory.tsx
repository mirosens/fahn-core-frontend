// components/content/ContentElementFactory.tsx
// Content Element Factory Pattern für TYPO3-Inhaltselemente

import { TextElement } from "./elements/TextElement";
import { ImageElement } from "./elements/ImageElement";
import { HeadingElement } from "./elements/HeadingElement";

export interface ContentElement {
  id: string;
  type: string; // CType aus TYPO3
  data: unknown;
}

interface ContentElementFactoryProps {
  elements: ContentElement[];
}

export function ContentElementFactory({
  elements,
}: ContentElementFactoryProps) {
  return (
    <>
      {elements.map((element) => {
        switch (element.type) {
          case "text":
          case "textmedia":
            return <TextElement key={element.id} data={element.data} />;

          case "image":
          case "imagegallery":
            return <ImageElement key={element.id} data={element.data} />;

          case "header":
          case "headline":
            return <HeadingElement key={element.id} data={element.data} />;

          // TODO: Weitere CTypes in späteren Phasen ergänzen:
          // - map (interaktiv, Client Component)
          // - form (interaktiv, Client Component)
          // - list (Fahndungen-Liste)
          // - etc.

          default:
            // Unbekannte CTypes werden ignoriert (oder können geloggt werden)
            console.warn(`Unknown content element type: ${element.type}`);
            return null;
        }
      })}
    </>
  );
}
