"use client";

import { useState } from "react";
import { Plus, ArrowRight, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NeueFahndungPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    date: "",
  });

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Provisorische Submit-Logik
    alert("Fahndung würde gespeichert werden (provisorisch)");
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Plus className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Neue Fahndung erstellen
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Schritt-für-Schritt-Assistent zur Erstellung einer neuen Fahndung
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div key={index} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index + 1 <= currentStep
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                {index + 1 < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    index + 1 < currentStep ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-muted-foreground text-center">
          Schritt {currentStep} von {totalSteps}
        </div>
      </div>

      {/* Form Content */}
      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Grundinformationen</h2>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Titel der Fahndung
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="z.B. Vermisste Person"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Kategorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => updateFormData("category", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Bitte wählen...</option>
                <option value="vermisst">Vermisste Person</option>
                <option value="fahndung">Fahndung</option>
                <option value="zeuge">Zeugenaufruf</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Beschreibung</h2>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Beschreibung
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Detaillierte Beschreibung der Fahndung..."
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Ort</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateFormData("location", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="z.B. Stuttgart"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Zusammenfassung</h2>
            <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Titel:
                </span>
                <p className="text-foreground">{formData.title || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Kategorie:
                </span>
                <p className="text-foreground">{formData.category || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Beschreibung:
                </span>
                <p className="text-foreground">{formData.description || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Ort:
                </span>
                <p className="text-foreground">{formData.location || "-"}</p>
              </div>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Hinweis:</strong> Dies ist eine provisorische
                Wizard-Ansicht. Die finale Implementierung erfolgt in einer
                späteren Phase.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 1 && (
            <button
              onClick={handlePrevious}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück
            </button>
          )}
        </div>
        <div className="flex gap-3">
          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Weiter
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Check className="h-4 w-4" />
              Fahndung erstellen
            </button>
          )}
        </div>
      </div>

      {/* Cancel Link */}
      <div className="mt-6 text-center">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Abbrechen und zurück zum Dashboard
        </Link>
      </div>
    </div>
  );
}
