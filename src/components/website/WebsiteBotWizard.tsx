'use client'

import { useState } from 'react'
import {
  GlobeAltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { WizardShell } from '@/components/onboarding/WizardShell'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import clsx from 'clsx'
import { 
  appleInputStyle, 
  appleButtonStyle, 
  appleCardStyle,
  appleSectionTitle,
  appleSubTitle
} from '@/lib/appleDesign'
import { authedFetch } from '@/lib/api/authedFetch'

type WizardStep = 1 | 2 | 3 | 4

interface WebsiteBotWizardProps {
  // tenantId removed - server extracts from JWT
  onComplete?: () => void
  onCancel?: () => void
}

interface InstallationData {
  name: string
  allowed_domains: string[]
  status: 'active' | 'inactive'
}

interface SettingsData {
  mode: 'suggest_only' | 'auto_reply'
  handoff_enabled: boolean
  lead_capture_enabled: boolean
  brand_voice: string
  signature: string
}

export function WebsiteBotWizard({ onComplete, onCancel }: WebsiteBotWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [installation, setInstallation] = useState<InstallationData>({
    name: '',
    allowed_domains: [],
    status: 'inactive',
  })
  const [settings, setSettings] = useState<SettingsData>({
    mode: 'suggest_only',
    handoff_enabled: true,
    lead_capture_enabled: true,
    brand_voice: '',
    signature: '',
  })
  const [domainInput, setDomainInput] = useState('')
  const [siteKey, setSiteKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const [testResponse, setTestResponse] = useState<string | null>(null)

  const backendUrl = process.env.NEXT_PUBLIC_AGENT_BACKEND_URL || 'http://127.0.0.1:8000'

  const addDomain = () => {
    const domain = domainInput.trim().toLowerCase()
    if (domain && !installation.allowed_domains.includes(domain)) {
      setInstallation({
        ...installation,
        allowed_domains: [...installation.allowed_domains, domain],
      })
      setDomainInput('')
    }
  }

  const removeDomain = (domain: string) => {
    setInstallation({
      ...installation,
      allowed_domains: installation.allowed_domains.filter((d) => d !== domain),
    })
  }

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!installation.name.trim()) {
        setError('Name ist erforderlich')
        return
      }
      if (installation.allowed_domains.length === 0) {
        setError('Mindestens eine Domain ist erforderlich')
        return
      }
      setError(null)
      setCurrentStep(2)
    } else if (currentStep === 2) {
      setError(null)
      setCurrentStep(3)
    } else if (currentStep === 3) {
      // Create installation
      setLoading(true)
      setError(null)
      try {
        const response = await authedFetch(
          `/api/website/installations`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: installation.name,
              allowed_domains: installation.allowed_domains,
              status: 'active',
            }),
          }
        )

        if (!response.ok) {
          const data = await response.json().catch(() => ({ detail: 'Unknown error' }))
          throw new Error(data.error || data.detail || `HTTP ${response.status}`)
        }

        const data = await response.json()
        setSiteKey(data.site_key)

        // Create/update settings
        await authedFetch(`/api/website/settings`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mode: settings.mode,
            handoff_enabled: settings.handoff_enabled,
            lead_capture_enabled: settings.lead_capture_enabled,
            brand_voice: settings.brand_voice || undefined,
            signature: settings.signature || undefined,
          }),
        })

        setCurrentStep(4)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Erstellen')
      } finally {
        setLoading(false)
      }
    } else if (currentStep === 4) {
      if (onComplete) {
        onComplete()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep)
      setError(null)
    }
  }

  const copyEmbedSnippet = () => {
    if (!siteKey) return
    const snippet = `<script src="${window.location.origin}/widget.js" data-site-key="${siteKey}" async></script>`
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sendTestMessage = async () => {
    if (!siteKey || !testMessage.trim()) return
    setLoading(true)
    setTestResponse(null)
    try {
      const response = await fetch(`${backendUrl}/public/website/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          site_key: siteKey,
          message: testMessage,
        }),
      })

      if (!response.ok) {
        throw new Error('Test fehlgeschlagen')
      }

      const data = await response.json()
      setTestResponse(data.reply_text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  // --- Mock Browser Preview Component ---
  const MockBrowserPreview = ({ 
    step, 
    settings 
  }: { 
    step: number, 
    settings: SettingsData 
  }) => {
    return (
      <div className="w-full h-full min-h-[400px] bg-[var(--ak-color-bg-surface)]/50 backdrop-blur-xl rounded-[var(--ak-radius-3xl)] border border-[var(--ak-color-border-subtle)] relative overflow-hidden ak-shadow-strong flex flex-col">
        {/* Browser Bar */}
        <div className="h-12 bg-white/70 backdrop-blur-xl border-b border-black/5 flex items-center px-6 gap-3 z-10">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]/50 shadow-inner" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24]/50 shadow-inner" />
            <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29]/50 shadow-inner" />
          </div>
          <div className="flex-1 flex justify-center">
             <div className="h-7 w-48 bg-black/5 rounded-lg flex items-center justify-center text-[10px] text-black/40 font-medium tracking-wide shadow-inner">
               deine-website.de
             </div>
          </div>
        </div>

        {/* Abstract Website Content */}
        <div className="flex-1 relative p-8 overflow-hidden bg-gradient-to-b from-[var(--ak-color-bg-surface)] to-[var(--ak-color-bg-surface-muted)]/50">
          <div className="max-w-2xl mx-auto space-y-8 opacity-40 pointer-events-none select-none blur-[1px]">
             <div className="h-40 rounded-2xl bg-gradient-to-br from-[var(--ak-color-bg-surface-muted)] to-[var(--ak-color-bg-surface)]/50 shadow-sm" />
             <div className="grid grid-cols-2 gap-6">
                <div className="h-32 rounded-2xl bg-[var(--ak-color-bg-surface-muted)] shadow-sm" />
                <div className="h-32 rounded-2xl bg-[var(--ak-color-bg-surface-muted)] shadow-sm" />
             </div>
             <div className="space-y-4">
               <div className="h-4 w-3/4 bg-[var(--ak-color-bg-surface-muted)] rounded-full" />
               <div className="h-4 w-1/2 bg-[var(--ak-color-bg-surface-muted)] rounded-full" />
               <div className="h-4 w-5/6 bg-[var(--ak-color-bg-surface-muted)] rounded-full" />
             </div>
          </div>

          {/* Widget Preview based on Step */}
            <div className="absolute bottom-8 right-8 flex flex-col items-end gap-4 transition-all duration-500">
            {step >= 2 && (
              <div className="w-[320px] h-[450px] bg-[var(--ak-color-bg-surface)] rounded-[var(--ak-radius-2xl)] ak-shadow-strong border border-[var(--ak-color-border-subtle)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-500 ring-1 ring-[var(--ak-color-border-subtle)]">
                 {/* Chat Header */}
                 <div className="h-16 bg-[var(--ak-color-bg-surface)]/80 backdrop-blur-md border-b border-[var(--ak-color-border-subtle)] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                          <SparklesIcon className="h-4 w-4 text-[var(--ak-color-text-inverted)]" />
                       </div>
                       <div>
                          <span className="block font-semibold text-sm text-[var(--ak-color-text-primary)]">AI Assistant</span>
                          <span className="block text-[10px] text-[var(--ak-semantic-success)] font-medium">● Online</span>
                       </div>
                    </div>
                    <button className="p-2 hover:bg-[var(--ak-color-bg-hover)] rounded-full transition-colors">
                       <XMarkIcon className="h-5 w-5 text-[var(--ak-color-text-muted)]" />
                    </button>
                 </div>
                 
                 {/* Chat Body */}
                 <div className="flex-1 p-4 bg-[var(--ak-color-bg-surface-muted)]/50 flex flex-col gap-4 overflow-y-auto">
                    {/* Bot Welcome */}
                    <div className="flex gap-3 items-end">
                       <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--ak-semantic-info)] to-[var(--ak-accent-documents)] flex items-center justify-center shrink-0 shadow-sm mb-1">
                          <SparklesIcon className="h-3 w-3 text-[var(--ak-color-text-inverted)]" />
                       </div>
                       <div className="p-3 bg-[var(--ak-color-bg-surface)] rounded-2xl rounded-bl-none text-sm text-[var(--ak-color-text-primary)] shadow-sm border border-[var(--ak-color-border-subtle)]">
                          Hallo! 👋 Wie kann ich helfen?
                       </div>
                    </div>

                    {step === 4 && testMessage && (
                       <div className="flex gap-3 items-end flex-row-reverse animate-in slide-in-from-bottom-2 fade-in duration-300">
                          <div className="p-3 bg-[var(--ak-semantic-info)] text-[var(--ak-color-text-inverted)] rounded-2xl rounded-br-none text-sm shadow-md">
                             {testMessage}
                          </div>
                       </div>
                    )}

                    {step === 4 && testResponse && (
                       <div className="flex gap-3 items-end animate-in slide-in-from-bottom-2 fade-in duration-300 delay-150">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm mb-1">
                             <SparklesIcon className="h-3 w-3 text-[var(--ak-color-text-inverted)]" />
                          </div>
                          <div className="p-3 bg-[var(--ak-color-bg-surface)] rounded-2xl rounded-bl-none text-sm text-[var(--ak-color-text-primary)] shadow-sm border border-[var(--ak-color-border-subtle)]">
                             {testResponse}
                          </div>
                       </div>
                    )}
                 </div>

                 {/* Chat Input */}
                 <div className="p-4 bg-[var(--ak-color-bg-surface)] border-t border-[var(--ak-color-border-subtle)]">
                    <div className="h-10 bg-[var(--ak-color-bg-surface-muted)] rounded-full px-4 flex items-center justify-between transition-colors hover:bg-[var(--ak-color-bg-hover)] border border-transparent hover:border-[var(--ak-color-border-default)]">
                       <span className="text-sm text-[var(--ak-color-text-muted)]">Nachricht schreiben...</span>
                       <button className="p-1.5 bg-[var(--ak-semantic-info)] rounded-full text-[var(--ak-color-text-inverted)] shadow-sm hover:scale-105 active:scale-95 transition-all">
                          <PaperAirplaneIcon className="h-3 w-3" />
                       </button>
                    </div>
                 </div>
              </div>
            )}
            
            {/* Launcher Button */}
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 ak-shadow-colored flex items-center justify-center text-[var(--ak-color-text-inverted)] hover:scale-110 hover:-translate-y-1 transition-all duration-300 cursor-pointer ring-4 ring-[var(--ak-color-border-subtle)]">
               <ChatBubbleLeftRightIcon className="h-7 w-7" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div>
              <h2 className={appleSectionTitle}>Grunddaten</h2>
              <p className={appleSubTitle}>
                Wo soll der Bot eingesetzt werden?
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-2">
                  Name der Installation
                </label>
                <input
                  type="text"
                  value={installation.name}
                  onChange={(e) =>
                    setInstallation({ ...installation, name: e.target.value })
                  }
                  placeholder="z.B. Hauptseite"
                  className={appleInputStyle}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-2">
                  Erlaubte Domains
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addDomain()}
                    placeholder="example.com"
                    className={`${appleInputStyle} flex-1`}
                  />
                  <button
                    onClick={addDomain}
                    className={appleButtonStyle.secondary}
                  >
                    Hinzufügen
                  </button>
                </div>
                
                {installation.allowed_domains.length > 0 ? (
                   <div className="flex flex-wrap gap-2">
                    {installation.allowed_domains.map((domain) => (
                      <span
                        key={domain}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ak-surface-1)] text-[var(--ak-color-text-primary)] border border-[var(--ak-color-border-subtle)] rounded-full text-sm shadow-sm animate-in fade-in zoom-in-95"
                      >
                        <GlobeAltIcon className="h-3.5 w-3.5 text-[var(--ak-color-text-muted)]" />
                        {domain}
                        <button
                          onClick={() => removeDomain(domain)}
                          className="ml-1 text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-danger)] transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-[var(--ak-color-border-default)] rounded-xl text-center text-sm text-[var(--ak-color-text-muted)] bg-[var(--ak-surface-1)]/50">
                     Keine Domains hinzugefügt.
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div>
              <h2 className={appleSectionTitle}>Verhalten</h2>
              <p className={appleSubTitle}>
                Wie soll der Bot interagieren?
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-3">Modus</label>
                <div className="grid grid-cols-1 gap-3">
                  <label className={clsx(
                    "flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer shadow-sm",
                    settings.mode === 'suggest_only' 
                      ? "bg-[var(--ak-color-bg-selected)] border-[var(--ak-color-accent)] ring-1 ring-[var(--ak-color-accent)]" 
                      : "bg-[var(--ak-surface-1)] border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-color-border-strong)]"
                  )}>
                    <input
                      type="radio"
                      name="mode"
                      value="suggest_only"
                      checked={settings.mode === 'suggest_only'}
                      onChange={() => setSettings({ ...settings, mode: 'suggest_only' })}
                      className="h-5 w-5 text-[var(--ak-color-accent)] focus:ring-[var(--ak-color-accent)]"
                    />
                    <div>
                      <span className="block font-medium text-sm text-[var(--ak-color-text-primary)]">Nur Vorschläge (Copilot)</span>
                      <span className="text-xs text-[var(--ak-color-text-secondary)]">Bot schlägt Antworten vor, Mensch sendet.</span>
                    </div>
                  </label>
                  
                  <label className={clsx(
                    "flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer shadow-sm",
                    settings.mode === 'auto_reply' 
                      ? "bg-[var(--ak-color-bg-selected)] border-[var(--ak-color-accent)] ring-1 ring-[var(--ak-color-accent)]" 
                      : "bg-[var(--ak-surface-1)] border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-color-border-strong)]"
                  )}>
                    <input
                      type="radio"
                      name="mode"
                      value="auto_reply"
                      checked={settings.mode === 'auto_reply'}
                      onChange={() => setSettings({ ...settings, mode: 'auto_reply' })}
                      className="h-5 w-5 text-[var(--ak-color-accent)] focus:ring-[var(--ak-color-accent)]"
                    />
                    <div>
                      <span className="block font-medium text-sm text-[var(--ak-color-text-primary)]">Autopilot</span>
                      <span className="text-xs text-[var(--ak-color-text-secondary)]">Bot antwortet selbstständig auf Anfragen.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-4 bg-[var(--ak-surface-1)] border border-[var(--ak-color-border-subtle)] rounded-xl cursor-pointer hover:border-[var(--ak-color-border-strong)] transition-all shadow-sm">
                  <span className="text-sm font-medium text-[var(--ak-color-text-primary)]">Lead Capture aktivieren</span>
                  <input
                    type="checkbox"
                    checked={settings.lead_capture_enabled}
                    onChange={(e) =>
                      setSettings({ ...settings, lead_capture_enabled: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-[var(--ak-color-border-subtle)] text-[var(--ak-color-accent)] focus:ring-[var(--ak-color-accent)]"
                  />
                </label>
                <label className="flex items-center justify-between p-4 bg-[var(--ak-surface-1)] border border-[var(--ak-color-border-subtle)] rounded-xl cursor-pointer hover:border-[var(--ak-color-border-strong)] transition-all shadow-sm">
                  <span className="text-sm font-medium text-[var(--ak-color-text-primary)]">Human Handoff aktivieren</span>
                  <input
                    type="checkbox"
                    checked={settings.handoff_enabled}
                    onChange={(e) =>
                      setSettings({ ...settings, handoff_enabled: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-[var(--ak-color-border-subtle)] text-[var(--ak-color-accent)] focus:ring-[var(--ak-color-accent)]"
                  />
                </label>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div>
              <h2 className={appleSectionTitle}>Installieren</h2>
              <p className={appleSubTitle}>
                Integriere das Widget auf deiner Seite.
              </p>
            </div>

            {siteKey ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-[var(--ak-color-graphite-surface)] border border-[var(--ak-color-border-strong)] p-5 rounded-2xl font-mono text-sm relative group shadow-lg">
                  <div className="absolute top-0 left-0 right-0 h-8 bg-[var(--ak-color-bg-surface)]/5 border-b border-[var(--ak-color-border-subtle)]/25 flex items-center px-3 gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--ak-semantic-danger-soft)]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--ak-semantic-warning-soft)]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--ak-semantic-success-soft)]"></div>
                  </div>
                  <code className="text-[var(--ak-color-text-primary)] block overflow-x-auto whitespace-pre-wrap break-all pt-6 pb-2">
                    {`<script src="${window.location.origin}/widget.js" data-site-key="${siteKey}" async></script>`}
                  </code>
                  <button
                    onClick={copyEmbedSnippet}
                    className="absolute top-2 right-2 p-1.5 hover:bg-[var(--ak-color-bg-hover)] rounded-lg transition-colors text-[var(--ak-color-text-inverted)]/60 hover:text-[var(--ak-color-text-inverted)]"
                  >
                    {copied ? (
                      <CheckIcon className="h-4 w-4 text-[var(--ak-semantic-success)]" />
                    ) : (
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)] rounded-xl border border-[var(--ak-semantic-success-soft)] shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-[var(--ak-semantic-success-soft)] flex items-center justify-center shrink-0">
                    <CheckCircleIcon className="h-5 w-5 text-[var(--ak-color-text-inverted)]" />
                  </div>
                  <span className="text-sm font-medium">Site-Key generiert und aktiv!</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-[var(--ak-surface-1)] rounded-2xl border border-dashed border-[var(--ak-color-border-strong)]">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[var(--ak-color-border-subtle)] border-t-[var(--ak-color-accent)]" />
                <p className="mt-4 text-sm font-medium text-[var(--ak-color-text-secondary)]">
                  Installation wird erstellt...
                </p>
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-8">
            <div>
              <h2 className={appleSectionTitle}>Testen</h2>
              <p className={appleSubTitle}>
                Schick eine Nachricht an deinen neuen Bot.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-[var(--ak-color-text-primary)]">Test-Nachricht</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
                  placeholder="Hallo, was kostet der Service?"
                  className={`${appleInputStyle} flex-1`}
                />
                <button
                  onClick={sendTestMessage}
                  disabled={loading || !testMessage.trim()}
                  className={appleButtonStyle.primary}
                >
                  Senden
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 bg-[var(--ak-semantic-success-soft)] border border-[var(--ak-semantic-success-soft)] rounded-2xl shadow-sm">
              <div className="h-12 w-12 rounded-full bg-[var(--ak-semantic-success-soft)] flex items-center justify-center shrink-0">
                 <CheckCircleIcon className="h-6 w-6 text-[var(--ak-semantic-success)]" />
              </div>
              <div>
                <p className="font-semibold text-[var(--ak-color-text-primary)]">Setup vollständig</p>
                <p className="text-sm text-[var(--ak-color-text-secondary)] mt-0.5">
                  Dein Bot ist jetzt bereit für den Einsatz auf {installation.allowed_domains[0] || 'deiner Website'}.
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <WizardShell
      currentStep={currentStep}
      totalSteps={4}
      onClose={onCancel}
      showProgress={true}
      maxWidth="max-w-6xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 h-full p-2">
         {/* Left Column: Form */}
         <div className="flex flex-col h-full justify-between min-h-[400px]">
            <div className="animate-in slide-in-from-left-4 fade-in duration-500 ease-out">
               {error && (
                 <div className="mb-8 p-4 bg-[var(--ak-color-bg-danger-soft)] border border-[var(--ak-color-danger)] rounded-xl flex items-center gap-3 text-sm text-[var(--ak-color-danger-strong)] animate-in shake duration-300 shadow-sm">
                   <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
                   <span className="font-medium">{error}</span>
                 </div>
               )}

               {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-[var(--ak-color-border-fine)]">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={clsx(
                   appleButtonStyle.ghost,
                   "flex items-center gap-2",
                   currentStep === 1 ? "opacity-0 cursor-default" : ""
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                Zurück
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className={`${appleButtonStyle.primary} flex items-center gap-2 px-8 bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] border-none hover:bg-[var(--ak-color-accent-strong)]`}
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--ak-color-text-inverted)] border-t-transparent" />
                      Wird erstellt...
                    </>
                  ) : (
                    <>
                      Weiter
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={onComplete}
                  className="flex items-center gap-2 px-8 py-3 text-sm font-medium text-[var(--ak-color-text-inverted)] bg-[var(--ak-semantic-success)] rounded-xl hover:bg-[var(--ak-semantic-success-strong)] transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  Fertigstellen
                </button>
              )}
            </div>
         </div>

         {/* Right Column: Preview */}
         <div className="hidden lg:block h-full animate-in zoom-in-95 fade-in duration-700 delay-100 pl-4">
             <MockBrowserPreview step={currentStep} settings={settings} />
         </div>
      </div>
    </WizardShell>
  )
}
