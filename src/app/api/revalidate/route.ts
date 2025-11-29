// app/api/revalidate/route.ts - On-Demand Revalidation API

import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Secret-Check für Sicherheit
    const secret = req.headers.get("x-revalidation-token");
    const expectedSecret = process.env.REVALIDATION_TOKEN;

    if (!expectedSecret) {
      console.error("REVALIDATION_TOKEN is not set in environment variables");
      return NextResponse.json(
        { message: "Revalidation not configured" },
        { status: 500 }
      );
    }

    if (secret !== expectedSecret) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Tags aus Request-Body extrahieren
    const body = await req.json();
    const { tags } = body;

    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { message: "Missing or invalid tags array" },
        { status: 400 }
      );
    }

    // Alle Tags revalidieren
    // revalidateTag in Next.js 16 erwartet: (tag: string, profile: string | CacheLifeConfig)
    const validTags = tags.filter(
      (tag): tag is string => typeof tag === "string" && tag.length > 0
    );
    for (const tag of validTags) {
      revalidateTag(tag, "default");
    }

    return NextResponse.json({
      revalidated: true,
      tags,
      now: Date.now(),
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
}
