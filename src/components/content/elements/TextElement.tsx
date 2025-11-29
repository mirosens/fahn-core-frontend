// components/content/elements/TextElement.tsx
// Server Component für Text-Inhaltselemente

interface TextElementData {
  text?: string;
  header?: string;
  [key: string]: unknown;
}

interface TextElementProps {
  data: unknown;
}

export function TextElement({ data }: TextElementProps) {
  const textData = data as TextElementData;

  if (!textData.text && !textData.header) {
    return null;
  }

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      {textData.header && (
        <h2 className="mb-4 text-2xl font-semibold">{textData.header}</h2>
      )}
      {textData.text && (
        <div
          dangerouslySetInnerHTML={{ __html: textData.text }}
          className="text-muted-foreground"
        />
      )}
    </div>
  );
}
