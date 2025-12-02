// app/page.tsx - Startseite mit allen Fahndungen
import { Suspense } from "react";
import HomeContent from "@/components/home/HomeContent";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-64 rounded-lg bg-muted" />
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
