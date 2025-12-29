import { NextRequest, NextResponse } from "next/server";
import { BackendUrls } from '@/app/api/_utils/proxyAuth'

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { text, voice = "nova", model = "tts-1-hd" } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing or invalid text parameter" }, { status: 400 });
    }

    // Weiterleitung an Backend für TTS mit Streaming
    const response = await fetch(`${BackendUrls.agent()}/audio/tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, voice, model }),
    });

    if (!response.ok) {
      let errorDetail = "TTS failed";
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || errorJson.error || errorDetail;
      } catch {
        const errorText = await response.text().catch(() => "");
        errorDetail = errorText || errorDetail;
      }
      return NextResponse.json(
        { error: errorDetail },
        { status: response.status }
      );
    }

    // Stream die Audio-Daten direkt weiter (Streaming)
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend" },
      { status: 503 }
    );
  }
}

