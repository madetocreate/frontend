import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
  }

  if (!file.type || !file.type.startsWith("audio/")) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  if (typeof file.size === "number" && file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }

  try {
    // Weiterleitung an Backend für Transkription
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const response = await fetch(`${BACKEND_URL}/audio/transcribe`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      let errorDetail = "Transcription failed";
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

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend" },
      { status: 503 }
    );
  }
}
