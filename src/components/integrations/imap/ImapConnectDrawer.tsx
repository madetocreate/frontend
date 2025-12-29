'use client'

import { useState, useEffect } from 'react'
import {
  ServerIcon,
  KeyIcon,
  BoltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  InboxIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { authedFetch } from '@/lib/api/authedFetch'

type WizardStep = 'credentials' | 'verifying' | 'syncing' | 'success' | 'error'

interface ImapConnectDrawerProps {
  onConnect?: () => void
  onCancel?: () => void
}

export function ImapConnectDrawer({ onConnect, onCancel }: ImapConnectDrawerProps) {
  const [step, setStep] = useState<WizardStep>('credentials')
  const [error, setError] = useState<string | null>(null)
  
  // Form State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [host, setHost] = useState('')
  const [port, setPort] = useState('993')
  const [secure, setSecure] = useState(true)
  const [folder, setFolder] = useState('INBOX')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Validation State
  const [validationStage, setValidationStage] = useState<number>(0)
  const [syncCount, setSyncCount] = useState<number>(0)
  const [syncLimit, setSyncLimit] = useState<number>(50)

  // Auto-detect host
  useEffect(() => {
    if (email.includes('@')) {
      const domain = email.split('@')[1]
      if (!host) {
        if (domain === 'gmail.com') setHost('imap.gmail.com')
        else if (domain === 'outlook.com' || domain === 'hotmail.com') setHost('outlook.office365.com')
        else if (domain === 'icloud.com') setHost('imap.mail.me.com')
        else setHost(`imap.${domain}`)
      }
    }
  }, [email, host])

  const handleTestAndSave = async () => {
    if (!email || !password || !host) {
      setError('Bitte alle Pflichtfelder ausfüllen')
      return
    }

    setStep('verifying')
    setValidationStage(0)
    setError(null)

    try {
      // 1. Save Settings
      setValidationStage(1) // "Speichere Einstellungen..."
      const saveRes = await authedFetch('/api/integrations/imap/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          host,
          port: parseInt(port),
          secure,
          folder
        })
      })

      if (!saveRes.ok) throw new Error('Einstellungen konnten nicht gespeichert werden')

      // 2. Test Connection
      setValidationStage(2) // "Prüfe Verbindung..."
      const statusRes = await authedFetch('/api/integrations/imap/status')
      const statusData = await statusRes.json()

      if (!statusData.connected) {
        throw new Error(statusData.error || 'Verbindung fehlgeschlagen')
      }

      setValidationStage(3) // "Verbindung OK"
      
      // Auto-advance to sync step
      setTimeout(() => {
        setStep('syncing')
      }, 1000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten')
      setStep('error')
    }
  }

  const handleSync = async () => {
    try {
      setValidationStage(4) // "Synchronisiere Mails..."
      
      const syncRes = await authedFetch('/api/integrations/imap/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: syncLimit })
      })
      
      const syncData = await syncRes.json()
      
      if (!syncRes.ok) {
        throw new Error(syncData.error || 'Sync fehlgeschlagen')
      }

      setSyncCount(syncData.messages_fetched || 0)
      setStep('success')
      
      if (onConnect) {
        setTimeout(() => onConnect(), 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync fehlgeschlagen')
      setStep('error')
    }
  }

  const ValidationItem = ({ 
    label, 
    isActive, 
    isCompleted, 
    icon: Icon 
  }: { 
    label: string, 
    isActive: boolean, 
    isCompleted: boolean, 
    icon: any 
  }) => (
    <div className={clsx(
      "flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
      isActive ? "bg-[var(--ak-surface-2)] translate-x-1" : "opacity-60",
      isCompleted && "opacity-100"
    )}>
       <div className={clsx(
         "h-8 w-8 rounded-full flex items-center justify-center border transition-all duration-300",
         isCompleted 
           ? "bg-[var(--ak-semantic-success-soft)] border-[var(--ak-semantic-success)] text-[var(--ak-color-success)]" 
           : isActive 
             ? "bg-[var(--ak-surface-1)] border-[var(--ak-color-accent)] text-[var(--ak-color-accent)] shadow-sm"
             : "border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-muted)]"
       )}>
          {isCompleted ? <CheckCircleIcon className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
       </div>
       <div className="flex-1">
         <p className={clsx(
           "text-sm font-medium transition-colors",
           isActive || isCompleted ? "text-[var(--ak-color-text-primary)]" : "text-[var(--ak-color-text-secondary)]"
         )}>
           {label}
         </p>
         {isActive && !isCompleted && (
           <p className="text-xs text-[var(--ak-color-accent)] animate-pulse mt-0.5">Wird verarbeitet...</p>
         )}
       </div>
    </div>
  )

  if (step === 'success') {
    return (
      <div className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] p-6 space-y-6 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center justify-center text-center gap-4 py-4">
          <div className="h-16 w-16 rounded-full bg-[var(--ak-semantic-success-soft)] flex items-center justify-center border-2 border-[var(--ak-color-success)] shadow-sm">
             <CheckCircleIcon className="h-8 w-8 text-[var(--ak-color-success)]" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[var(--ak-color-text-primary)]">
              E-Mail verbunden!
            </h3>
            <p className="text-sm text-[var(--ak-color-text-secondary)] mt-1">
              {syncCount} E-Mails wurden erfolgreich importiert.
            </p>
          </div>
        </div>
        
        <button
          onClick={onCancel}
          className="w-full mt-4 px-4 py-2 text-sm font-medium text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-surface-2)] rounded-lg transition-colors border border-[var(--ak-color-border-subtle)]"
        >
          Schließen
        </button>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="rounded-lg border border-[var(--ak-color-danger)] bg-[var(--ak-color-bg-danger-soft)] p-6 space-y-4 animate-in shake duration-300">
        <div className="flex items-center gap-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-[var(--ak-color-danger-strong)]" />
          <h3 className="text-lg font-semibold text-[var(--ak-color-danger-strong)]">Verbindung fehlgeschlagen</h3>
        </div>
        <p className="text-sm text-[var(--ak-color-danger-strong)] opacity-90">{error}</p>
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => {
              setStep('credentials')
              setError(null)
            }}
            className="px-4 py-2 text-sm font-medium text-[var(--ak-color-danger-strong)] bg-white/50 hover:bg-white/80 rounded-lg transition-colors shadow-sm"
          >
            Einstellungen prüfen
          </button>
        </div>
      </div>
    )
  }

  if (step === 'verifying' || step === 'syncing') {
    return (
      <div className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] p-6 space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-[var(--ak-color-border-fine)]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--ak-color-accent)] border-t-transparent" />
          <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
            Einrichtung läuft...
          </h3>
        </div>
        
        <div className="space-y-2">
           <ValidationItem 
             label="Einstellungen speichern" 
             icon={KeyIcon}
             isActive={validationStage >= 0}
             isCompleted={validationStage >= 2}
           />
           <ValidationItem 
             label="Server Verbindung prüfen" 
             icon={ServerIcon}
             isActive={validationStage >= 2}
             isCompleted={validationStage >= 3}
           />
           {step === 'syncing' && (
             <div className="pt-4 space-y-4 animate-in slide-in-from-bottom-2">
                <div className="p-4 rounded-xl bg-[var(--ak-surface-1)] border border-[var(--ak-color-border-subtle)]">
                   <h4 className="font-medium text-[var(--ak-color-text-primary)] mb-2">Erster Import</h4>
                   <p className="text-sm text-[var(--ak-color-text-secondary)] mb-4">
                     Verbindung erfolgreich! Wie viele E-Mails sollen wir initial laden?
                   </p>
                   
                   <div className="flex items-center gap-2 mb-4">
                     <select 
                       value={syncLimit}
                       onChange={(e) => setSyncLimit(Number(e.target.value))}
                       className="px-3 py-1.5 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-surface-2)] text-[var(--ak-color-text-primary)] text-sm"
                     >
                       <option value={10}>10 E-Mails</option>
                       <option value={50}>50 E-Mails</option>
                       <option value={200}>200 E-Mails</option>
                     </select>
                   </div>

                   <button
                    onClick={handleSync}
                    className="w-full px-4 py-2 bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] rounded-lg hover:bg-[var(--ak-color-accent-strong)] transition-all font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <InboxIcon className="h-4 w-4" />
                    Jetzt importieren
                  </button>
                </div>
             </div>
           )}
        </div>
      </div>
    )
  }

  // Credentials Step
  return (
    <div className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] p-6 space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[var(--ak-surface-2)] flex items-center justify-center border border-[var(--ak-color-border-subtle)]">
           <InboxIcon className="h-5 w-5 text-[var(--ak-color-text-secondary)]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
            IMAP Verbinden
          </h3>
          <p className="text-xs text-[var(--ak-color-text-secondary)]">Gmail, Outlook oder eigener Server</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-1.5">
            E-Mail Adresse
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@firma.de"
            className="w-full px-4 py-2.5 border border-[var(--ak-color-border-subtle)] rounded-xl bg-[var(--ak-surface-1)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-focus-ring-color)] transition-shadow text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-1.5">
            Passwort / App-Passwort
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 border border-[var(--ak-color-border-subtle)] rounded-xl bg-[var(--ak-surface-1)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-focus-ring-color)] transition-shadow text-sm"
          />
          {email.includes('gmail.com') && (
            <p className="text-xs text-[var(--ak-color-text-secondary)] mt-1">
              Bei Gmail bitte ein <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-[var(--ak-color-accent)] hover:underline">App-Passwort</a> verwenden.
            </p>
          )}
        </div>

        <div>
           <button 
             type="button"
             onClick={() => setShowAdvanced(!showAdvanced)}
             className="flex items-center gap-1 text-xs text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] font-medium"
           >
             <Cog6ToothIcon className="h-3 w-3" />
             {showAdvanced ? 'Erweiterte Einstellungen ausblenden' : 'Erweiterte Einstellungen (Host/Port)'}
           </button>
           
           {showAdvanced && (
             <div className="mt-3 p-3 bg-[var(--ak-surface-1)] rounded-xl border border-[var(--ak-color-border-subtle)] space-y-3 animate-in slide-in-from-top-2">
                <div>
                  <label className="block text-xs font-medium text-[var(--ak-color-text-secondary)] mb-1">IMAP Host</label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="imap.example.com"
                    className="w-full px-3 py-2 border border-[var(--ak-color-border-subtle)] rounded-lg bg-[var(--ak-surface-2)] text-[var(--ak-color-text-primary)] text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[var(--ak-color-text-secondary)] mb-1">Port</label>
                    <input
                      type="text"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      placeholder="993"
                      className="w-full px-3 py-2 border border-[var(--ak-color-border-subtle)] rounded-lg bg-[var(--ak-surface-2)] text-[var(--ak-color-text-primary)] text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[var(--ak-color-text-secondary)] mb-1">Ordner</label>
                    <input
                      type="text"
                      value={folder}
                      onChange={(e) => setFolder(e.target.value)}
                      placeholder="INBOX"
                      className="w-full px-3 py-2 border border-[var(--ak-color-border-subtle)] rounded-lg bg-[var(--ak-surface-2)] text-[var(--ak-color-text-primary)] text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <input
                     type="checkbox"
                     id="secure"
                     checked={secure}
                     onChange={(e) => setSecure(e.target.checked)}
                     className="rounded border-[var(--ak-color-border-subtle)]"
                   />
                   <label htmlFor="secure" className="text-xs text-[var(--ak-color-text-secondary)]">SSL/TLS verwenden</label>
                </div>
             </div>
           )}
        </div>

        <div className="flex gap-3 pt-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2.5 text-sm font-medium text-[var(--ak-color-text-primary)] bg-[var(--ak-color-bg-surface-muted)] hover:bg-[var(--ak-color-bg-hover)] rounded-xl transition-colors"
            >
              Abbrechen
            </button>
          )}
          <button
            onClick={handleTestAndSave}
            disabled={!email || !password || !host}
            className="flex-1 px-4 py-2.5 bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] rounded-xl hover:bg-[var(--ak-color-accent-strong)] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
          >
            Verbindung testen
          </button>
        </div>
      </div>
    </div>
  )
}
