#!/bin/bash
# Skript zum Starten von TYPO3 (DDEV) und Next.js-Anwendung

TYPO3_DIR="/home/miro/projects/FAHN-CORE/typo3-headless"
FRONTEND_DIR="/home/miro/projects/FAHN-CORE/fahn-core-frontend"

# Funktion zum Öffnen von URLs in Chrome Incognito
# Parameter: url, label, delay, is_first_window (true/false)
open_chrome_incognito() {
  local url="$1"
  local label="${2:-URL}"
  local delay="${3:-2}"  # Standard-Verzögerung: 2 Sekunden
  local is_first_window="${4:-false}"  # Erste URL öffnet neues Fenster, weitere als Tabs
  
  (
    sleep "$delay"  # Kurze Verzögerung, damit der Server bereit ist
    
    # Chrome-Argumente vorbereiten
    local chrome_args="--incognito --disable-extensions --disable-plugins --disable-sync"
    
    # Nur bei der ersten URL ein neues Fenster öffnen, sonst als Tab
    if [ "$is_first_window" = "true" ]; then
      chrome_args="$chrome_args --new-window"
    fi
    
    if [ -x "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" ]; then
      # Windows Chrome (WSL2)
      "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" \
        $chrome_args \
        "$url" >/dev/null 2>&1 &
      echo "🌐 Öffne $label in Chrome Incognito (Windows)..."
    elif [ -x "/usr/bin/google-chrome" ]; then
      # Linux Chrome
      google-chrome \
        $chrome_args \
        "$url" >/dev/null 2>&1 &
      echo "🌐 Öffne $label in Chrome Incognito (Linux)..."
    elif command -v google-chrome-stable &> /dev/null; then
      # Alternative Chrome-Installation
      google-chrome-stable \
        $chrome_args \
        "$url" >/dev/null 2>&1 &
      echo "🌐 Öffne $label in Chrome Incognito..."
    else
      echo "⚠️  Chrome nicht gefunden. Öffne manuell: $url"
    fi
  ) &
}

# Funktion zum Warten auf TYPO3-Verfügbarkeit
wait_for_typo3() {
  local max_attempts=60
  local attempt=0
  local typo3_url="${1:-http://localhost}"
  
  echo "⏳ Warte auf TYPO3-Verfügbarkeit..."
  
  while [ $attempt -lt $max_attempts ]; do
    if curl -sf -k "${typo3_url}" > /dev/null 2>&1; then
      echo "✅ TYPO3 ist bereit!"
      return 0
    fi
    
    attempt=$((attempt + 1))
    echo "   Versuch $attempt/$max_attempts..."
    sleep 2
  done
  
  echo "⚠️  TYPO3 ist nach ${max_attempts} Versuchen nicht verfügbar, starte trotzdem Next.js..."
  return 1
}

# TYPO3 mit DDEV starten
echo "🔧 Starte TYPO3 mit DDEV..."
cd "$TYPO3_DIR" || exit 1

# Prüfe ob DDEV installiert ist
if ! command -v ddev &> /dev/null; then
  echo "❌ DDEV ist nicht installiert. Bitte installiere DDEV zuerst."
  exit 1
fi

# Prüfe ob curl installiert ist (für Health-Check)
if ! command -v curl &> /dev/null; then
  echo "⚠️  curl ist nicht installiert. Health-Check wird übersprungen."
  SKIP_HEALTH_CHECK=true
else
  SKIP_HEALTH_CHECK=false
fi

# Prüfe ob DDEV bereits läuft
if ddev describe > /dev/null 2>&1; then
  echo "✅ DDEV läuft bereits"
else
  # Starte DDEV (startet alle Container)
  echo "🔄 Starte DDEV..."
  ddev start
fi

# Hole die TYPO3-URL aus DDEV
# Extrahiere URL aus ddev describe Output (Format: "https://project-name.ddev.site")
TYPO3_URL=$(ddev describe 2>/dev/null | grep -oP 'https://[^\s]+\.ddev\.site' | head -1)

if [ -z "$TYPO3_URL" ]; then
  # Fallback: Versuche aus Projekt-Name zu konstruieren
  PROJECT_NAME=$(ddev describe 2>/dev/null | grep -oP 'Project: \K[^\s]+' | head -1)
  if [ -n "$PROJECT_NAME" ]; then
    TYPO3_URL="https://${PROJECT_NAME}.ddev.site"
  else
    TYPO3_URL="https://localhost"
  fi
fi

echo "📍 TYPO3-URL: $TYPO3_URL"

# Warte auf TYPO3-Verfügbarkeit (nur wenn curl verfügbar ist)
if [ "$SKIP_HEALTH_CHECK" = "false" ]; then
  wait_for_typo3 "$TYPO3_URL"
else
  echo "⏳ Warte 5 Sekunden, damit TYPO3 starten kann..."
  sleep 5
fi

# Öffne TYPO3-URLs in Chrome Incognito (alle in einem Fenster als Tabs)
echo "🌐 Öffne TYPO3 in Chrome Incognito..."
open_chrome_incognito "$TYPO3_URL" "TYPO3 Frontend" 2 "true"  # Erstes Fenster
open_chrome_incognito "$TYPO3_URL/typo3/module/dashboard" "TYPO3 Backend" 3 "false"  # Als Tab

# Wechsle zum Frontend-Verzeichnis
cd "$FRONTEND_DIR" || exit 1

# Beende laufende Next.js-Prozesse
echo "🛑 Beende laufende Next.js-Prozesse..."
pkill -f "next dev" 2>/dev/null || true

# Befreie Port 3000
echo "🔓 Befreie Port 3000..."
lsof -ti:3000 | xargs -r kill -9 2>/dev/null || true

# Entferne Lock-Dateien
echo "🧹 Entferne Lock-Dateien..."
rm -rf .next/dev/lock 2>/dev/null || true

# Starte Next.js und öffne Browser nach kurzer Verzögerung
echo "🚀 Starte Next.js Entwicklungsserver auf http://localhost:3000"

# Öffne Frontend in Chrome Incognito nach kurzer Verzögerung (im Hintergrund)
# Die Funktion öffnet automatisch nach 8 Sekunden (damit Next.js starten kann)
# Als Tab im bereits geöffneten Fenster
open_chrome_incognito "http://localhost:3000" "Next.js Frontend" 8 "false"

# Starte Next.js im Vordergrund (blockiert)
pnpm dev

