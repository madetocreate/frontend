'use client'

import { useState } from 'react'

type Session = {
  id: string
  title: string
  starred: boolean
}

export default function ChatSidebar() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [newTitle, setNewTitle] = useState('')

  const createSession = () => {
    const title = newTitle.trim()
    if (!title) return
    setSessions(prev => [...prev, { id: Date.now().toString(), title, starred: false }])
    setNewTitle('')
  }

  const renameSession = (id: string) => {
    const session = sessions.find(s => s.id === id)
    const currentTitle = session?.title ?? ''
    const updatedTitle = window.prompt('Titel ändern', currentTitle)
    if (!updatedTitle) return
    setSessions(prev =>
      prev.map(s => (s.id === id ? { ...s, title: updatedTitle } : s)),
    )
  }

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  const toggleStar = (id: string) => {
    setSessions(prev =>
      prev.map(s => (s.id === id ? { ...s, starred: !s.starred } : s)),
    )
  }

  return (
    <aside className="w-72 max-w-xs border-r border-gray-200 dark:border-gray-800 px-4 py-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-100">
        Chats
      </h2>

      <div className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') createSession()
          }}
          placeholder="Neuer Chat"
          className="flex-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          type="button"
          onClick={createSession}
          className="rounded bg-violet-600 px-3 py-1 text-xs font-medium text-white hover:bg-violet-700"
        >
          Neu
        </button>
      </div>

      <ul className="space-y-1">
        {sessions.map(session => (
          <li
            key={session.id}
            className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <button
              type="button"
              className="flex-1 text-left truncate"
              onClick={() => renameSession(session.id)}
            >
              {session.title}
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => toggleStar(session.id)}
                className="px-1"
                aria-label={session.starred ? 'Unstar session' : 'Star session'}
              >
                {session.starred ? '★' : '☆'}
              </button>
              <button
                type="button"
                onClick={() => deleteSession(session.id)}
                className="px-1 text-xs text-red-500"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
        {sessions.length === 0 && (
          <li className="text-xs text-gray-400">Noch keine Chats angelegt.</li>
        )}
      </ul>
    </aside>
  )
}
