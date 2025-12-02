// app/api/typo3/route.ts - Proxy für TYPO3 API-Anfragen ohne Pfad
// Behandelt Anfragen wie /api/typo3?type=10000

import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";

export async function GET(request: NextRequest) {
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

    console.log("[API Proxy] Proxying request to:", targetUrl.toString());

    // Führe die Anfrage serverseitig aus (kein CORS-Problem)
    const response = await fetch(targetUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        "[API Proxy] Error response:",
        response.status,
        response.statusText
      );
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("[API Proxy] Error body:", errorText);
      return NextResponse.json(
        {
          error: "TYPO3 API error",
          status: response.status,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Setze CORS-Header für die Antwort
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
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
