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

const ttlMs = 7 * 24 * 60 * 60 * 1000; // 7 Tage
const store: Map<string, StoredSnapshot> =
  (global as any).__aklowShareStore || new Map();
(global as any).__aklowShareStore = store;

function cleanupExpired() {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (value.expiresAt <= now) {
      store.delete(key);
    }
  }
}

export async function POST(req: NextRequest) {
  cleanupExpired();
  const body = await req.json().catch(() => null);
  const snapshot = body?.snapshot as SnapshotPayload | undefined;
  if (!snapshot || !Array.isArray(snapshot.messages)) {
    return NextResponse.json({ error: "invalid_snapshot" }, { status: 400 });
  }

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? (crypto as any).randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  store.set(id, {
    payload: snapshot,
    createdAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
  });

  const origin = req.nextUrl.origin;
  const url = `${origin}/share/${id}`;

  return NextResponse.json({ id, url });
}

