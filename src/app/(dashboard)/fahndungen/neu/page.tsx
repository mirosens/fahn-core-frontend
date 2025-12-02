"use client";

import { useState, useMemo, useCallback, useDeferredValue } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Eye,
  FileText,
  CreditCard,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Step1Component from "@/components/fahndungen/wizard/steps/Step1Component";
import Step2Component from "@/components/fahndungen/wizard/steps/Step2Component";
import Step3Component from "@/components/fahndungen/wizard/steps/Step3Component";
import Step4Component from "@/components/fahndungen/wizard/steps/Step4Component";
import Step5Component from "@/components/fahndungen/wizard/steps/Step5Component";
import Step6Component from "@/components/fahndungen/wizard/steps/Step6Component";
import LivePreviewCard from "@/components/fahndungen/wizard/preview/LivePreviewCard";
import type { WizardData } from "@/components/fahndungen/wizard/types/WizardTypes";
import { useResponsive } from "@/hooks/useResponsive";
import { validateStep } from "@/lib/validation/wizardValidation";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PREVIEW_MODES = [
  { id: "card", label: "Karte", icon: CreditCard },
] as const;

// Preview Tabs Component - defined outside to avoid recreation during render
interface PreviewTabsProps {
  previewMode: (typeof PREVIEW_MODES)[number]["id"];
  setPreviewMode: (mode: (typeof PREVIEW_MODES)[number]["id"]) => void;
  isMobile: boolean;
}

const PreviewTabs = ({
  previewMode,
  setPreviewMode,
  isMobile,
}: PreviewTabsProps) => (
  <div className="flex justify-around border-b border-border dark:border-border">
    {PREVIEW_MODES.map((mode) => (
      <button
        key={mode.id}
        onClick={() => setPreviewMode(mode.id)}
        className={`flex flex-1 items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-colors ${
          previewMode === mode.id
            ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
            : "text-muted-foreground hover:text-muted-foreground dark:text-muted-foreground"
        }`}
      >
        <mode.icon className="h-4 w-4" />
        <span className={isMobile ? "hidden" : ""}>{mode.label}</span>
      </button>
    ))}
  </div>
);

// Responsive Progress Indicator Component - defined outside to avoid recreation during render
interface ResponsiveProgressIndicatorProps {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  currentStep: number;
  steps: Array<{
    id: number;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    shortLabel: string;
  }>;
  showProgressDetails: boolean;
  setShowProgressDetails: (show: boolean) => void;
}

const ResponsiveProgressIndicator = ({
  isMobile,
  isTablet,
  isDesktop,
  currentStep,
  steps,
  showProgressDetails,
  setShowProgressDetails,
}: ResponsiveProgressIndicatorProps) => {
  if (isMobile) {
    return (
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Schritt {currentStep} von {steps.length}
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.round((currentStep / steps.length) * 100)}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
        <button
          onClick={() => setShowProgressDetails(!showProgressDetails)}
          className="mt-2 flex w-full items-center justify-between rounded-lg border border-border bg-white p-3 text-left dark:border-border dark:bg-muted"
        >
          <span className="text-sm font-medium">
            {steps[currentStep - 1]?.label}
          </span>
          {showProgressDetails ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {showProgressDetails && (
          <div className="mt-2 space-y-1">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center rounded-lg p-2 text-xs ${
                  currentStep === step.id
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : currentStep > step.id
                      ? "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                <div
                  className={`mr-2 flex h-6 w-6 items-center justify-center rounded-full ${
                    currentStep >= step.id
                      ? "bg-blue-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <step.icon className="h-3 w-3" />
                  )}
                </div>
                <span className="font-medium">{step.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (isTablet) {
    return (
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Fortschritt: {currentStep} von {steps.length} Schritten
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round((currentStep / steps.length) * 100)}% abgeschlossen
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  currentStep >= step.id
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-border bg-white text-muted-foreground dark:border-border dark:bg-muted"
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={`ml-1 text-xs font-medium ${
                  currentStep >= step.id
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-muted-foreground"
                }`}
              >
                {step.shortLabel}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-1 w-8 ${
                    currentStep > step.id
                      ? "bg-blue-500"
                      : "bg-muted dark:bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop Progress Indicator
  if (isDesktop) {
    return (
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
            Fortschritt: {currentStep} von {steps.length} Schritten
          </span>
          <span className="text-sm text-muted-foreground dark:text-muted-foreground">
            {Math.round((currentStep / steps.length) * 100)}% abgeschlossen
          </span>
        </div>
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border-2 ${
                  currentStep >= step.id
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-border bg-white text-muted-foreground dark:border-border dark:bg-muted"
                }`}
                style={{
                  height: "44px",
                  width: "44px",
                  minHeight: "44px",
                  minWidth: "44px",
                }}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  currentStep >= step.id
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`mx-4 h-1 w-16 ${
                    currentStep > step.id
                      ? "bg-blue-500"
                      : "bg-muted dark:bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default function NeueFahndungPage() {
  const router = useRouter();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] =
    useState<(typeof PREVIEW_MODES)[number]["id"]>("card");
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [triedNext, setTriedNext] = useState(false);
  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProgressDetails, setShowProgressDetails] = useState(false);

  const [wizardData, setWizardData] = useState<Partial<WizardData>>({
    step1: {
      title: "",
      category: "",
      caseNumber: "",
      office: "",
      eventTime: "",
    },
    step2: {
      sachverhalt: "",
      personenbeschreibung: "",
    },
    step3: {
      video: null,
      documents: [],
    },
    step4: {
      mainLocation: null,
      additionalLocations: [],
    },
    step5: {
      contactPerson: "",
      contactPhone: "",
      contactEmail: "",
      organizationalUnit: "",
      publishStatus: "draft",
      urgencyLevel: "medium",
      requiresApproval: false,
      visibility: {
        internal: true,
        regional: false,
        national: false,
        international: false,
      },
      notifications: {
        emailAlerts: false,
        smsAlerts: false,
        appNotifications: false,
        pressRelease: false,
      },
    },
  });

  const steps = [
    { id: 1, label: "Grundinfo", icon: FileText, shortLabel: "Grundinfo" },
    { id: 2, label: "Beschreibung", icon: Eye, shortLabel: "Beschreibung" },
    { id: 3, label: "Medien", icon: FileText, shortLabel: "Medien" },
    { id: 4, label: "Ort", icon: Eye, shortLabel: "Ort" },
    { id: 5, label: "Kontakt", icon: Eye, shortLabel: "Kontakt" },
    {
      id: 6,
      label: "Zusammenfassung",
      icon: Check,
      shortLabel: "Zusammenfassung",
    },
  ];

  const deferredWizardData = useDeferredValue(wizardData);

  const updateStepData = useCallback(
    (step: keyof WizardData, data: WizardData[keyof WizardData]) => {
      setWizardData((prev) => ({
        ...prev,
        [step]: data,
      }));
      setTriedNext(false);
    },
    []
  );

  // Schrittvalidierung
  const currentValidation = useMemo(() => {
    try {
      return validateStep(currentStep, wizardData);
    } catch {
      return { isValid: false, errors: ["Validierungsfehler aufgetreten"] };
    }
  }, [currentStep, wizardData]);

  const canProceed = useMemo(() => {
    try {
      return currentValidation.isValid;
    } catch {
      return false;
    }
  }, [currentValidation]);

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();

      if (currentStep >= 6) {
        return;
      }

      if (canProceed) {
        try {
          setCurrentStep(currentStep + 1);
          setTriedNext(false);
          setStepErrors([]);
          return;
        } catch {
          return;
        }
      }

      setTriedNext(true);
      setStepErrors(currentValidation.errors);
    },
    [currentStep, canProceed, currentValidation.errors]
  );

  const handlePrevious = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();

      if (currentStep <= 1) {
        return;
      }
      try {
        setCurrentStep(currentStep - 1);
        setTriedNext(false);
        setStepErrors([]);
      } catch {
        // Fehler wird still behandelt
      }
    },
    [currentStep]
  );

  // Floating Navigation
  const FloatingNavigation = useMemo(() => {
    const onPreviousClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (currentStep > 1) {
        handlePrevious(e);
      }
    };

    const onNextClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (currentStep < 6 && canProceed) {
        handleNext(e);
      }
    };

    return (
      <section
        className="fixed bottom-0 left-0 right-0 z-[100] border-t border-border bg-white shadow-lg dark:border-border dark:bg-muted"
        style={{ pointerEvents: "auto" }}
        aria-label="Navigation"
      >
        <div
          className={cn(
            "flex items-center justify-between",
            isMobile ? "p-3" : isDesktop ? "mx-auto max-w-7xl px-4 py-4" : "p-4"
          )}
        >
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={onPreviousClick}
              disabled={currentStep <= 1}
              className={cn(
                "flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/80 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted/80",
                "min-h-[48px] min-w-[48px] touch-manipulation",
                isMobile ? "px-3" : "px-4"
              )}
              aria-label={`Zurück zu Schritt ${currentStep - 1}`}
              style={{ pointerEvents: "auto" }}
            >
              <ArrowLeft className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
              {!isMobile && <span>Zurück</span>}
            </button>
          ) : (
            <div className={cn("min-w-[48px]", !isMobile && "min-w-[100px]")} />
          )}

          <div
            className={cn("flex-1", isMobile ? "px-3" : "px-4")}
            style={{ pointerEvents: "none" }}
          >
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
            <p
              className={cn(
                "mt-1 text-center text-muted-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              {isMobile
                ? `${currentStep} von ${steps.length}`
                : `Schritt ${currentStep} von ${steps.length}`}
            </p>
          </div>

          <button
            type="button"
            onClick={onNextClick}
            disabled={currentStep >= 6 || !canProceed}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 touch-manipulation",
              "min-h-[48px] min-w-[48px]",
              currentStep < 6 && canProceed
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "cursor-not-allowed bg-muted text-muted-foreground",
              isMobile ? "px-3" : "px-4"
            )}
            aria-label={`Weiter zu Schritt ${currentStep + 1}`}
            style={{ pointerEvents: "auto" }}
          >
            {!isMobile && <span>Weiter</span>}
            <ArrowRight className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
          </button>
        </div>
      </section>
    );
  }, [
    currentStep,
    canProceed,
    isMobile,
    isDesktop,
    steps.length,
    handleNext,
    handlePrevious,
  ]);

  const renderPreviewContent = () => (
    <div className="space-y-4">
      <h3 className="text-center text-lg font-semibold text-muted-foreground dark:text-white">
        Live-Vorschau Ihrer Fahndungskarte
      </h3>
      <LivePreviewCard data={deferredWizardData} />
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          wizardData.step1 && (
            <Step1Component
              data={wizardData.step1}
              onChange={(data) => updateStepData("step1", data)}
              wizard={wizardData}
              showValidation={triedNext}
            />
          )
        );
      case 2:
        return (
          wizardData.step2 && (
            <Step2Component
              data={wizardData.step2}
              onChange={(data) => updateStepData("step2", data)}
              wizard={wizardData}
              showValidation={triedNext}
            />
          )
        );
      case 3:
        return (
          wizardData.step3 && (
            <Step3Component
              data={wizardData.step3}
              onChange={(data) => updateStepData("step3", data)}
              wizard={wizardData}
              showValidation={triedNext}
            />
          )
        );
      case 4:
        return (
          wizardData.step4 && (
            <Step4Component
              data={wizardData.step4}
              onChange={(data) => updateStepData("step4", data)}
              wizard={wizardData}
              showValidation={triedNext}
            />
          )
        );
      case 5:
        return (
          wizardData.step5 && (
            <Step5Component
              data={wizardData.step5}
              onChange={(data) => updateStepData("step5", data)}
              wizard={wizardData}
              showValidation={triedNext}
            />
          )
        );
      case 6:
        return (
          wizardData.step1 &&
          wizardData.step2 &&
          wizardData.step3 &&
          wizardData.step4 &&
          wizardData.step5 && (
            <Step6Component
              data={wizardData as WizardData}
              showPreview={showMobilePreview}
              onTogglePreview={() => setShowMobilePreview(!showMobilePreview)}
              showValidation={triedNext}
            />
          )
        );
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Unbekannter Schritt</h2>
            <p className="text-muted-foreground">
              Bitte wählen Sie einen gültigen Schritt aus.
            </p>
          </div>
        );
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-muted dark:bg-muted" data-wizard-container>
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-40 border-b border-border bg-white dark:border-border dark:bg-muted">
          <div className="flex items-center justify-between p-3">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground dark:text-muted-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm">Zurück</span>
            </button>

            <div className="flex flex-col items-center">
              <h2 className="text-sm font-semibold">
                {steps[currentStep - 1]?.label}
              </h2>
              <p className="text-xs text-muted-foreground">
                Schritt {currentStep} von {steps.length}
              </p>
            </div>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-1"
            >
              {showMobileMenu ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="border-t border-border bg-white p-3 dark:border-border dark:bg-muted">
              <div className="space-y-2">
                {steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => {
                      setCurrentStep(step.id);
                      setShowMobileMenu(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg p-3 text-left ${
                      currentStep === step.id
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        currentStep >= step.id
                          ? "bg-blue-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <step.icon className="h-4 w-4" />
                      )}
                    </div>
                    <span className="font-medium">{step.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tablet Header */}
      {isTablet && (
        <div className="sticky top-0 z-40 border-b border-border bg-white dark:border-border dark:bg-muted">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground dark:text-muted-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Zurück</span>
            </button>
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-semibold">
                {steps[currentStep - 1]?.label}
              </h2>
              <p className="text-sm text-muted-foreground">
                Schritt {currentStep} von {steps.length}
              </p>
            </div>
            <div className="w-20" />
          </div>
        </div>
      )}

      {/* Desktop Header */}
      {isDesktop && (
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-muted-foreground dark:text-muted-foreground dark:hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Zurück zur Startseite</span>
              </button>
            </div>
            <h1 className="text-3xl font-bold text-muted-foreground dark:text-white">
              Neue Fahndung erstellen
            </h1>
            <p className="mt-2 text-muted-foreground dark:text-muted-foreground">
              Erstellen Sie eine neue Fahndung mit unserem erweiterten Wizard
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={cn(isDesktop ? "mx-auto max-w-7xl px-4" : "px-3")}>
        {/* Progress Indicator */}
        {!isMobile && (
          <ResponsiveProgressIndicator
            isMobile={isMobile}
            isTablet={isTablet}
            isDesktop={isDesktop}
            currentStep={currentStep}
            steps={steps}
            showProgressDetails={showProgressDetails}
            setShowProgressDetails={setShowProgressDetails}
          />
        )}

        {/* Mobile Layout */}
        {isMobile && (
          <div className="flex min-h-screen flex-col">
            <div className="flex-1 pb-32">
              <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-muted">
                {stepErrors.length > 0 && triedNext && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900 dark:text-red-200">
                    <ul className="list-disc pl-5">
                      {stepErrors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {renderCurrentStep()}
              </div>

              {/* Mobile Preview Toggle */}
              <button
                onClick={() => setShowMobilePreview(!showMobilePreview)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-muted py-3 dark:bg-muted"
              >
                <Eye className="h-4 w-4" />
                <span className="text-sm">
                  Vorschau {showMobilePreview ? "ausblenden" : "anzeigen"}
                </span>
              </button>

              {/* Mobile Preview */}
              {showMobilePreview && (
                <div className="mt-4 rounded-lg bg-white shadow-sm dark:bg-muted">
                  <PreviewTabs
                    previewMode={previewMode}
                    setPreviewMode={setPreviewMode}
                    isMobile={isMobile}
                  />
                  <div className="p-4">{renderPreviewContent()}</div>
                </div>
              )}
            </div>
            {FloatingNavigation}
          </div>
        )}

        {/* Tablet Layout */}
        {isTablet && (
          <div className="flex min-h-screen flex-col">
            <div className="flex-1 pb-24">
              <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-muted">
                {stepErrors.length > 0 && triedNext && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900 dark:text-red-200">
                    <ul className="list-disc pl-5">
                      {stepErrors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {renderCurrentStep()}
              </div>

              {/* Tablet Preview Toggle */}
              <button
                onClick={() => setShowMobilePreview(!showMobilePreview)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-muted py-3 dark:bg-muted"
              >
                <Eye className="h-4 w-4" />
                <span>
                  Vorschau {showMobilePreview ? "ausblenden" : "anzeigen"}
                </span>
              </button>

              {/* Tablet Preview */}
              {showMobilePreview && (
                <div className="mt-4 rounded-lg bg-white shadow-sm dark:bg-muted">
                  <PreviewTabs
                    previewMode={previewMode}
                    setPreviewMode={setPreviewMode}
                    isMobile={isMobile}
                  />
                  <div className="p-6">{renderPreviewContent()}</div>
                </div>
              )}
            </div>
            {FloatingNavigation}
          </div>
        )}

        {/* Desktop Layout */}
        {isDesktop && (
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
            {/* Main Content */}
            <div className="xl:col-span-2">
              <div className="rounded-lg bg-white p-8 shadow-sm dark:bg-muted pb-24">
                {stepErrors.length > 0 && triedNext && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900 dark:text-red-200">
                    <ul className="list-disc pl-5">
                      {stepErrors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {renderCurrentStep()}
              </div>
            </div>

            {/* Preview Sidebar */}
            <div className="xl:col-span-1">
              <div className="sticky top-8">
                <div className="rounded-lg bg-white shadow-sm dark:bg-muted">
                  <PreviewTabs
                    previewMode={previewMode}
                    setPreviewMode={setPreviewMode}
                    isMobile={isMobile}
                  />
                  <div className="p-6">{renderPreviewContent()}</div>
                </div>
              </div>
            </div>
            {FloatingNavigation}
          </div>
        )}
      </div>
    </div>
  );
}
