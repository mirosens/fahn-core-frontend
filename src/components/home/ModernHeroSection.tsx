"use client";

import { motion } from "framer-motion";
import { FahndungenCarousel } from "./hero/FahndungenCarousel";
import type { FahndungItem } from "@/lib/typo3Client";

interface ModernHeroSectionProps {
  fahndungen: FahndungItem[];
}

/**
 * ModernHeroSection - Haupt-Komponente für die Hero-Section
 * Zeigt die Featured Fahndungen
 */
export function ModernHeroSection({ fahndungen }: ModernHeroSectionProps) {
  return (
    <section className="relative min-h-[500px] lg:min-h-[600px] bg-transparent">
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-16 pb-4 lg:pb-6">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
          className="text-center mb-6 lg:mb-8 will-change-transform"
        >
          <h1
            className="text-[clamp(1.75rem,4vw,2.75rem)] font-inter leading-tight tracking-tight"
            style={{ fontVariationSettings: '"wght" 900', fontWeight: 900 }}
          >
            <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-blue-700 dark:from-white dark:via-blue-300 dark:to-cyan-300 bg-clip-text text-transparent">
              Die Polizei bittet um Ihre Mithilfe!
            </span>
          </h1>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <FahndungenCarousel
              category="missing"
              title="Vermisste Personen"
              subtitle="Wir brauchen Ihre Hinweise"
              fahndungen={fahndungen}
            />
            <FahndungenCarousel
              category="wanted"
              title="Gesuchte Straftäter"
              subtitle="Haben Sie diese Person gesehen?"
              fahndungen={fahndungen}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ModernHeroSection;
