import { Suspense } from "react";
import { FahndungenPageClient } from "./FahndungenPageClient";

export default function FahndungenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FahndungenPageClient />
    </Suspense>
  );
}
