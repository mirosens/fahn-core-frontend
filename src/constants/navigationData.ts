// src/constants/navigationData.ts
// Production-ready navigation configuration for FAHN-CORE

export const navigationItems = [
  {
    title: "Start",
    href: "/",
    public: true,
    description: "Startseite mit aktuellen Fahndungen",
  },
  {
    title: "Fahndungen",
    href: "/fahndungen",
    public: true,
    description: "Alle aktiven Fahndungen und Vermisstenmeldungen",
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
