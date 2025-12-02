"use client";

import Link from "next/link";
import {
  FileText,
  Instagram,
  Facebook,
  MessageCircle,
  Twitter,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { SystemThemeToggle } from "@/components/ui/SystemThemeToggle";

interface FooterProps {
  variant?: "home" | "dashboard" | "login" | "register" | "admin";
}

export function SiteFooter({ variant = "home" }: FooterProps) {
  // Automatisch generierte Menüpunkte
  const getMenuItems = () => {
    switch (variant) {
      case "home":
        return [{ href: "/", label: "Alle Fahndungen", icon: FileText }];
      case "dashboard":
        return [{ href: "/", label: "Alle Fahndungen", icon: FileText }];
      default:
        return [];
    }
  };

  // Soziale Netzwerke
  const socialItems = [
    { href: "https://instagram.com", label: "Instagram", icon: Instagram },
    { href: "https://facebook.com", label: "Facebook", icon: Facebook },
    { href: "https://whatsapp.com", label: "WhatsApp", icon: MessageCircle },
    { href: "https://x.com", label: "X (Twitter)", icon: Twitter },
  ];

  // Rechtliche Links
  const legalItems = [
    { href: "/impressum", label: "Impressum" },
    { href: "/datenschutz", label: "Datenschutz" },
    { href: "/kontakt", label: "Kontakt" },
  ];

  const menuItems = getMenuItems();

  // Aktuelles Jahr für Copyright
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="md:flex md:justify-between">
          {/* Logo und Beschreibung - Links */}
          <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-center">
              <Logo className="text-foreground" showLink={false} />
            </Link>
            <p className="mt-4 max-w-sm text-sm text-foreground/80 dark:text-foreground/90">
              Landeskriminalamt Baden-Württemberg - Zentrale Dienststelle für
              polizeiliche Kriminalitätsbekämpfung und Fahndung.
            </p>
          </div>

          {/* Navigation - Rechts */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 sm:gap-6">
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase text-foreground dark:text-white">
                Navigation
              </h2>
              <ul className="font-medium text-foreground/80 dark:text-foreground/90">
                {menuItems.map((item) => (
                  <li key={item.href} className="mb-4">
                    <Link href={item.href} className="hover:underline">
                      {item.label}
                    </Link>
                  </li>
                ))}
                {/* Barrierefreiheit unter Navigation */}
                <li className="mb-4">
                  <Link href="/leichte-sprache" className="hover:underline">
                    Leichte Sprache
                  </Link>
                </li>
                <li className="mb-4">
                  <Link href="/gebaerdensprache" className="hover:underline">
                    Gebärdensprache
                  </Link>
                </li>
              </ul>
            </div>

            {/* Rechtliche Links */}
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase text-foreground dark:text-white">
                Rechtliches
              </h2>
              <ul className="font-medium text-foreground/80 dark:text-foreground/90">
                {legalItems.map((item) => (
                  <li key={item.href} className="mb-4">
                    <Link href={item.href} className="hover:underline">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Trennlinie */}
        <hr className="my-6 border-border dark:border-border sm:mx-auto lg:my-8" />

        {/* Copyright, Theme Toggle und Social Media */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-foreground/80 dark:text-foreground/90 sm:text-center">
            © {currentYear}{" "}
            <Link href="/" className="hover:underline">
              Landeskriminalamt Baden-Württemberg
            </Link>
            . Alle Rechte vorbehalten.
          </span>

          {/* Soziale Netzwerke */}
          <div className="mt-4 flex items-center space-x-5 sm:mt-0 sm:justify-center rtl:space-x-reverse">
            {/* Theme Toggle */}
            <div className="flex items-center space-x-2">
              <SystemThemeToggle />
            </div>
            {/* Soziale Netzwerke */}
            {socialItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/80 transition-colors hover:text-foreground dark:hover:text-white"
                  title={item.label}
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
