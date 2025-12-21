import { Suspense } from "react";
import { ChatShell } from "../../components/ChatShell";

export default function ChatPage() {
  return (
    <main style={{ height: "100vh", padding: "1rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>Chat</h1>
      <Suspense fallback={<div style={{ padding: "1rem" }}>Lade Chat…</div>}>
        <ChatShell />
      </Suspense>
    </main>
  );
}
