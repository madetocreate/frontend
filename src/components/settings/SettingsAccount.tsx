'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AkAlert } from '@/components/ui/AkAlert'
import {
  UserIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ArrowRightOnRectangleIcon,
  DevicePhoneMobileIcon,
  LockClosedIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import {
  SettingsSection,
  SettingsRow,
  SettingsInput,
  SettingsButton,
} from './SettingsSection'

// Settings Account - Uses Node Backend via /api/settings/user proxy

export function SettingsAccount({ mode }: { mode?: 'simple' | 'expert' }) {
  const auth = useAuth()
  const { user, logout } = auth
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Password change
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Account deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Profile editing
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(user?.name || '')
  const [jobTitle, setJobTitle] = useState('')
  const [phoneNumber, setPhone] = useState('')
  const [company, setCompany] = useState('')

  // Website Profile
  const [websiteProfile, setWebsiteProfile] = useState<{
    company_name: string
    website: string
    industry: string
    value_proposition: string
    target_audience: string
    products_services?: string
    keywords?: string
    highlights?: string[]
    fetched_at?: string
  } | null>(null)
  const [isEditingWebsiteProfile, setIsEditingWebsiteProfile] = useState(false)


  const [sessions, setSessions] = useState<Array<{
    session_id: string;
    created_at: string;
    last_used_at: string;
    device_info: string | null;
    ip_address: string | null;
    is_current?: boolean;
    is_active: boolean;
  }>>([])

  useEffect(() => {
    loadProfileExtras()
    loadSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadSessions = async () => {
    try {
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const response = await authedFetch('/api/auth/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      }
    } catch (err) {
      console.warn('Failed to load sessions:', err)
    }
  }

  const loadProfileExtras = async () => {
    try {
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const response = await authedFetch('/api/settings/user')
      if (response.ok) {
        const data = await response.json()
        const settings = data.settings || {}
        const profile = settings.profile || {}
        setJobTitle(profile.jobTitle || '')
        setPhone(profile.phoneNumber || '')
        setCompany(profile.company || '')

        if (settings.websiteProfile) {
          setWebsiteProfile(settings.websiteProfile)
        }
      }
    } catch (err) {
      console.warn('Failed to load profile extras:', err)
    }
  }

  const handleChangePassword = async () => {
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
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const response = await authedFetch('/api/auth/password/change', {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Passwort-Änderung fehlgeschlagen')
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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'LÖSCHEN') {
      setError('Bitte geben Sie "LÖSCHEN" ein, um zu bestätigen')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const response = await authedFetch('/api/auth/account', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Fehler beim Löschen')
      }

      await logout()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen des Accounts')
      setLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    setLoading(true)
    setError(null)

    try {
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const response = await authedFetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Session konnte nicht widerrufen werden')
      }

      setSuccess('Session erfolgreich widerrufen')
      loadSessions()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Widerrufen der Session')
    } finally {
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

  const handleUpdateProfile = async () => {
    if (!editedName.trim()) {
      setError('Name darf nicht leer sein')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { authedFetch } = await import('@/lib/api/authedFetch')
      
      const patch: any = {
        profile: { jobTitle, phoneNumber, company },
      }

      if (isEditingWebsiteProfile && websiteProfile) {
        patch.websiteProfile = websiteProfile
      }

      const response = await authedFetch('/api/settings/user', {
        method: 'PUT',
        body: JSON.stringify({ patch }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Fehler beim Aktualisieren')
      }

      // Update local user data
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      userData.name = editedName
      localStorage.setItem('user', JSON.stringify(userData))

      setSuccess('Profil erfolgreich aktualisiert')
      setIsEditingName(false)
      setIsEditingWebsiteProfile(false)
      setTimeout(() => setSuccess(null), 3000)
      // Reload to sync user data
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren')
    } finally {
      setLoading(false)
    }
  }


  const renderProfileEditActions = () => (
    <div className="flex gap-2 justify-end p-4 border-t border-[var(--ak-color-border-subtle)]">
      <button
        onClick={() => {
          setIsEditingName(false)
          setEditedName(user?.name || '')
          loadProfileExtras()
        }}
        className="px-4 py-2 text-sm text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]"
      >
        Abbrechen
      </button>
      <button
        onClick={handleUpdateProfile}
        disabled={loading}
        className="px-4 py-2 bg-[var(--ak-color-accent)] text-sm rounded-md font-medium hover:opacity-90"
        style={{ color: 'var(--ak-text-primary-dark)' }}
      >
        Speichern
      </button>
    </div>
  )

  const renderWebsiteProfileEditActions = () => (
    <div className="flex gap-2 justify-end p-4 border-t border-[var(--ak-color-border-subtle)]">
      <button
        onClick={() => {
          setIsEditingWebsiteProfile(false)
          loadProfileExtras()
        }}
        className="px-4 py-2 text-sm text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]"
      >
        Abbrechen
      </button>
      <button
        onClick={handleUpdateProfile}
        disabled={loading}
        className="px-4 py-2 bg-[var(--ak-color-accent)] text-sm rounded-md font-medium hover:opacity-90"
        style={{ color: 'var(--ak-text-primary-dark)' }}
      >
        Speichern
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header Profile Card */}
      {user && (
        <div className="bg-[var(--ak-color-bg-surface-muted)] rounded-2xl p-6 flex items-center gap-4">
          {user.picture ? (
            <Image
              src={user.picture}
              alt={user.name || user.email}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--ak-semantic-info)] to-[var(--ak-color-accent)] rounded-full flex items-center justify-center font-semibold text-2xl" style={{ color: 'var(--ak-text-primary-dark)' }}>
              {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-[var(--ak-color-text-primary)] truncate">
              {user.name || 'Benutzer'}
            </h2>
            <p className="text-sm text-[var(--ak-color-text-secondary)] truncate">
              {user.email}
            </p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-secondary)]">
                {user.provider === 'google' && 'Google'}
                {user.provider === 'microsoft' && 'Microsoft'}
                {user.provider === 'apple' && 'Apple'}
                {user.provider === 'email' && 'E-Mail'}
              </span>
            </div>
          </div>
          <button
            onClick={async () => await logout()}
            className="p-2 text-[var(--ak-color-text-muted)] hover:text-[var(--ak-semantic-danger)] transition-colors"
            title="Abmelden"
          >
            <ArrowRightOnRectangleIcon className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Alerts */}
      {error && <AkAlert tone="danger" description={error} />}
      {success && <AkAlert tone="success" description={success} />}

      {/* --- PASSWORD --- */}
      {user?.provider === 'email' && (
        <SettingsSection
          title="Sicherheit"
          description="Passwort und Login-Daten."
          mode={mode || 'simple'}
        >
          {!showPasswordChange ? (
            <SettingsButton
              title="Passwort ändern"
              leading={<LockClosedIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
              iconColor="bg-[var(--ak-color-graphite-base)]"
              onClick={() => setShowPasswordChange(true)}
              mode={mode || 'simple'}
            />
          ) : (
            <>
              <SettingsInput
                title="Aktuelles Passwort"
                type="password"
                value={currentPassword}
                onChange={setCurrentPassword}
                leading={<LockClosedIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
                iconColor="bg-[var(--ak-color-graphite-base)]"
                mode={mode || 'simple'}
              />
              <SettingsInput
                title="Neues Passwort"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                leading={<LockClosedIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
                iconColor="bg-[var(--ak-color-graphite-base)]"
                mode={mode || 'simple'}
              />
              <SettingsInput
                title="Bestätigen"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                leading={<LockClosedIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
                iconColor="bg-[var(--ak-color-graphite-base)]"
                mode={mode || 'simple'}
              />
              <div className="flex gap-2 justify-end p-4 border-t border-[var(--ak-color-border-subtle)]">
                <button
                  onClick={() => {
                    setShowPasswordChange(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                    setError(null)
                  }}
                  className="px-4 py-2 text-sm text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="px-4 py-2 bg-[var(--ak-color-accent)] style={{ color: 'var(--ak-text-primary-dark)' }} text-sm rounded-md font-medium hover:opacity-90 disabled:opacity-50"
                >
                  Ändern
                </button>
              </div>
            </>
          )}
        </SettingsSection>
      )}

      {/* --- SESSIONS --- */}
      <SettingsSection
        title="Aktive Sessions"
        description="Geräte und Browser, die eingeloggt sind."
        mode={mode || 'simple'}
      >
        {sessions.length === 0 ? (
          <div className="p-4 text-sm text-[var(--ak-color-text-muted)] text-center">
            Keine aktiven Sessions.
          </div>
        ) : (
          sessions.filter(s => s.is_active).map((session, idx) => (
            <SettingsRow
              key={session.session_id}
              title={`Session ${idx + 1}`}
              subtitle={session.created_at ? formatDate(session.created_at) : 'Unbekannt'}
              leading={<DevicePhoneMobileIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
              iconColor={session.is_active ? 'bg-[var(--ak-semantic-success)]' : 'bg-[var(--ak-color-graphite-base)]'}
              trailing={
                session.is_active && (
                  <button
                    onClick={() => handleRevokeSession(session.session_id)}
                    className="text-xs text-[var(--ak-semantic-danger)] hover:underline"
                  >
                    Widerrufen
                  </button>
                )
              }
              mode={mode || 'simple'}
            />
          ))
        )}
      </SettingsSection>

      {/* --- PERSONAL INFO --- */}
      <SettingsSection
        title="Persönliche Daten"
        description="Verwalte deine Kontaktinformationen."
        mode={mode || 'simple'}
      >
        {!isEditingName ? (
          <>
            <SettingsRow
              title="Name"
              subtitle={user?.name || 'Nicht gesetzt'}
              leading={<UserIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
              iconColor="bg-[var(--ak-accent-inbox)]"
              onClick={() => setIsEditingName(true)}
              mode={mode || 'simple'}
            />
            <SettingsRow
              title="Position"
              subtitle={jobTitle || 'Nicht gesetzt'}
              leading={<BriefcaseIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
              iconColor="bg-[var(--ak-accent-documents)]"
              onClick={() => setIsEditingName(true)}
              mode={mode || 'simple'}
            />
            <SettingsRow
              title="Telefon"
              subtitle={phoneNumber || 'Nicht gesetzt'}
              leading={<DevicePhoneMobileIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
              iconColor="bg-[var(--ak-semantic-success)]"
              onClick={() => setIsEditingName(true)}
              mode={mode || 'simple'}
            />
            <SettingsRow
              title="Unternehmen"
              subtitle={company || 'Nicht gesetzt'}
              leading={<BuildingOfficeIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
              iconColor="bg-[var(--ak-semantic-warning)]"
              onClick={() => setIsEditingName(true)}
              mode={mode || 'simple'}
            />
          </>
        ) : (
          <>
            <SettingsInput
              title="Name"
              value={editedName}
              onChange={setEditedName}
              leading={<UserIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
              iconColor="bg-[var(--ak-accent-inbox)]"
              mode={mode || 'simple'}
            />
            <SettingsInput
              title="Position"
              value={jobTitle}
              onChange={setJobTitle}
              leading={<BriefcaseIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
              iconColor="bg-[var(--ak-accent-documents)]"
              mode={mode || 'simple'}
            />
            <SettingsInput
              title="Telefon"
              value={phoneNumber}
              onChange={setPhone}
              leading={<DevicePhoneMobileIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
              iconColor="bg-[var(--ak-semantic-success)]"
              mode={mode || 'simple'}
            />
            <SettingsInput
              title="Unternehmen"
              value={company}
              onChange={setCompany}
              leading={<BuildingOfficeIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
              iconColor="bg-[var(--ak-semantic-warning)]"
              mode={mode || 'simple'}
            />
            {renderProfileEditActions()}
          </>
        )}
      </SettingsSection>

      {/* --- WEBSITE PROFILE --- */}
      {websiteProfile && (
        <SettingsSection
          title="Website Profil"
          description="Daten aus der Website-Analyse."
          mode={mode || 'simple'}
        >
          {!isEditingWebsiteProfile ? (
            <>
              <SettingsRow
                title="Firmenname"
                subtitle={websiteProfile.company_name}
                leading={<BuildingOfficeIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
                iconColor="bg-[var(--ak-accent-documents)]"
                onClick={() => setIsEditingWebsiteProfile(true)}
                mode={mode || 'simple'}
              />
              <SettingsRow
                title="Website"
                subtitle={websiteProfile.website}
                leading={<GlobeAltIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
                iconColor="bg-[var(--ak-semantic-info)]"
                onClick={() => setIsEditingWebsiteProfile(true)}
                mode={mode || 'simple'}
              />
              <SettingsRow
                title="Branche"
                subtitle={websiteProfile.industry}
                leading={<BriefcaseIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
                iconColor="bg-[var(--ak-semantic-info)]"
                onClick={() => setIsEditingWebsiteProfile(true)}
                mode={mode || 'simple'}
              />
              <SettingsRow
                title="Zielgruppe"
                subtitle={websiteProfile.target_audience}
                leading={<UserGroupIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
                iconColor="bg-[var(--ak-semantic-danger)]"
                onClick={() => setIsEditingWebsiteProfile(true)}
                mode={mode || 'simple'}
              />
            </>
          ) : (
            <>
              <SettingsInput
                title="Firmenname"
                value={websiteProfile.company_name}
                onChange={(val) =>
                  setWebsiteProfile({ ...websiteProfile, company_name: val })
                }
                leading={<BuildingOfficeIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
                iconColor="bg-[var(--ak-accent-documents)]"
                mode={mode || 'simple'}
              />
              <SettingsInput
                title="Website"
                value={websiteProfile.website}
                onChange={(val) =>
                  setWebsiteProfile({ ...websiteProfile, website: val })
                }
                leading={<GlobeAltIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
                iconColor="bg-[var(--ak-semantic-info)]"
                mode={mode || 'simple'}
              />
              <SettingsInput
                title="Branche"
                value={websiteProfile.industry}
                onChange={(val) =>
                  setWebsiteProfile({ ...websiteProfile, industry: val })
                }
                leading={<BriefcaseIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
                iconColor="bg-[var(--ak-semantic-info)]"
                mode={mode || 'simple'}
              />
              <SettingsInput
                title="Zielgruppe"
                value={websiteProfile.target_audience}
                onChange={(val) =>
                  setWebsiteProfile({ ...websiteProfile, target_audience: val })
                }
                leading={<UserGroupIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
                iconColor="bg-[var(--ak-semantic-danger)]"
                mode={mode || 'simple'}
              />
              {/* Textareas for larger fields - wrapped in div to fit layout style */}
              <div className="p-4 space-y-4 border-t border-[var(--ak-color-border-subtle)]">
                <div>
                  <label className="text-xs font-medium text-[var(--ak-color-text-secondary)] block mb-1">
                    Wertversprechen
                  </label>
                  <textarea
                    value={websiteProfile.value_proposition}
                    onChange={(e) =>
                      setWebsiteProfile({
                        ...websiteProfile,
                        value_proposition: e.target.value,
                      })
                    }
                    className="w-full bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-subtle)] rounded-lg p-2 text-sm focus:ring-2 focus:ring-[var(--ak-color-accent)] outline-none"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--ak-color-text-secondary)] block mb-1">
                    Produkte & Services
                  </label>
                  <textarea
                    value={websiteProfile.products_services || ''}
                    onChange={(e) =>
                      setWebsiteProfile({
                        ...websiteProfile,
                        products_services: e.target.value,
                      })
                    }
                    className="w-full bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-subtle)] rounded-lg p-2 text-sm focus:ring-2 focus:ring-[var(--ak-color-accent)] outline-none"
                    rows={2}
                  />
                </div>
              </div>
              {renderWebsiteProfileEditActions()}
            </>
          )}
        </SettingsSection>
      )}

      {/* --- DANGER ZONE --- */}
      <SettingsSection
        title="Gefahrenzone"
        description="Irreversible Aktionen."
        mode={mode || 'simple'}
      >
        {!showDeleteConfirm ? (
          <SettingsButton
            title="Account löschen"
            leading={<TrashIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
            iconColor="bg-[var(--ak-semantic-danger)]"
            onClick={() => setShowDeleteConfirm(true)}
            mode={mode || 'simple'}
          />
        ) : (
          <div className="p-4 bg-[var(--ak-semantic-danger-soft)]/20">
            <p className="text-sm text-[var(--ak-semantic-danger)] mb-2 font-medium">
              Tippe "LÖSCHEN" zur Bestätigung:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="flex-1 ak-bg-surface-1 border border-[var(--ak-semantic-danger)] rounded-md px-3 py-1.5 text-sm"
                placeholder="LÖSCHEN"
              />
              <button
                onClick={handleDeleteAccount}
                disabled={loading || deleteConfirmText !== 'LÖSCHEN'}
                className="px-3 py-1.5 bg-[var(--ak-semantic-danger)] rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
                style={{ color: 'var(--ak-text-primary-dark)' }}
              >
                Endgültig
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteConfirmText('')
                  setError(null)
                }}
                className="px-3 py-1.5 bg-transparent text-[var(--ak-semantic-danger)] text-sm hover:underline"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </SettingsSection>

    </div>
  )
}
