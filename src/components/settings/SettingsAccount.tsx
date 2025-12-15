'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { 
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  DevicePhoneMobileIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import Image from 'next/image'

const API_BASE_URL = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL || 'http://localhost:4051'

interface Session {
  session_id: string
  created_at: string
  expires_at: string
  is_current?: boolean
}

export function SettingsAccount() {
  const auth = useAuth()
  const { user, fetchWithAuth, logout } = auth
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Profile editing
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(user?.name || '')
  
  // Password change
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  
  // Account deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  useEffect(() => {
    loadSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadSessions = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/v1/auth/sessions`)
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      }
    } catch (err) {
      console.error('Failed to load sessions:', err)
    }
  }

  const handleUpdateName = async () => {
    if (!editedName.trim()) {
      setError('Name darf nicht leer sein')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/v1/auth/profile`, {
        method: 'PUT',
        body: JSON.stringify({ name: editedName }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Fehler beim Aktualisieren')
      }

      const data = await response.json()
      // Update local user data
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      userData.name = data.user.name
      localStorage.setItem('user', JSON.stringify(userData))
      
      setSuccess('Name erfolgreich aktualisiert')
      setIsEditingName(false)
      setTimeout(() => setSuccess(null), 3000)
      window.location.reload() // Refresh to update user context
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Namens')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('Passwörter stimmen nicht überein')
      return
    }

    if (newPassword.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein')
      return
    }

    setLoading(true)

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/v1/auth/password/change`, {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Passwort-Änderung fehlgeschlagen')
      }

      setSuccess('Passwort erfolgreich geändert')
      setShowPasswordChange(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Passwort-Änderung fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/v1/auth/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Session konnte nicht widerrufen werden')
      }

      setSuccess('Session erfolgreich widerrufen')
      loadSessions()
      setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError('Fehler beim Widerrufen der Session')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'LÖSCHEN') {
      setError('Bitte geben Sie "LÖSCHEN" ein, um zu bestätigen')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/v1/auth/account`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Fehler beim Löschen')
      }

      // Account deleted, logout and redirect
      await logout()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen des Accounts')
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* User Profile Card */}
      {user && (
        <div className="apple-glass-enhanced rounded-3xl p-6">
          <div className="flex items-center gap-4">
            {user.picture ? (
              <Image 
                src={user.picture} 
                alt={user.name || user.email}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
                {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xl text-[var(--ak-color-text-primary)] truncate">{user.name || 'Benutzer'}</div>
              <div className="text-sm text-[var(--ak-color-text-secondary)] truncate">{user.email}</div>
              <div className="text-xs text-[var(--ak-color-text-secondary)] mt-1">
                {user.provider === 'google' && '🔵 Google'}
                {user.provider === 'microsoft' && '🔷 Microsoft'}
                {user.provider === 'apple' && '⚫ Apple'}
                {user.provider === 'email' && '📧 E-Mail'}
              </div>
            </div>
            <button
              onClick={async () => {
                await logout()
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Abmelden</span>
            </button>
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800">
          <XCircleIcon className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-800">
          <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto text-green-600 hover:text-green-800">
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
        <h2 className="text-xl font-bold text-[var(--ak-color-text-primary)] mb-6 flex items-center gap-2">
          <UserIcon className="h-6 w-6" />
          Profil-Informationen
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">E-Mail</label>
            <div className="flex items-center gap-3">
              <EnvelopeIcon className="h-5 w-5 text-[var(--ak-color-text-muted)]" />
              <span className="text-[var(--ak-color-text-primary)] font-medium">{user?.email}</span>
              <span className="text-xs text-[var(--ak-color-text-secondary)] px-2 py-1 bg-[var(--ak-color-bg-surface-muted)] rounded-lg">
                {user?.provider === 'google' && '🔵 Google'}
                {user?.provider === 'microsoft' && '🔷 Microsoft'}
                {user?.provider === 'apple' && '⚫ Apple'}
                {user?.provider === 'email' && '📧 E-Mail'}
              </span>
            </div>
            <p className="text-xs text-[var(--ak-color-text-secondary)] mt-1">E-Mail kann nicht geändert werden</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">Name</label>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-[var(--ak-color-border-subtle)] rounded-xl focus:ring-2 focus:ring-[var(--ak-color-accent)] focus:border-[var(--ak-color-accent)]"
                  placeholder="Ihr Name"
                />
                <button
                  onClick={handleUpdateName}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Speichern
                </button>
                <button
                  onClick={() => {
                    setIsEditingName(false)
                    setEditedName(user?.name || '')
                  }}
                  className="px-4 py-2 bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] rounded-xl hover:bg-[var(--ak-color-bg-hover)] transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-[var(--ak-color-text-primary)] font-medium">{user?.name || 'Kein Name gesetzt'}</span>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-2 text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] rounded-lg transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Change */}
      {user?.provider === 'email' && (
        <div className="apple-glass-enhanced rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--ak-color-text-primary)] flex items-center gap-2">
              <LockClosedIcon className="h-6 w-6" />
              Passwort ändern
            </h2>
            {!showPasswordChange && (
              <button
                onClick={() => setShowPasswordChange(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Passwort ändern
              </button>
            )}
          </div>

          {showPasswordChange && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">Aktuelles Passwort</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--ak-color-text-muted)]" />
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-[var(--ak-color-border-subtle)] rounded-xl focus:ring-2 focus:ring-[var(--ak-color-accent)] focus:border-[var(--ak-color-accent)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-secondary)]"
                  >
                    {showPasswords ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">Neues Passwort</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--ak-color-text-muted)]" />
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full pl-10 pr-12 py-3 border border-[var(--ak-color-border-subtle)] rounded-xl focus:ring-2 focus:ring-[var(--ak-color-accent)] focus:border-[var(--ak-color-accent)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-secondary)]"
                  >
                    {showPasswords ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">Neues Passwort bestätigen</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--ak-color-text-muted)]" />
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full pl-10 pr-12 py-3 border border-[var(--ak-color-border-subtle)] rounded-xl focus:ring-2 focus:ring-[var(--ak-color-accent)] focus:border-[var(--ak-color-accent)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-secondary)]"
                  >
                    {showPasswords ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Passwort ändern
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordChange(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                    setError(null)
                  }}
                  className="px-4 py-2 bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] rounded-xl hover:bg-[var(--ak-color-bg-hover)] transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Active Sessions */}
      <div className="apple-glass-enhanced rounded-3xl p-6">
        <h2 className="text-xl font-bold text-[var(--ak-color-text-primary)] mb-6 flex items-center gap-2">
          <DevicePhoneMobileIcon className="h-6 w-6" />
          Aktive Sessions
        </h2>

        {sessions.length === 0 ? (
          <p className="text-[var(--ak-color-text-secondary)]">Keine aktiven Sessions gefunden</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-[var(--ak-color-bg-surface-muted)] rounded-xl border border-[var(--ak-color-border-subtle)]"
              >
                <div>
                  <div className="font-medium text-[var(--ak-color-text-primary)]">
                    Session {idx + 1}
                    {session.is_current && (
                      <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">Aktuell</span>
                    )}
                  </div>
                  <div className="text-sm text-[var(--ak-color-text-secondary)] mt-1">
                    Erstellt: {formatDate(session.created_at)}
                  </div>
                  <div className="text-sm text-[var(--ak-color-text-secondary)]">
                    Läuft ab: {formatDate(session.expires_at)}
                  </div>
                </div>
                {!session.is_current && (
                  <button
                    onClick={() => handleRevokeSession(session.session_id)}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    Widerrufen
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Deletion */}
      <div className="bg-red-50/80 backdrop-blur-2xl rounded-3xl border border-red-200/50 shadow-lg p-6">
        <h2 className="text-xl font-bold text-red-900 mb-2 flex items-center gap-2">
          <TrashIcon className="h-6 w-6" />
          Account löschen
        </h2>
        <p className="text-sm text-red-700 mb-4">
          Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre Daten werden permanent gelöscht.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            Account löschen
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-red-900 mb-2">
                Geben Sie &quot;LÖSCHEN&quot; ein, um zu bestätigen:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-2 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="LÖSCHEN"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={loading || deleteConfirmText !== 'LÖSCHEN'}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Endgültig löschen
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteConfirmText('')
                  setError(null)
                }}
                className="px-4 py-2 bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] rounded-xl hover:bg-[var(--ak-color-bg-hover)] transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

