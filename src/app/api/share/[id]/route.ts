import { NextRequest, NextResponse } from "next/server";

type SnapshotMessage = { role: "user" | "assistant" | "system"; text: string };
type SnapshotPayload = {
  threadId?: string;
  messageId?: string;
  messages: SnapshotMessage[];
  createdBy?: string;
};

type StoredSnapshot = {
  payload: SnapshotPayload;
  createdAt: number;
  expiresAt: number;
};

const store: Map<string, StoredSnapshot> = (global as any).__aklowShareStore;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!store || !id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const entry = store.get(id);
  if (!entry || entry.expiresAt <= Date.now()) {
    store.delete(id);
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    id,
    createdAt: entry.createdAt,
    expiresAt: entry.expiresAt,
    snapshot: entry.payload,
  });
}

