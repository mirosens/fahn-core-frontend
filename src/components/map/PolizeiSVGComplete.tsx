import React, { createContext, useContext, useState } from "react";

export interface SegmentMeta {
  id: string;
  label: string;
}
export const segments: SegmentMeta[] = [
  { id: "pp-ma-1", label: "Stadtkreis Mannheim" },
  { id: "pp-ma-2", label: "Stadtkreis Heidelberg, Rhein-Neckar-Kreis" },
  { id: "pp-hn-1", label: "Stadt- und Landkreis Heilbronn" },
  { id: "pp-hn-2", label: "Hohenlohekreis" },
  { id: "pp-hn-3", label: "Main-Tauber-Kreis" },
  { id: "pp-hn-4", label: "Neckar-Odenwald-Kreis" },
  { id: "pp-ka-1", label: "Stadt- und Landkreis Karlsruhe" },
  { id: "pp-ka-2", label: "Karlsruhe" },
  { id: "pp-pf-1", label: "Stadtkreis Pforzheim, Enzkreis" },
  { id: "pp-pf-2", label: "Landkreis Calw" },
  { id: "pp-pf-3", label: "Landkreis Freudenstadt" },
  { id: "pp-og-1", label: "Stadtkreis Baden-Baden" },
  { id: "pp-og-2", label: "Landkreis Rastatt" },
  { id: "pp-og-3", label: "Ortenaukreis" },
  { id: "pp-lb-1", label: "Landkreis Ludwigsburg" },
  { id: "pp-lb-2", label: "Landkreis Böblingen" },
  { id: "pp-s-1", label: "Stadtkreis Stuttgart" },
  { id: "pp-aa-1", label: "Ostalbkreis" },
  { id: "pp-aa-2", label: "Landkreis Heidenheim" },
  { id: "pp-aa-3", label: "Landkreis Schwäbisch Hall" },
  { id: "pp-rt-1", label: "Landkreis Esslingen" },
  { id: "pp-rt-2", label: "Landkreis Reutlingen" },
  { id: "pp-rt-3", label: "Landkreis Tübingen" },
  { id: "pp-rt-4", label: "Zollernalbkreis" },
  { id: "pp-ul-1", label: "Stadtkreis Ulm, Alb-Donau-Kreis" },
  { id: "pp-ul-2", label: "Landkreis Göppingen" },
  { id: "pp-ul-3", label: "Landkreis Heidenheim" },
  { id: "pp-ul-4", label: "Stadtkreis Ulm" },
  { id: "pp-ul-5", label: "Landkreis Biberach" },
  { id: "pp-kn-1", label: "Landkreis Konstanz" },
  { id: "pp-kn-2", label: "Landkreis Tuttlingen" },
  { id: "pp-kn-3", label: "Landkreis Rottweil" },
  { id: "pp-kn-4", label: "Schwarzwald-Baar-Kreis" },
  {
    id: "pp-fr-1",
    label: "Stadtkreis Freiburg, Landkreis Breisgau-Hochschwarzwald",
  },
  { id: "pp-fr-2", label: "Landkreis Emmendingen" },
  { id: "pp-fr-3", label: "Landkreis Lörrach" },
  { id: "pp-fr-4", label: "Landkreis Waldshut" },
  { id: "pp-rv-1", label: "Bodenseekreis" },
  { id: "pp-rv-2", label: "Landkreis Ravensburg" },
  { id: "pp-rv-3", label: "Landkreis Sigmaringen" },
];

// Helper function to darken a color
const adjustBrightness = (color: string, factor: number): string => {
  // Handle hex colors
  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const newR = Math.round(r * factor);
    const newG = Math.round(g * factor);
    const newB = Math.round(b * factor);

    return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
  }
  return color;
};

interface SegmentContextValue {
  selected: string | null;
  setSelected: (id: string | null) => void;
  hovered: string | null;
  setHovered: (id: string | null) => void;
  selectedPP: string | null;
  setSelectedPP: (ppId: string | null) => void;
  isSelected?: (id: string) => boolean;
  selectedSegments?: Set<string>;
}

const SegmentContext = createContext<SegmentContextValue | undefined>(
  undefined
);

const SegmentProvider: React.FC<{
  children: React.ReactNode;
  selectedSegments?: Set<string>;
  onSegmentToggle?: (segmentId: string) => void;
}> = ({ children, selectedSegments, onSegmentToggle }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selectedPP, setSelectedPP] = useState<string | null>(null);

  const handleSetSelected = React.useCallback(
    (id: string | null) => {
      if (onSegmentToggle && id) {
        onSegmentToggle(id);
      } else {
        setSelected(id);
      }
    },
    [onSegmentToggle]
  );

  const isSelected = React.useCallback(
    (id: string) => {
      if (selectedSegments) {
        return selectedSegments.has(id);
      }
      return selected === id;
    },
    [selectedSegments, selected]
  );

  const contextValue = React.useMemo(
    () => ({
      selected: selectedSegments
        ? (Array.from(selectedSegments)[0] ?? null)
        : selected,
      setSelected: handleSetSelected,
      hovered,
      setHovered,
      selectedPP,
      setSelectedPP,
      isSelected,
      selectedSegments,
    }),
    [
      selected,
      handleSetSelected,
      hovered,
      selectedPP,
      isSelected,
      selectedSegments,
    ]
  );

  return (
    <SegmentContext.Provider value={contextValue}>
      {children}
    </SegmentContext.Provider>
  );
};

function useSegment() {
  const ctx = useContext(SegmentContext);
  if (!ctx) {
    throw new Error("useSegment must be used within a SegmentProvider");
  }
  return ctx;
}

// Rekursive Funktion zum Anwenden von Effekten auf alle <path> Elemente
const applyPathEffects = (
  node: React.ReactNode,
  segmentIsSelected: boolean,
  hovered: string | null,
  segmentId: string
): React.ReactNode => {
  if (!React.isValidElement(node)) {
    return node;
  }

  // Wenn es ein <path> Element ist, wende Effekte an
  if (node.type === "path") {
    const originalFill = (node.props as React.SVGProps<SVGPathElement>).fill;
    const pathProps = node.props as React.SVGProps<SVGPathElement>;
    return React.cloneElement(
      node as React.ReactElement<React.SVGProps<SVGPathElement>>,
      {
        stroke: segmentIsSelected
          ? "#001f3f"
          : hovered === segmentId
            ? "#1e40af"
            : "#2a4f77",
        strokeWidth: segmentIsSelected
          ? "4px"
          : hovered === segmentId
            ? "2.5px"
            : "1px",
        fill: segmentIsSelected
          ? originalFill
            ? adjustBrightness(originalFill, 0.7)
            : originalFill
          : (originalFill ?? undefined),
        style: {
          ...pathProps.style,
          filter: segmentIsSelected
            ? "brightness(0.85) saturate(1.2)"
            : hovered === segmentId
              ? "brightness(1.1)"
              : undefined,
          transition: "all 0.3s ease",
          pointerEvents: "all", // Stelle sicher, dass Pointer-Events aktiviert sind
        },
        pointerEvents: "all", // Stelle sicher, dass Pointer-Events aktiviert sind
      }
    );
  }

  // Wenn es ein <g> Element ist, verarbeite Kinder rekursiv
  if (node.type === "g") {
    const gElement = node as React.ReactElement<React.SVGProps<SVGGElement>>;
    const processedChildren = React.Children.map(
      gElement.props.children,
      (child) => applyPathEffects(child, segmentIsSelected, hovered, segmentId)
    );

    return React.cloneElement(
      gElement,
      {
        style: {
          ...gElement.props.style,
          transition: "all 0.3s ease",
        },
      },
      processedChildren
    );
  }

  // Für andere Elemente, verarbeite Kinder rekursiv falls vorhanden
  const nodeProps = node.props as { children?: React.ReactNode };
  if (nodeProps.children) {
    const processedChildren = React.Children.map(nodeProps.children, (child) =>
      applyPathEffects(child, segmentIsSelected, hovered, segmentId)
    );
    return React.cloneElement(node, {}, processedChildren);
  }

  return node;
};

const SVGSegment: React.FC<{ id: string; children: React.ReactNode }> = ({
  id,
  children,
}) => {
  const {
    setSelected,
    hovered,
    setHovered,
    selectedPP,
    isSelected: isSelectedFn,
    selectedSegments,
  } = useSegment();
  const meta = segments.find((s) => s.id === id);

  const parts = id.split("-");
  const prefix = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : id;
  const isDimmed = !!selectedPP && selectedPP !== prefix;

  // Berechne segmentIsSelected direkt aus selectedSegments
  const segmentIsSelected = React.useMemo(() => {
    if (selectedSegments) {
      return selectedSegments.has(id);
    }
    if (isSelectedFn) {
      return isSelectedFn(id);
    }
    return false;
  }, [id, isSelectedFn, selectedSegments]);

  const handleClick = () => {
    setSelected(id);
  };

  // Wende Effekte auf alle Kinder an (rekursiv)
  const processedChildren = React.Children.map(children, (child) =>
    applyPathEffects(child, segmentIsSelected, hovered, id)
  );

  return (
    <g
      id={id}
      tabIndex={0}
      onClick={handleClick}
      onFocus={() => setHovered(id)}
      onBlur={() => setHovered(null)}
      onMouseEnter={() => setHovered(id)}
      onMouseLeave={() => setHovered(null)}
      aria-label={meta?.label ?? id}
      className={[
        "svg-segment",
        segmentIsSelected ? "selected" : "",
        hovered === id ? "hovered" : "",
      ]
        .join(" ")
        .trim()}
      style={{
        cursor: "pointer",
        transition: "all 0.3s ease",
        opacity: isDimmed ? 0.2 : 1,
      }}
    >
      {processedChildren}
    </g>
  );
};

const PolizeiStrukturSVG: React.FC = () => {
  const [svgContent, setSvgContent] = React.useState<string | null>(null);
  const [svgError, setSvgError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/images/map/Regiograph-der-Polizeistruktur.svg")
      .then((response) => {
        if (!response.ok) {
          throw new Error("SVG konnte nicht geladen werden");
        }
        return response.text();
      })
      .then((text) => {
        setSvgContent(text);
      })
      .catch((error: Error) => {
        console.error("Fehler beim Laden der SVG:", error);
        setSvgError(error.message);
      });
  }, []);

  if (!svgContent) {
    return <div>Lade Karte...</div>;
  }

  if (svgError) {
    // Fallback auf hardcodierte SVG
    return (
      <svg
        viewBox="-5 -5 438.56 494.44"
        aria-label="Polizeipräsidien Baden-Württemberg"
        style={{
          width: "100%",
          height: "auto",
          maxWidth: "90%",
          margin: "0 auto",
        }}
      >
        <defs>
          <style>{`.cls-1,.cls-2,.cls-3,.cls-4{fill:none;stroke:#2a4f77;}.cls-1,.cls-4{stroke-width:.1px;}.cls-5{fill:#5daee1;stroke:#2a4f77;stroke-width:1px;}.cls-6{fill:#95d4f5;stroke:#2a4f77;stroke-width:1px;}.cls-7{fill:#5cb8e0;stroke:#2a4f77;stroke-width:1px;}.cls-8{fill:#86cdf0;stroke:#2a4f77;stroke-width:1px;}.cls-2{stroke-width:.5px;}.cls-9{fill:#81c6ef;stroke:#2a4f77;stroke-width:1px;}.cls-10{fill:#70c2eb;stroke:#2a4f77;stroke-width:1px;}.cls-11{fill:#4ea6d9;stroke:#2a4f77;stroke-width:1px;}.cls-12{fill:#9dd3f4;stroke:#2a4f77;stroke-width:1px;}.cls-13{fill:#a3d8f4;stroke:#2a4f77;stroke-width:1px;}.cls-14{fill:#8dd1f5;stroke:#2a4f77;stroke-width:1px;}.cls-15{fill:#abd5f3;stroke:#2a4f77;stroke-width:1px;}.cls-4{stroke-miterlimit:10;}.cls-16{fill:#68b8e8;stroke:#2a4f77;stroke-width:1px;}.cls-17{fill:#b5dff8;stroke:#2a4f77;stroke-width:1px;}`}</style>
        </defs>
        <text x="50%" y="50%" textAnchor="middle">
          SVG konnte nicht geladen werden
        </text>
      </svg>
    );
  }

  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
  const svgElement = svgDoc.documentElement;
  const viewBox = svgElement.getAttribute("viewBox") ?? "0 0 428.56 484.44";
  const styleContent = `.cls-1,.cls-2,.cls-3,.cls-4{fill:none;stroke:#2a4f77;stroke-width:1px;}.cls-1,.cls-4{stroke-width:.1px;}.cls-5{fill:#5daee1;stroke:#2a4f77;stroke-width:1px;}.cls-6{fill:#95d4f5;stroke:#2a4f77;stroke-width:1px;}.cls-7{fill:#5cb8e0;stroke:#2a4f77;stroke-width:1px;}.cls-8{fill:#86cdf0;stroke:#2a4f77;stroke-width:1px;}.cls-2{stroke-width:.5px;}.cls-9{fill:#81c6ef;stroke:#2a4f77;stroke-width:1px;}.cls-10{fill:#70c2eb;stroke:#2a4f77;stroke-width:1px;}.cls-11{fill:#4ea6d9;stroke:#2a4f77;stroke-width:1px;}.cls-12{fill:#9dd3f4;stroke:#2a4f77;stroke-width:1px;}.cls-13{fill:#a3d8f4;stroke:#2a4f77;stroke-width:1px;}.cls-14{fill:#8dd1f5;stroke:#2a4f77;stroke-width:1px;}.cls-15{fill:#abd5f3;stroke:#2a4f77;stroke-width:1px;}.cls-4{stroke-miterlimit:10;}.cls-16{fill:#68b8e8;stroke:#2a4f77;stroke-width:1px;}.cls-17{fill:#b5dff8;stroke:#2a4f77;stroke-width:1px;}`;

  const normalizePathId = (pathId: string): string | null => {
    if (!pathId) return null;
    // Entferne führende Unterstriche und suche nach pp- Muster
    const cleanedId = pathId.replace(/^_+/, "");
    if (!cleanedId.startsWith("pp-")) return null;
    // Extrahiere pp-[a-z]+-\d+ auch wenn danach Unterstriche folgen
    const match = /^(pp-[a-z]+-\d+)/.exec(cleanedId);
    return match?.[1] ?? null;
  };

  const renderSvgChildren = (
    node: Element,
    index: number = 0
  ): React.ReactNode => {
    if (node.tagName === "style" || node.tagName === "defs") {
      return null;
    }

    if (node.tagName === "path") {
      const pathId = node.getAttribute("id");
      if (pathId) {
        // Prüfe ob die ID (auch mit führenden Unterstrichen) ein pp- Segment ist
        const segmentId = normalizePathId(pathId);
        if (segmentId) {
          const pathProps: React.SVGProps<SVGPathElement> = {};
          Array.from(node.attributes).forEach((attr) => {
            if (
              attr.name === "id" ||
              attr.name === "class" ||
              attr.name === "d"
            ) {
              const propName = attr.name === "class" ? "className" : attr.name;
              if (
                propName === "id" ||
                propName === "className" ||
                propName === "d"
              ) {
                (pathProps as Record<string, string>)[propName] = attr.value;
              }
            }
          });
          return (
            <SVGSegment key={segmentId} id={segmentId}>
              <path {...pathProps} d={node.getAttribute("d") ?? ""} />
            </SVGSegment>
          );
        }
      }

      const regularPathProps: React.SVGProps<SVGPathElement> = {};
      Array.from(node.attributes).forEach((attr) => {
        const propName = attr.name === "class" ? "className" : attr.name;
        (regularPathProps as Record<string, string>)[propName] = attr.value;
      });
      const regularPathId = pathId ?? `path-${index}`;
      return React.createElement("path", {
        key: regularPathId,
        ...regularPathProps,
      });
    }

    if (node.tagName === "g") {
      const gId = node.getAttribute("id");
      // Prüfe ob das <g> Element eine pp- ID hat
      if (gId) {
        const normalizedId = normalizePathId(gId);
        if (normalizedId) {
          // Dieses <g> Element ist ein Segment - umhülle es mit SVGSegment
          const children = Array.from(node.children)
            .map((childNode, childIndex) => {
              const child = renderSvgChildren(childNode, childIndex);
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  key:
                    child.key ??
                    childNode.id ??
                    `${node.tagName}-child-${childIndex}`,
                });
              }
              return child;
            })
            .filter((child) => child !== null);

          const gProps: Record<string, string> = {};
          Array.from(node.attributes).forEach((attr) => {
            if (attr.name !== "id") {
              // ID wird von SVGSegment gesetzt
              const propName = attr.name === "class" ? "className" : attr.name;
              gProps[propName] = attr.value;
            }
          });

          return (
            <SVGSegment key={normalizedId} id={normalizedId}>
              <g {...gProps}>{children}</g>
            </SVGSegment>
          );
        }
      }

      // Normales <g> Element ohne pp- ID - rekursiv verarbeiten
      const children = Array.from(node.children)
        .map((childNode, childIndex) => {
          const child = renderSvgChildren(childNode, childIndex);
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              key:
                child.key ??
                childNode.id ??
                `${node.tagName}-child-${childIndex}`,
            });
          }
          return child;
        })
        .filter((child) => child !== null);
      const props: Record<string, string> = {};
      Array.from(node.attributes).forEach((attr) => {
        const propName = attr.name === "class" ? "className" : attr.name;
        props[propName] = attr.value;
      });
      return React.createElement(
        node.tagName,
        { key: node.id ?? `${node.tagName}-${index}`, ...props },
        children
      );
    }

    if (
      node.tagName === "polygon" ||
      node.tagName === "circle" ||
      node.tagName === "rect"
    ) {
      const children = Array.from(node.children)
        .map((childNode, childIndex) => {
          const child = renderSvgChildren(childNode, childIndex);
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              key:
                child.key ??
                childNode.id ??
                `${node.tagName}-child-${childIndex}`,
            });
          }
          return child;
        })
        .filter((child) => child !== null);
      const props: Record<string, string> = {};
      Array.from(node.attributes).forEach((attr) => {
        const propName = attr.name === "class" ? "className" : attr.name;
        props[propName] = attr.value;
      });
      return React.createElement(
        node.tagName,
        { key: node.id ?? `${node.tagName}-${index}`, ...props },
        children
      );
    }

    const children = Array.from(node.children)
      .map((childNode, childIndex) => {
        const child = renderSvgChildren(childNode, childIndex);
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            key:
              child.key ??
              childNode.id ??
              `${node.tagName}-child-${childIndex}`,
          });
        }
        return child;
      })
      .filter((child) => child !== null);
    if (children.length === 0) return null;
    return React.createElement(
      node.tagName,
      { key: node.id ?? `${node.tagName}-${index}` },
      children
    );
  };

  const svgChildren = Array.from(svgElement.children)
    .map((node, index) => {
      const child = renderSvgChildren(node, index);
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          key: child.key ?? node.id ?? `svg-child-${index}`,
        });
      }
      return child;
    })
    .filter((child) => child !== null);

  return (
    <svg
      viewBox={viewBox}
      aria-label="Polizeipräsidien Baden-Württemberg"
      style={{
        width: "100%",
        height: "auto",
        maxWidth: "90%",
        margin: "0 auto",
      }}
    >
      <defs>
        <style dangerouslySetInnerHTML={{ __html: styleContent }} />
      </defs>
      {svgChildren}
    </svg>
  );
};

const PPFilterPanel: React.FC = () => {
  const { selectedPP, setSelectedPP } = useSegment();
  const ppList = Array.from(
    new Set(
      segments.map((s) => {
        const parts = s.id.split("-");
        return parts.length >= 2 ? `${parts[0]}-${parts[1]}` : s.id;
      })
    )
  ).sort();
  const displayPP = (pp: string) => pp.replace(/^pp-/, "PP ").toUpperCase();
  return (
    <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
      <button
        type="button"
        onClick={() => setSelectedPP(null)}
        style={{
          padding: "4px 8px",
          border: selectedPP === null ? "2px solid #032a5e" : "1px solid #ccc",
          borderRadius: 4,
          background: selectedPP === null ? "#cce5ff" : "#f5f5f5",
          cursor: "pointer",
        }}
      >
        Alle
      </button>
      {ppList.map((pp) => (
        <button
          key={pp}
          type="button"
          onClick={() => setSelectedPP(selectedPP === pp ? null : pp)}
          style={{
            padding: "4px 8px",
            border: selectedPP === pp ? "2px solid #032a5e" : "1px solid #ccc",
            borderRadius: 4,
            background: selectedPP === pp ? "#cce5ff" : "#f5f5f5",
            cursor: "pointer",
          }}
        >
          {displayPP(pp)}
        </button>
      ))}
    </div>
  );
};

const LiveInfoPanel: React.FC = () => {
  const { selected, hovered } = useSegment();
  const selectedLabel =
    segments.find((s) => s.id === selected)?.label ?? "Keins";
  const hoveredLabel = segments.find((s) => s.id === hovered)?.label ?? "Keins";
  return (
    <div
      style={{
        marginTop: 8,
        padding: 8,
        background: "#e6f3fc",
        borderRadius: 4,
        fontSize: 14,
      }}
    >
      <span>
        Aktuelles Segment: <strong>{selectedLabel}</strong>
      </span>
      <br />
      <span>
        Hover: <strong>{hoveredLabel}</strong>
      </span>
    </div>
  );
};

export const PolizeiSVGComplete: React.FC<{
  showPPFilter?: boolean;
  showInfoPanel?: boolean;
  selectedSegments?: Set<string>;
  onSegmentToggle?: (segmentId: string) => void;
}> = ({
  showPPFilter = false,
  showInfoPanel = false,
  selectedSegments,
  onSegmentToggle,
}) => {
  // Force re-render when selectedSegments changes
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    forceUpdate();
  }, [selectedSegments]);

  return (
    <SegmentProvider
      selectedSegments={selectedSegments}
      onSegmentToggle={onSegmentToggle}
    >
      {showPPFilter && <PPFilterPanel />}
      <PolizeiStrukturSVG />
      {showInfoPanel && <LiveInfoPanel />}
    </SegmentProvider>
  );
};
