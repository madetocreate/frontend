import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const ALLOWED_MIME_PREFIX = "audio/";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 503 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
  }

  if (!file.type || !file.type.startsWith(ALLOWED_MIME_PREFIX)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  if (typeof file.size === "number" && file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }

  const client = new OpenAI({ apiKey });

  const transcription = await client.audio.transcriptions.create({
    file,
    model: "gpt-4o-transcribe",
  });

  return NextResponse.json(transcription);
}
