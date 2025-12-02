import { z } from "zod";
import type { WizardData } from "@/components/fahndungen/wizard/types/WizardTypes";

export const step1Schema = z
  .object({
    category: z.enum(
      ["WANTED_PERSON", "MISSING_PERSON", "UNKNOWN_DEAD", "STOLEN_GOODS"],
      {
        message: "Bitte eine Kategorie auswählen.",
      }
    ),
    office: z.string().min(1, "Bitte Dienststelle auswählen."),
    customOffice: z.string().optional(),
    eventTime: z.string().min(1, "Bitte Ereigniszeit angeben."),
    delikt: z.string().optional(),
    title: z
      .string()
      .min(5, "Titel muss mindestens 5 Zeichen haben")
      .max(100, "Titel darf maximal 100 Zeichen haben"),
    caseNumber: z.string().optional(),
    variant: z.string().optional(),
    department: z.string().optional(),
    caseDate: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.office === "Andere Dienststelle" && !val.customOffice) {
      ctx.addIssue({
        path: ["customOffice"],
        code: z.ZodIssueCode.custom,
        message: "Bitte Dienststelle angeben.",
      });
    }
    if (
      (val.category === "WANTED_PERSON" || val.category === "STOLEN_GOODS") &&
      !val.delikt
    ) {
      ctx.addIssue({
        path: ["delikt"],
        code: z.ZodIssueCode.custom,
        message: "Bitte Delikt auswählen.",
      });
    }
  });

export const step2Schema = z.object({
  sachverhalt: z
    .string()
    .min(10, "Sachverhalt muss mindestens 10 Zeichen haben")
    .max(5000, "Sachverhalt darf maximal 5000 Zeichen haben"),
  personenbeschreibung: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  features: z.string().optional(),
});

export const step3Schema = z
  .object({
    mainImage: z.any().optional(),
    mainImageUrl: z.string().optional(),
    cover_media_id: z.string().optional(),
    video: z.any().optional(),
    videoUrl: z.string().optional(),
    video_media_id: z.string().optional(),
    additionalImages: z.array(z.any()).optional(),
    additionalImageUrls: z.array(z.string()).optional(),
    allMedia: z.array(z.any()).optional(),
    documents: z.array(z.any()).optional(),
  })
  .refine(
    (data) => {
      const hasMainImageString =
        Boolean(data.mainImage) &&
        (typeof data.mainImage === "string" ? data.mainImage.length > 0 : true);

      const hasMainImageUrl =
        Boolean(data.mainImageUrl) &&
        typeof data.mainImageUrl === "string" &&
        data.mainImageUrl.length > 0;

      const hasCoverMediaId =
        Boolean(data.cover_media_id) &&
        typeof data.cover_media_id === "string" &&
        data.cover_media_id.length > 0;

      const hasAllMedia =
        data.allMedia &&
        Array.isArray(data.allMedia) &&
        data.allMedia.length > 0 &&
        data.allMedia.some((media: unknown) => {
          if (typeof media === "object" && media !== null) {
            const mediaObj = media as { url?: unknown; id?: unknown };
            return Boolean(
              (typeof mediaObj.url === "string" && mediaObj.url.length > 0) ||
              (typeof mediaObj.id === "string" && mediaObj.id.length > 0)
            );
          }
          return false;
        });

      return Boolean(
        hasMainImageString ?? hasMainImageUrl ?? hasCoverMediaId ?? hasAllMedia
      );
    },
    {
      message: "Mindestens ein Hauptbild ist erforderlich",
      path: ["mainImageUrl"],
    }
  );

export const step4Schema = z
  .object({
    mainLocation: z
      .object({
        id: z.string(),
        address: z.string().min(1, "Adresse ist erforderlich"),
        lat: z.number(),
        lng: z.number(),
        type: z.enum([
          "main",
          "tatort",
          "wohnort",
          "arbeitsplatz",
          "sichtung",
          "sonstiges",
        ]),
        description: z.string().optional(),
        timestamp: z.date().optional(),
      })
      .nullable(),
    additionalLocations: z
      .array(
        z.object({
          id: z.string(),
          lat: z.number(),
          lng: z.number(),
          address: z.string(),
          type: z.enum([
            "main",
            "tatort",
            "wohnort",
            "arbeitsplatz",
            "sichtung",
            "sonstiges",
          ]),
          description: z.string().optional(),
          timestamp: z.date().optional(),
        })
      )
      .optional()
      .default([]),
  })
  .refine(
    (data) => data.mainLocation !== null && data.mainLocation !== undefined,
    {
      message: "Bitte geben Sie einen Standort an (Pflichtfeld)",
      path: ["mainLocation"],
    }
  );

export const step5Schema = z.object({
  contactPerson: z.string().min(1, "Kontaktperson erforderlich"),
  contactPhone: z.string().optional().default(""),
  contactEmail: z
    .string()
    .optional()
    .default("")
    .refine(
      (email) => email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      {
        message: "Ungültige E-Mail-Adresse",
      }
    ),
  organizationalUnit: z.string().min(1, "Organisationseinheit erforderlich"),
  publishStatus: z
    .enum(["draft", "review", "scheduled", "immediate"])
    .optional()
    .default("draft"),
  scheduledDate: z.string().optional(),
  deletionDate: z.string().optional(),
  reminderDate: z.string().optional(),
  reminderEmail: z
    .string()
    .optional()
    .refine(
      (email) =>
        !email || email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      {
        message: "Ungültige E-Mail-Adresse für Erinnerung",
      }
    ),
  urgencyLevel: z
    .enum(["low", "medium", "high", "critical"])
    .optional()
    .default("medium"),
  requiresApproval: z.boolean().optional().default(false),
  visibility: z
    .object({
      internal: z.boolean().optional().default(true),
      regional: z.boolean().optional().default(false),
      national: z.boolean().optional().default(false),
      international: z.boolean().optional().default(false),
    })
    .optional()
    .default({
      internal: true,
      regional: false,
      national: false,
      international: false,
    }),
  notifications: z
    .object({
      emailAlerts: z.boolean().optional().default(false),
      smsAlerts: z.boolean().optional().default(false),
      appNotifications: z.boolean().optional().default(false),
      pressRelease: z.boolean().optional().default(false),
    })
    .optional()
    .default({
      emailAlerts: false,
      smsAlerts: false,
      appNotifications: false,
      pressRelease: false,
    }),
  heroSettings: z
    .object({
      enabled: z.boolean().default(false),
      position: z.number().min(1).max(3).optional(),
      displayMode: z.enum(["unlimited", "time_limited"]).default("unlimited"),
      validUntil: z.string().datetime().optional(),
    })
    .optional()
    .default({
      enabled: false,
      position: 1,
      displayMode: "unlimited",
    }),
  department: z.string().optional(),
  availableHours: z.string().optional(),
});

export const validateStep = (
  step: number,
  data: Partial<WizardData>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  let isValid = false;

  try {
    switch (step) {
      case 1:
        step1Schema.parse(data.step1);
        isValid = true;
        break;
      case 2:
        step2Schema.parse(data.step2);
        isValid = true;
        break;
      case 3:
        if (!data.step3) {
          errors.push("Step 3 Daten sind nicht initialisiert");
          break;
        }
        try {
          step3Schema.parse(data.step3);
          isValid = true;
        } catch (validationError) {
          if (validationError instanceof z.ZodError) {
            for (const e of validationError.errors) {
              if (e.message) {
                errors.push(e.message);
              }
            }
          }
          isValid = false;
        }
        break;
      case 4:
        step4Schema.parse(data.step4);
        isValid = true;
        break;
      case 5:
        step5Schema.parse(data.step5);
        isValid = true;
        break;
      default:
        isValid = true;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      for (const e of error.errors) {
        if (e.message) {
          errors.push(e.message);
        }
      }
    }
  }

  return { isValid, errors };
};
