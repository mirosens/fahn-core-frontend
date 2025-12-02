"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FlipCard } from "@/components/fahndungen/FlipCard";
import { FahndungModal } from "@/components/fahndungen/FahndungModal";
import { typo3Client, type FahndungItem } from "@/lib/typo3Client";

export function FahndungenPageClient() {
  const [selectedFahndung, setSelectedFahndung] = useState<FahndungItem | null>(
    null
  );
  const [fahndungen, setFahndungen] = useState<FahndungItem[]>([]);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchFahndungen = async () => {
      const fahndungenResponse = await typo3Client.getFahndungen(searchParams);
      setFahndungen(fahndungenResponse.items);
    };

    fetchFahndungen();
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div id="fahndungskarten-start" className="scroll-mt-32">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {fahndungen.map((fahndung) => (
            <FlipCard
              key={fahndung.id}
              fahndung={fahndung}
              onDetailsClick={() => setSelectedFahndung(fahndung)}
            />
          ))}
        </div>

        {selectedFahndung && (
          <FahndungModal
            fahndung={selectedFahndung}
            isOpen={!!selectedFahndung}
            onClose={() => setSelectedFahndung(null)}
          />
        )}
      </div>
    </div>
  );
}
