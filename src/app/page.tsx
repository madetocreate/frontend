import { ChatWorkspaceShell } from "@/components/ChatWorkspaceShell";
import { ChatViewport } from "@/components/ChatViewport";
import { AuthGuard } from "@/components/AuthGuard";

export default function Page() {
  return (
    <AuthGuard>
      <ChatWorkspaceShell>
        <ChatViewport />
      </ChatWorkspaceShell>
    </AuthGuard>
  );
}
