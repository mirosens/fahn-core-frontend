import type { NextConfig } from "next";

// In Entwicklungsumgebungen: SSL-Zertifikatsverifizierung für selbstsignierte Zertifikate deaktivieren
// Dies ist notwendig für lokale DDEV-Umgebungen mit selbstsignierten Zertifikaten
if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const nextConfig: NextConfig = {
  // Trailing Slashes deaktivieren für kanonische URLs ohne Slash
  trailingSlash: false,

  // Bild-Konfiguration für externe Hosts
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  // Performance-Optimierungen
  experimental: {
    // Optimiertes Caching für bessere Performance
    optimizePackageImports: [
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-toast",
      "lucide-react",
    ],
  },

  // TypeScript-Optimierungen
  typescript: {
    // TypeScript-Fehler blockieren den Build nicht in Entwicklung
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
