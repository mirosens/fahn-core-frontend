// app/api/typo3/route.ts - Proxy für TYPO3 API-Anfragen ohne Pfad
// Behandelt Anfragen wie /api/typo3?type=10000

import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";

async function handleRequest(request: NextRequest, method: string = "GET") {
  try {
    // Baue die TYPO3-URL zusammen
    const baseUrl = env.T3_API_BASE_URL ?? env.TYPO3_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { error: "TYPO3 API URL not configured" },
        { status: 500 }
      );
    }

    // Hole alle Query-Parameter aus der ursprünglichen Anfrage
    const searchParams = request.nextUrl.searchParams;

    // Baue die Ziel-URL mit Root-Pfad
    const targetUrl = new URL("/", baseUrl);

    // Kopiere alle Query-Parameter
    searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });

    // Hole den Request Body für POST/PUT/DELETE
    let body: string | undefined;
    if (method !== "GET" && method !== "HEAD") {
      try {
        body = await request.text();
      } catch {
        // Body ist optional
      }
    }

    // Hole Cookies vom Client-Request und weiterleiten
    const cookieHeader = request.headers.get("cookie");

    console.log(
      `[API Proxy] Proxying ${method} request to:`,
      targetUrl.toString()
    );

    // Führe die Anfrage serverseitig aus (kein CORS-Problem)
    const fetchOptions: RequestInit = {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      cache: "no-store",
    };

    if (body) {
      fetchOptions.body = body;
    }

    let response: Response;
    try {
      response = await fetch(targetUrl.toString(), fetchOptions);
    } catch (fetchError) {
      const errorMessage =
        fetchError instanceof Error ? fetchError.message : String(fetchError);
      console.error(
        `[API Proxy] Fetch error for ${targetUrl.toString()}:`,
        errorMessage
      );
      return NextResponse.json(
        {
          success: false,
          error: `Backend nicht erreichbar: ${errorMessage}. Bitte prüfen Sie, ob das TYPO3-Backend läuft.`,
          url: targetUrl.toString(),
        },
        { status: 503 }
      );
    }

    if (!response.ok) {
      // Versuche JSON-Fehler zu parsen, falls vorhanden
      let errorData: { error?: string; details?: unknown };
      try {
        const text = await response.text();
        errorData = text ? JSON.parse(text) : { error: response.statusText };
      } catch {
        errorData = { error: response.statusText || "Unknown error" };
      }

      console.error(
        `[API Proxy] Error response (${response.status}) from ${targetUrl.toString()}:`,
        errorData
      );

      // Spezifische Fehlermeldung für 404 (Backend-Endpunkt nicht gefunden)
      let errorMessage =
        errorData.error || `TYPO3 API error (${response.status})`;
      if (response.status === 404) {
        errorMessage = `Backend-Endpunkt nicht gefunden (404): ${targetUrl.toString()}. Mögliche Ursachen: TypoScript-Konfiguration nicht geladen, Endpunkt deaktiviert oder URL-Parameter inkorrekt. Bitte prüfen Sie die Backend-Konfiguration.`;
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          status: response.status,
          url: targetUrl.toString(),
          ...(errorData.details && { details: errorData.details }),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Hole Set-Cookie Header vom Backend und weiterleiten
    const setCookieHeaders = response.headers.getSetCookie();

    // Setze CORS-Header für die Antwort
    const responseHeaders: HeadersInit = {
      "Access-Control-Allow-Origin": request.headers.get("origin") || "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    };

    // Erstelle NextResponse und füge Cookies hinzu
    const nextResponse = NextResponse.json(data, {
      status: response.status,
      headers: responseHeaders,
    });

    // Setze Cookies vom Backend weiter (Next.js unterstützt getSetCookie())
    if (setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie) => {
        nextResponse.headers.append("Set-Cookie", cookie);
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("[API Proxy] Error:", error);
    return NextResponse.json(
      {
        error: "Proxy error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request, "GET");
}

export async function POST(request: NextRequest) {
  return handleRequest(request, "POST");
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, "PUT");
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, "DELETE");
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
