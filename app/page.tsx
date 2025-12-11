import { ChatWorkspaceShell } from "@/components/ChatWorkspaceShell"
import { ChatViewport } from "@/components/ChatViewport"

export default function Page() {
  return (
    <ChatWorkspaceShell>
      <ChatViewport />
    </ChatWorkspaceShell>
  )
}

