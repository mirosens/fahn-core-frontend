import type { NextConfig } from "next";

// In Entwicklungsumgebungen: SSL-Zertifikatsverifizierung für selbstsignierte Zertifikate deaktivieren
// Dies ist notwendig für lokale DDEV-Umgebungen mit selbstsignierten Zertifikaten
if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const nextConfig: NextConfig = {
  // Trailing Slashes deaktivieren für kanonische URLs ohne Slash
  trailingSlash: false,
};

export default nextConfig;
