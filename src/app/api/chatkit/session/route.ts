import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST() {
  try {
    const workflowId = process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID;
    if (!workflowId) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_CHATKIT_WORKFLOW_ID ist nicht gesetzt" },
        { status: 500 }
      );
    }

    const session = await client.beta.chatkit.sessions.create({
      user: process.env.CHATKIT_DEFAULT_USER_ID ?? "local-user",
      workflow: { id: workflowId },
    });

    return NextResponse.json({ client_secret: session.client_secret });
  } catch (error) {
    console.error("ChatKit-Session-Fehler", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen der ChatKit-Session" },
      { status: 500 }
    );
  }
}
