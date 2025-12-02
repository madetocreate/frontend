import { useState } from 'react'
export default function ChatSidebar() {
  const [sessions, setSessions] = useState<{ id: string; title: string; starred: boolean }[]>([])
  const [newTitle, setNewTitle] = useState('')
  function createSession() {
    const title = newTitle.trim()
    if (!title) return
    setSessions([...sessions, { id: Date.now().toString(), title, starred: false }])
    setNewTitle('')
  }
  function renameSession(id: string) {
    const session = sessions.find(s => s.id === id)
    const title = session ? session.title : ''
    const newName = prompt('Titel ändern', title) || title
    setSessions(sessions.map(s => (s.id === id ? { ...s, title: newName } : s)))
  }
  function toggleStar(id: string) {
    setSessions(sessions.map(s => (s.id === id ? { ...s, starred: !s.starred } : s)))
  }
  return (
    <aside className="w-56 p-4 border-r space-y-4">
      <div className="flex">
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Neuer Chat"
          className="flex-1 border rounded px-2 py-1"
        />
        <button onClick={createSession} className="ml-2 px-3 py-1 bg-blue-500 text-white rounded">
          +
        </button>
      </div>
      <ul className="space-y-1">
        {sessions.map(session => (
          <li key={session.id} className="flex justify-between items-center text-sm">
            <span onClick={() => renameSession(session.id)} className="flex-1 cursor-pointer truncate">
              {session.title || 'Neue Unterhaltung'}
            </span>
            <button
              onClick={() => toggleStar(session.id)}
              className="px-1"
              aria-label={session.starred ? 'Unstar session' : 'Star session'}
            >
              {session.starred ? '★' : '☆'}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
