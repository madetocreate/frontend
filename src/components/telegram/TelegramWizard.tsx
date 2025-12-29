'use client'

import { useState, useEffect } from 'react'
import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ServerIcon,
  KeyIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { authedFetch } from '@/lib/api/authedFetch'

type WizardStep = 'instructions' | 'token-input' | 'verifying' | 'success' | 'error'

interface TelegramWizardProps {
  // tenantId removed - server extracts from JWT
  onConnect?: () => void
  onCancel?: () => void
}

export function TelegramWizard({ onConnect, onCancel }: TelegramWizardProps) {
  const [step, setStep] = useState<WizardStep>('instructions')
  const [botToken, setBotToken] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [botUsername, setBotUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [integration, setIntegration] = useState<any>(null)
  
  // Validation Animation State
  const [validationStage, setValidationStage] = useState<number>(0)

  const handleConnect = async () => {
    if (!botToken.trim()) {
      setError('Bot Token ist erforderlich')
      return
    }

    setStep('verifying')
    setValidationStage(0)
    setError(null)

    // Simulate Step 1 (Server Connect) immediately
    setTimeout(() => setValidationStage(1), 400)

    try {
      // Parallel: API Request & Animation
      const responsePromise = authedFetch('/api/telegram/customer/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botToken: botToken.trim(),
          displayName: displayName.trim() || undefined,
          botUsername: botUsername.trim() || undefined,
        }),
      })

      // Simulate Step 2 (Token Check) after a bit
      setTimeout(() => setValidationStage(2), 1200)

      const response = await responsePromise

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setIntegration(data.integration || data)
      
      // Step 3 (Success)
      setValidationStage(3)
      
      // Delay transition to success screen slightly to show all checks green
      setTimeout(() => {
        setStep('success')
        if (onConnect) {
          setTimeout(() => onConnect(), 2000)
        }
      }, 800)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verbindung fehlgeschlagen')
      setStep('error')
    }
  }

  const handleDisconnect = async () => {
    try {
      const response = await authedFetch('/api/telegram/customer/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Trennen fehlgeschlagen')
      }

      setStep('instructions')
      setBotToken('')
      setDisplayName('')
      setBotUsername('')
      setIntegration(null)
      if (onConnect) {
        onConnect()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Trennen')
    }
  }

  // --- Subcomponents for States ---

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
           <p className="text-xs text-[var(--ak-color-accent)] animate-pulse mt-0.5">Wird geprüft...</p>
         )}
       </div>
    </div>
  )

  if (step === 'success' && integration) {
    return (
      <div className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] p-6 space-y-6 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center justify-center text-center gap-4 py-4">
          <div className="h-16 w-16 rounded-full bg-[var(--ak-semantic-success-soft)] flex items-center justify-center border-2 border-[var(--ak-color-success)] shadow-sm">
             <CheckCircleIcon className="h-8 w-8 text-[var(--ak-color-success)]" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[var(--ak-color-text-primary)]">
              Telegram Bot verbunden!
            </h3>
            <p className="text-sm text-[var(--ak-color-text-secondary)] mt-1">
              Dein Bot <strong>@{integration.botUsername || integration.displayName}</strong> ist jetzt aktiv.
            </p>
          </div>
        </div>
        
        <div className="bg-[var(--ak-surface-1)] rounded-xl border border-[var(--ak-color-border-subtle)] p-4 space-y-2">
           <div className="flex justify-between text-sm">
              <span className="text-[var(--ak-color-text-secondary)]">Status</span>
              <span className="font-medium text-[var(--ak-color-success)] flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[var(--ak-color-success)]" />
                Verbunden
              </span>
           </div>
           <div className="flex justify-between text-sm">
              <span className="text-[var(--ak-color-text-secondary)]">Webhook</span>
              <span className="font-medium text-[var(--ak-color-text-primary)]">Aktiv</span>
           </div>
        </div>

        <button
          onClick={handleDisconnect}
          className="w-full mt-4 px-4 py-2 text-sm font-medium text-[var(--ak-color-danger)] hover:text-[var(--ak-color-danger-strong)] hover:bg-[var(--ak-color-bg-danger-soft)] rounded-lg transition-colors border border-transparent hover:border-[var(--ak-color-danger)]/20"
        >
          Verbindung trennen
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
              setStep('token-input')
              setError(null)
            }}
            className="px-4 py-2 text-sm font-medium text-[var(--ak-color-danger-strong)] bg-white/50 hover:bg-white/80 rounded-lg transition-colors shadow-sm"
          >
            Erneut versuchen
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-[var(--ak-color-text-primary)] bg-[var(--ak-color-bg-surface-muted)] hover:bg-[var(--ak-color-bg-hover)] rounded-lg transition-colors"
            >
              Abbrechen
            </button>
          )}
        </div>
      </div>
    )
  }

  if (step === 'verifying') {
    return (
      <div className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] p-6 space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-[var(--ak-color-border-fine)]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--ak-color-accent)] border-t-transparent" />
          <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
            Verbinde Bot...
          </h3>
        </div>
        
        <div className="space-y-2">
           <ValidationItem 
             label="Verbindung zum Server" 
             icon={ServerIcon}
             isActive={validationStage >= 0}
             isCompleted={validationStage >= 1}
           />
           <ValidationItem 
             label="Validiere Bot Token" 
             icon={KeyIcon}
             isActive={validationStage >= 1}
             isCompleted={validationStage >= 2}
           />
           <ValidationItem 
             label="Webhook Konfiguration" 
             icon={BoltIcon}
             isActive={validationStage >= 2}
             isCompleted={validationStage >= 3}
           />
        </div>
      </div>
    )
  }

  if (step === 'instructions') {
    return (
      <div className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] p-6 space-y-6 animate-in slide-in-from-left-4 duration-300">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[var(--ak-semantic-info-soft)] flex items-center justify-center">
             <ChatBubbleLeftRightIcon className="h-6 w-6 text-[var(--ak-semantic-info)]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
              Telegram verbinden
            </h3>
            <p className="text-xs text-[var(--ak-color-text-secondary)]">Erstelle einen Bot via BotFather</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="bg-[var(--ak-surface-1)] rounded-xl border border-[var(--ak-color-border-subtle)] p-4 font-mono text-sm space-y-3 shadow-sm">
              <div className="flex items-center justify-between group">
                <span className="text-[var(--ak-color-text-secondary)]">1. Suche nach</span>
                <code className="px-2 py-1 bg-[var(--ak-surface-2)] rounded border border-[var(--ak-color-border-fine)] text-[var(--ak-color-text-primary)] select-all cursor-text">@BotFather</code>
              </div>
              <div className="flex items-center justify-between group">
                <span className="text-[var(--ak-color-text-secondary)]">2. Sende Befehl</span>
                <div className="flex items-center gap-2">
                  <code className="px-2 py-1 bg-[var(--ak-surface-2)] rounded border border-[var(--ak-color-border-fine)] text-[var(--ak-color-accent)] font-bold select-all cursor-text">/newbot</code>
                  <button
                    onClick={() => navigator.clipboard.writeText('/newbot')}
                    className="p-1 hover:bg-[var(--ak-color-bg-hover)] rounded text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-primary)] transition-colors"
                    title="Kopieren"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--ak-color-text-secondary)]">3. Kopiere Token</span>
                <span className="text-[10px] uppercase tracking-wide text-[var(--ak-color-text-muted)]">WICHTIG</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep('token-input')}
            className="w-full px-4 py-2.5 bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] rounded-xl hover:bg-[var(--ak-color-accent-strong)] transition-all font-medium shadow-sm hover:shadow active:scale-[0.98]"
          >
            Ich habe den Token
          </button>
        </div>
      </div>
    )
  }

  // token-input step
  return (
    <div className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] p-6 space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[var(--ak-surface-2)] flex items-center justify-center border border-[var(--ak-color-border-subtle)]">
           <KeyIcon className="h-5 w-5 text-[var(--ak-color-text-secondary)]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
            Token eingeben
          </h3>
          <p className="text-xs text-[var(--ak-color-text-secondary)]">Paste den API Token hier</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-1.5">
            Bot Token <span className="text-[var(--ak-color-danger)]">*</span>
          </label>
          <input
            type="password"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
            className="w-full px-4 py-2.5 border border-[var(--ak-color-border-subtle)] rounded-xl bg-[var(--ak-surface-1)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-focus-ring-color)] transition-shadow font-mono text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-1.5">
              Name (opt.)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Mein Bot"
              className="w-full px-4 py-2.5 border border-[var(--ak-color-border-subtle)] rounded-xl bg-[var(--ak-surface-1)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-focus-ring-color)] transition-shadow text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-1.5">
              Username (opt.)
            </label>
            <input
              type="text"
              value={botUsername}
              onChange={(e) => setBotUsername(e.target.value.replace('@', ''))}
              placeholder="meinbot"
              className="w-full px-4 py-2.5 border border-[var(--ak-color-border-subtle)] rounded-xl bg-[var(--ak-surface-1)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-focus-ring-color)] transition-shadow text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-[var(--ak-color-bg-danger-soft)] border border-[var(--ak-color-danger)] rounded-xl text-sm text-[var(--ak-color-danger-strong)] animate-in shake">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => {
              setStep('instructions')
              setError(null)
            }}
            className="px-4 py-2.5 text-sm font-medium text-[var(--ak-color-text-primary)] bg-[var(--ak-color-bg-surface-muted)] hover:bg-[var(--ak-color-bg-hover)] rounded-xl transition-colors"
          >
            Zurück
          </button>
          <button
            onClick={handleConnect}
            disabled={!botToken.trim()}
            className="flex-1 px-4 py-2.5 bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] rounded-xl hover:bg-[var(--ak-color-accent-strong)] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
          >
            Verifizieren & Verbinden
          </button>
        </div>
      </div>
    </div>
  )
}
