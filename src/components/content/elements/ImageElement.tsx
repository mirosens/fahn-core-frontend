// components/content/elements/ImageElement.tsx
// Server Component für Bild-Inhaltselemente

import Image from "next/image";

interface ImageElementData {
  src?: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

interface ImageElementProps {
  data: unknown;
}

export function ImageElement({ data }: ImageElementProps) {
  const imageData = data as ImageElementData;

  if (!imageData.src) {
    return null;
  }

  return (
    <figure className="my-6">
      <Image
        src={imageData.src}
        alt={imageData.alt || imageData.title || ""}
        width={imageData.width || 800}
        height={imageData.height || 600}
        className="rounded-lg"
      />
      {imageData.title && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {imageData.title}
        </figcaption>
      )}
    </figure>
  );
}
