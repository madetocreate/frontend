import { ChatShell } from "../../components/ChatShell";

export default function ChatPage() {
  return (
    <main style={{ height: "100vh", padding: "1rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>Chat</h1>
      <ChatShell />
    </main>
  );
}
