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
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[var(--ak-color-bg-hover)] transition-all"
      >
        {user.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={user.picture} 
            alt={user.name || user.email}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--ak-accent-inbox)] to-[var(--ak-accent-customers)] rounded-full flex items-center justify-center font-semibold text-sm" style={{ color: 'var(--ak-text-primary-dark)' }}>
            {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium ak-text-primary">{user.name || user.email}</div>
          <div className="text-xs ak-text-secondary">{user.email}</div>
        </div>
        <ChevronDownIcon className={`h-4 w-4 ak-text-secondary transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-2 w-64 ak-bg-glass rounded-2xl ak-border-default shadow-2xl overflow-hidden z-50">
          <div className="p-4 border-b ak-border-default">
            <div className="flex items-center gap-3">
              {user.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={user.picture} 
                  alt={user.name || user.email}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--ak-accent-inbox)] to-[var(--ak-accent-customers)] rounded-full flex items-center justify-center font-semibold" style={{ color: 'var(--ak-text-primary-dark)' }}>
                  {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold ak-text-primary truncate">{user.name || 'Benutzer'}</div>
                <div className="text-sm ak-text-secondary truncate">{user.email}</div>
                <div className="text-xs ak-text-secondary mt-1">
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
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[var(--ak-color-bg-hover)] transition-colors text-left"
            >
              <Cog6ToothIcon className="h-5 w-5 ak-text-secondary" />
              <span className="ak-text-primary">Einstellungen</span>
            </a>
            <button
              onClick={async () => {
                setOpen(false)
                await logout()
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[var(--ak-semantic-danger-soft)] transition-colors text-left text-[var(--ak-semantic-danger)]"
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

