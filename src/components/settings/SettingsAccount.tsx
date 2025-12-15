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
  EyeSlashIcon
} from '@heroicons/react/24/outline'

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
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <UserIcon className="h-6 w-6" />
          Profil-Informationen
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">E-Mail</label>
            <div className="flex items-center gap-3">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              <span className="text-gray-900 font-medium">{user?.email}</span>
              <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-lg">
                {user?.provider === 'google' && '🔵 Google'}
                {user?.provider === 'microsoft' && '🔷 Microsoft'}
                {user?.provider === 'apple' && '⚫ Apple'}
                {user?.provider === 'email' && '📧 E-Mail'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">E-Mail kann nicht geändert werden</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-gray-900 font-medium">{user?.name || 'Kein Name gesetzt'}</span>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Aktuelles Passwort</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Neues Passwort</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Neues Passwort bestätigen</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Active Sessions */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <DevicePhoneMobileIcon className="h-6 w-6" />
          Aktive Sessions
        </h2>

        {sessions.length === 0 ? (
          <p className="text-gray-600">Keine aktiven Sessions gefunden</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    Session {idx + 1}
                    {session.is_current && (
                      <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">Aktuell</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Erstellt: {formatDate(session.created_at)}
                  </div>
                  <div className="text-sm text-gray-600">
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
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
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

