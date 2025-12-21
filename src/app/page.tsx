import { Suspense } from "react";
import { ChatWorkspaceShell } from "@/components/ChatWorkspaceShell";
import { ChatViewport } from "@/components/ChatViewport";
import { AuthGuard } from "@/components/AuthGuard";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: "1rem" }}>Lade…</div>}>
      <AuthGuard>
        <ChatWorkspaceShell>
          <ChatViewport />
        </ChatWorkspaceShell>
      </AuthGuard>
    </Suspense>
  );
}
