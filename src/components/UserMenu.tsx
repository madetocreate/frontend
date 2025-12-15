'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

export function UserMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  if (!user) return null

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100/50 transition-all"
      >
        {user.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={user.picture} 
            alt={user.name || user.email}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900">{user.name || user.email}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
        <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-2xl overflow-hidden z-50">
          <div className="p-4 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              {user.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={user.picture} 
                  alt={user.name || user.email}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">{user.name || 'Benutzer'}</div>
                <div className="text-sm text-gray-600 truncate">{user.email}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {user.provider === 'google' && '🔵 Google'}
                  {user.provider === 'microsoft' && '🔷 Microsoft'}
                  {user.provider === 'apple' && '⚫ Apple'}
                  {user.provider === 'email' && '📧 E-Mail'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-2">
            <a
              href="/dashboard?view=settings&category=account"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-left"
            >
              <Cog6ToothIcon className="h-5 w-5 text-gray-600" />
              <span className="text-gray-900">Einstellungen</span>
            </a>
            <button
              onClick={async () => {
                setOpen(false)
                await logout()
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-left text-red-600"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Abmelden</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

