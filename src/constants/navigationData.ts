import type { ComponentType, SVGProps } from "react";
import {
  Plus,
  LayoutDashboard,
  Phone,
  Accessibility,
  LogIn,
  Monitor,
  Clock,
  Globe,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  description?: string;
  urgent?: boolean;
  badge?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  requiresAuth?: boolean;
  authOnly?: boolean;
  isAuthSection?: boolean;
  external?: boolean;
}

export type NavSection = "Service";

export const navigationData: Record<NavSection, NavItem[]> = {
  Service: [
    // Service-Einträge
    {
      label: "Onlinewache",
      href: "https://www.polizei-bw.de/onlinewache/",
      description: "Online-Anzeige erstatten",
      icon: Monitor,
      urgent: false,
      external: true,
    },
    {
      label: "Notruf",
      href: "/notruf",
      description: "24-Stunden Erreichbarkeiten",
      icon: Clock,
      urgent: true,
    },
    {
      label: "Kontakt zur Polizei",
      href: "/kontakt",
      description: "Notrufnummern und Dienststellen",
      icon: Phone,
      urgent: true,
    },
    {
      label: "Barrierefreiheit",
      href: "/barrierefreiheit",
      description: "Leichte Sprache und Gebärdensprache",
      icon: Accessibility,
      urgent: false,
    },
    {
      label: "Fahndungslinks",
      href: "/fahndungen/partner",
      description:
        "Weitere Fahndungsseiten - Bundesländer, BKA und internationale Partner",
      icon: Globe,
      urgent: false,
    },
    // Dashboard und Fahndungen (nur für angemeldete Benutzer)
    {
      label: "Dashboard",
      href: "/dashboard",
      description: "Fahndungs-Dashboard und Statistiken",
      icon: LayoutDashboard,
      urgent: false,
      requiresAuth: true,
    },
    {
      label: "Neue Fahndung",
      href: "/fahndungen/neu",
      description: "Neue Fahndung erstellen",
      icon: Plus,
      urgent: true,
      badge: "NEU",
      requiresAuth: true,
    },
    // Authentifizierung - Separater Bereich unten
    {
      label: "Anmelden",
      href: "/login",
      description: "Als Polizeibeamter anmelden",
      icon: LogIn,
      urgent: false,
      authOnly: true,
      isAuthSection: true,
    },
  ],
};

// Legacy navigation items für Kompatibilität
export const navigationItems = [
  {
    title: "Start",
    href: "/",
    public: true,
    description: "Startseite mit aktuellen Fahndungen",
  },
  {
    title: "Hinweise",
    href: "/hinweise",
    public: true,
    description: "Hinweise zu Fahndungen melden",
  },
  {
    title: "Informationen",
    href: "/informationen",
    public: true,
    description: "Wichtige Informationen und Kontakt",
  },
] as const;

// Type helpers for type safety
export type NavigationItem = (typeof navigationItems)[number];
export type NavigationHref = NavigationItem["href"];

// Helper function to get navigation item by href
export function getNavigationItem(href: string): NavigationItem | undefined {
  return navigationItems.find((item) => item.href === href);
}

// Helper function to check if current page matches navigation item
export function isActiveNavigation(href: string, currentPath: string): boolean {
  if (href === "/") {
    return currentPath === "/";
  }
  return currentPath.startsWith(href);
}
