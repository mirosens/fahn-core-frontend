// app/api/typo3/[...path]/route.ts - Proxy für TYPO3 API-Anfragen mit Pfad
// Löst CORS-Probleme, indem Anfragen serverseitig weitergeleitet werden

import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";

async function handleRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
  method: string = "GET"
) {
  try {
    // Await the params since they're now a Promise in Next.js 16
    const resolvedParams = await params;

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

    // Baue die Ziel-URL
    // Wenn path leer ist (z.B. /api/typo3?type=10000), verwende Root-Pfad
    const pathParts = resolvedParams.path ?? [];
    const path = pathParts.length > 0 ? pathParts.join("/") : "";
    const targetUrl = new URL(path || "/", baseUrl);

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

    // Handle 204 No Content
    if (response.status === 204) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": request.headers.get("origin") || "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      });
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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context, "GET");
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context, "POST");
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context, "PUT");
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context, "DELETE");
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
