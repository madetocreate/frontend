import ModularSidebar from '../../components/custom/ModularSidebar'
import ChatSidebar from '../../components/custom/ChatSidebar'
export default function ChatHome() {
  return (
    <div className="flex">
      <ModularSidebar />
      <ChatSidebar />
      <main className="flex-1 p-4">
        <h1 className="text-xl font-semibold mb-4">Chat</h1>
        <p>Wählen Sie einen Chat aus der linken Liste oder erstellen Sie einen neuen.</p>
      </main>
    </div>
  )
}
