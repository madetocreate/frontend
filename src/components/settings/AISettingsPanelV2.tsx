'use client';

import { useState, useEffect } from 'react';
import { AkButton } from '@/components/ui/AkButton';
import { AkCard } from '@/components/ui/AkCard';
import { AkBadge } from '@/components/ui/AkBadge';
import { AkAlert } from '@/components/ui/AkAlert';
import {
  Sparkles,
  Brain,
  Zap,
  Shield,
  TrendingUp,
  HelpCircle,
  AlertTriangle,
  Beaker,
  CheckCircle2,
  Rocket,
  UserCircle,
  MessageSquare,
  ChevronRight,
  Info,
  Layers,
  Activity,
  User,
  ShieldCheck,
  Cpu as CpuChipIcon
} from 'lucide-react';
import { getCustomInstructions, setCustomInstructions, loadCustomInstructions, CustomInstructions } from '@/lib/customInstructionsStore';
import { fetchMemoryList } from '@/features/memory/api';
import type { MemoryItem } from '@/features/memory/types';
import clsx from 'clsx';
import { getApiBaseUrl } from '@/lib/env';

const PERSONALITY_TONES = [
  { id: 'professional', label: 'Professionell', description: 'Sachlich, höflich und effizient.', icon: ShieldCheck },
  { id: 'friendly', label: 'Freundlich', description: 'Warmherzig, locker und einladend.', icon: Sparkles },
  { id: 'direct', label: 'Direkt', description: 'Kurz, prägnant und lösungsorientiert.', icon: Zap },
  { id: 'creative', label: 'Kreativ', description: 'Inspirierend, ausführlich und originell.', icon: Brain },
];

interface Feature {
  feature_id: string;
  name: string;
  description: string;
  category: 'basic' | 'advanced' | 'expert';
  enabled: boolean;
  default_enabled: boolean;
  requires_dependencies: boolean;
  performance_impact: string;
}

interface FeatureSettings {
  features: Record<string, Feature>;
  count: number;
}

const CATEGORY_CONFIG = {
  basic: {
    icon: Sparkles,
    label: 'Basis-Funktionen',
    description: 'Diese Funktionen sind immer aktiv und sorgen für intelligente Action-Vorschläge.',
    accent: 'inbox' as const,
  },
  advanced: {
    icon: Brain,
    label: 'KI-Erweiterungen',
    description: 'Zusätzliche KI-Features für noch präzisere Analysen und Vorschläge.',
    accent: 'marketing' as const,
  },
  expert: {
    icon: Beaker,
    label: 'Experten-Optionen',
    description: 'Experimentelle Features für fortgeschrittene Automatisierungen.',
    accent: 'graphite' as const,
  },
};

export function AISettingsPanelV2({ mode = 'simple' }: { mode?: 'simple' | 'expert' }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [customInstructions, setCustomInstructionsState] = useState<CustomInstructions>({
    about: '',
    responseStyle: '',
    enabled: false,
  });
  const [recentMemories, setRecentMemories] = useState<MemoryItem[]>([]);
  const [selectedTone, setSelectedTone] = useState('professional');

  useEffect(() => {
    loadFeatures();
    // Lade Custom Instructions aus Backend (mit localStorage Fallback)
    loadCustomInstructions().then((instructions) => {
      setCustomInstructionsState(instructions);
    }).catch((err) => {
      console.warn('Failed to load custom instructions, using defaults:', err);
      setCustomInstructionsState(getCustomInstructions());
    });
    loadRecentMemories();
  }, []);

  const loadRecentMemories = async () => {
    try {
      const result = await fetchMemoryList(undefined, 0, 5);
      setRecentMemories(result.items);
    } catch (err) {
      console.warn('Failed to load recent memories for AI panel', err);
    }
  };

  const handleCustomInstructionsChange = async (updates: Partial<CustomInstructions>) => {
    const updated = { ...customInstructions, ...updates };
    setCustomInstructionsState(updated);
    try {
      await setCustomInstructions(updates);
      setSuccessMessage('Anweisungen wurden gespeichert');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (error) {
      console.error('Failed to save custom instructions:', error);
      setSuccessMessage('Anweisungen wurden lokal gespeichert (Backend nicht verfügbar)');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const loadFeatures = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const response = await authedFetch('/api/actions/settings/features');
      
      if (!response.ok) {
        if (response.status === 404) {
          // Silent handling for 404 to avoid "loud" console errors
          console.warn('AI features endpoint not found (404). This is expected if backend is not yet connected.');
          setError('NOT_FOUND');
          setLoading(false);
          return;
        }
        throw new Error('API_ERROR');
      }
      
      const data: FeatureSettings = await response.json();
      setFeatures(Object.values(data.features));
      setLoading(false);
    } catch (err) {
      // For non-404 errors, we log as warning
      console.warn('Failed to load AI features:', err);
      setError('API_ERROR');
      setLoading(false);
    }
  };

  const toggleFeature = async (featureId: string, enabled: boolean) => {
    try {
      setSaving(featureId);
      setError(null);
      
      const response = await fetch(`/api/actions/settings/features/${featureId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      
      if (!response.ok) throw new Error('Update failed');
      
      const result = await response.json();
      
      if (!result.success) {
        setError(result.message || 'Einstellung konnte nicht aktualisiert werden');
      } else {
        setSuccessMessage(enabled ? 'Feature wurde aktiviert' : 'Feature wurde deaktiviert');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
      await loadFeatures();
    } catch (err) {
      console.error('Failed to toggle feature:', err);
      setError('Verbindung zum Server fehlgeschlagen');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-[var(--ak-color-bg-surface-muted)]/50 rounded-2xl animate-pulse" />
        <div className="h-64 bg-[var(--ak-color-bg-surface-muted)]/30 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error === 'NOT_FOUND') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-[var(--ak-color-text-primary)] flex items-center gap-3">
            KI & Verhalten
          </h2>
          <p className="text-sm text-[var(--ak-color-text-muted)] font-medium mt-1">
            Steuere, wie AKLOW antwortet und welche Features aktiv sind. KI-Modelle werden automatisch gewählt.
          </p>
        </div>

        {/* --- PERSONALITY --- */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <Brain className="w-5 h-5 text-[var(--ak-color-text-muted)] opacity-60" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)]">
              AI-Persönlichkeit & Tonfall
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PERSONALITY_TONES.map((tone) => (
              <AkCard 
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                className={clsx(
                  "p-4 cursor-pointer transition-all border-2",
                  selectedTone === tone.id 
                    ? "border-[var(--ak-color-accent)] bg-[var(--ak-color-accent-soft)]/5" 
                    : "border-transparent hover:border-[var(--ak-color-border-subtle)]"
                )}
              >
                <div className="flex flex-col gap-2">
                  <tone.icon className={clsx(
                    "w-6 h-6",
                    selectedTone === tone.id ? "text-[var(--ak-color-accent)]" : "text-[var(--ak-color-text-muted)]"
                  )} />
                  <div className="font-bold text-sm text-[var(--ak-color-text-primary)]">{tone.label}</div>
                  <p className="text-[11px] text-[var(--ak-color-text-muted)] leading-tight">{tone.description}</p>
                </div>
              </AkCard>
            ))}
          </div>
        </div>

        {/* --- CUSTOM INSTRUCTIONS --- */}
        <AkCard className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--ak-color-accent-soft)]/20 flex items-center justify-center text-[var(--ak-color-accent)]">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--ak-color-text-primary)]">Custom Instructions</h3>
                <p className="text-xs text-[var(--ak-color-text-muted)] font-medium mt-0.5">Gib der KI Kontext für bessere Antworten (ähnlich wie in ChatGPT).</p>
              </div>
            </div>
            <button
              onClick={() => handleCustomInstructionsChange({ enabled: !customInstructions.enabled })}
              className={clsx(
                "w-12 h-6 rounded-full transition-all duration-300 relative",
                customInstructions.enabled ? "bg-[var(--ak-color-accent)]" : "bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-fine)]"
              )}
            >
              <div className={clsx(
                "absolute top-1 w-4 h-4 rounded-full bg-[var(--ak-color-bg-surface)] transition-all shadow-sm",
                customInstructions.enabled ? "left-7" : "left-1"
              )} />
            </button>
          </div>

          <div className={clsx(
            "grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500",
            !customInstructions.enabled && "opacity-40 grayscale pointer-events-none scale-[0.98]"
          )}>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[var(--ak-color-text-primary)] font-bold text-sm">
                <UserCircle className="w-4 h-4 text-[var(--ak-color-accent)]" />
                <span>Was soll die KI über dich wissen?</span>
              </div>
              <textarea
                className="w-full h-32 p-4 bg-[var(--ak-color-bg-surface-muted)]/30 border border-[var(--ak-color-border-fine)] rounded-2xl text-[13px] font-medium focus:ring-2 focus:ring-[var(--ak-color-accent-soft)] outline-none transition-all resize-none"
                placeholder="z.B. 'Ich bin Inhaber eines Cafés in Berlin, mein Fokus liegt auf Nachhaltigkeit...'"
                value={customInstructions.about}
                onChange={(e) => handleCustomInstructionsChange({ about: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[var(--ak-color-text-primary)] font-bold text-sm">
                <Zap className="w-4 h-4 text-[var(--ak-color-accent)]" />
                <span>Wie soll die KI antworten?</span>
              </div>
              <textarea
                className="w-full h-32 p-4 bg-[var(--ak-color-bg-surface-muted)]/30 border border-[var(--ak-color-border-fine)] rounded-2xl text-[13px] font-medium focus:ring-2 focus:ring-[var(--ak-color-accent-soft)] outline-none transition-all resize-none"
                placeholder="z.B. 'Antworte immer professionell aber nahbar. Benutze Emojis sparsam...'"
                value={customInstructions.responseStyle}
                onChange={(e) => handleCustomInstructionsChange({ responseStyle: e.target.value })}
              />
            </div>
          </div>
        </AkCard>

        {/* --- MEMORY INSIGHT --- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-[var(--ak-color-text-muted)] opacity-60" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)]">
                Aktuelles AI-Gedächtnis
              </h4>
            </div>
            <AkButton variant="ghost" size="sm" onClick={() => window.location.href = '/settings?view=memory'} className="text-[10px] font-bold uppercase">
              Vollständiges Memory verwalten <ChevronRight className="w-3 h-3 ml-1" />
            </AkButton>
          </div>
          
          <AkCard className="overflow-hidden border-dashed">
            <div className="divide-y divide-[var(--ak-color-border-fine)]">
              {recentMemories.length === 0 ? (
                <div className="p-8 text-center text-sm text-[var(--ak-color-text-muted)] italic">
                  Noch keine gespeicherten Fakten oder Präferenzen vorhanden.
                </div>
              ) : (
                recentMemories.map((memory) => (
                  <div key={memory.id} className="p-4 flex items-start gap-4 hover:bg-[var(--ak-color-bg-surface-muted)]/30 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4 text-[var(--ak-color-text-muted)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-[var(--ak-color-text-primary)] font-medium line-clamp-2">{memory.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <AkBadge tone="neutral" size="xs" className="text-[9px] uppercase tracking-tighter">{memory.type}</AkBadge>
                        <span className="text-[10px] text-[var(--ak-color-text-muted)] italic">Quelle: {memory.source}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </AkCard>
        </div>

        {/* --- SYSTEM INFO (Expert Mode) --- */}
        {mode === 'expert' && (
          <div className="space-y-6 pt-8 border-t border-[var(--ak-color-border-fine)]">
            <div className="flex items-center gap-3 px-2">
              <CpuChipIcon className="w-5 h-5 text-[var(--ak-color-text-muted)] opacity-60" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)]">
                System-Informationen
              </h4>
            </div>
            <AkCard className="p-6 space-y-4 bg-[var(--ak-color-bg-surface-muted)]/30">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[var(--ak-color-text-primary)] font-bold text-sm">
                  <Info className="w-4 h-4 text-[var(--ak-color-accent)]" />
                  <span>KI wird automatisch gewählt</span>
                </div>
                <p className="text-[13px] text-[var(--ak-color-text-muted)] font-medium">
                  Die KI-Modell-Auswahl, Temperatur und Sampling-Parameter werden automatisch vom System konfiguriert. 
                  Keine manuelle Konfiguration erforderlich.
                </p>
                <div className="pt-3 border-t border-[var(--ak-color-border-fine)] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--ak-color-text-muted)] font-medium">Orchestrator API:</span>
                    <span className="text-[var(--ak-color-text-secondary)] font-mono">
                      {getApiBaseUrl().replace(/\/+$/, '')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--ak-color-text-muted)] font-medium">Agent Backend:</span>
                    <span className="text-[var(--ak-color-text-secondary)] font-mono">
                      {process.env.NEXT_PUBLIC_AGENT_BACKEND_URL || 'http://localhost:8000'}
                    </span>
                  </div>
                </div>
              </div>
            </AkCard>
          </div>
        )}

        {/* API Info */}
        <div className="flex items-center gap-3 p-4 bg-[var(--ak-color-bg-surface-muted)]/30 rounded-2xl border border-[var(--ak-color-border-fine)] border-dashed">
          <Info className="w-5 h-5 text-[var(--ak-color-text-muted)]" />
          <p className="text-xs text-[var(--ak-color-text-muted)] font-medium">
            Alle KI-Modelle werden lokal oder via verschlüsseltem Gateway verarbeitet. Deine Daten verlassen den EU-Raum nicht ohne explizite Freigabe.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--ak-color-text-primary)] flex items-center gap-3">
          KI & Verhalten
        </h2>
        <p className="text-sm text-[var(--ak-color-text-muted)] font-medium mt-1">
          Steuere, wie AKLOW antwortet und welche Features aktiv sind. KI-Modelle werden automatisch gewählt.
        </p>
      </div>

      {successMessage && (
        <div className="fixed bottom-8 right-8 z-[300] animate-in slide-in-from-right-10 duration-300">
          <div className="bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-bold">
            <CheckCircle2 className="w-5 h-5" />
            {successMessage}
          </div>
        </div>
      )}

      {/* --- PERSONALITY --- */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <Brain className="w-5 h-5 text-[var(--ak-color-text-muted)] opacity-60" />
          <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)]">
            AI-Persönlichkeit & Tonfall
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PERSONALITY_TONES.map((tone) => (
            <AkCard 
              key={tone.id}
              onClick={() => setSelectedTone(tone.id)}
              className={clsx(
                "p-4 cursor-pointer transition-all border-2",
                selectedTone === tone.id 
                  ? "border-[var(--ak-color-accent)] bg-[var(--ak-color-accent-soft)]/5" 
                  : "border-transparent hover:border-[var(--ak-color-border-subtle)]"
              )}
            >
              <div className="flex flex-col gap-2">
                <tone.icon className={clsx(
                  "w-6 h-6",
                  selectedTone === tone.id ? "text-[var(--ak-color-accent)]" : "text-[var(--ak-color-text-muted)]"
                )} />
                <div className="font-bold text-sm text-[var(--ak-color-text-primary)]">{tone.label}</div>
                <p className="text-[11px] text-[var(--ak-color-text-muted)] leading-tight">{tone.description}</p>
              </div>
            </AkCard>
          ))}
        </div>
      </div>

      {/* --- BENUTZERANWEISUNGEN --- */}
      <AkCard className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--ak-color-accent-soft)]/20 flex items-center justify-center text-[var(--ak-color-accent)]">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--ak-color-text-primary)]">Custom Instructions</h3>
              <p className="text-xs text-[var(--ak-color-text-muted)] font-medium mt-0.5">Gib der KI Kontext für bessere Antworten.</p>
            </div>
          </div>
          <button
            onClick={() => handleCustomInstructionsChange({ enabled: !customInstructions.enabled })}
            className={clsx(
              "w-12 h-6 rounded-full transition-all duration-300 relative",
              customInstructions.enabled ? "bg-[var(--ak-color-accent)]" : "bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-fine)]"
            )}
          >
          <div className={clsx(
            "absolute top-1 w-4 h-4 rounded-full bg-[var(--ak-color-bg-surface)] transition-all shadow-sm",
            customInstructions.enabled ? "left-7" : "left-1"
          )} />
          </button>
        </div>

        <div className={clsx(
          "grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500",
          !customInstructions.enabled && "opacity-40 grayscale pointer-events-none scale-[0.98]"
        )}>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[var(--ak-color-text-primary)] font-bold text-sm">
              <UserCircle className="w-4 h-4 text-[var(--ak-color-accent)]" />
              <span>Was soll die KI über dich wissen?</span>
            </div>
            <textarea
              className="w-full h-32 p-4 bg-[var(--ak-color-bg-surface-muted)]/30 border border-[var(--ak-color-border-fine)] rounded-2xl text-[13px] font-medium focus:ring-2 focus:ring-[var(--ak-color-accent-soft)] outline-none transition-all resize-none"
              placeholder="z.B. 'Ich bin Inhaber eines Cafés in Berlin, mein Fokus liegt auf Nachhaltigkeit...'"
              value={customInstructions.about}
              onChange={(e) => handleCustomInstructionsChange({ about: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[var(--ak-color-text-primary)] font-bold text-sm">
              <Zap className="w-4 h-4 text-[var(--ak-color-accent)]" />
              <span>Wie soll die KI antworten?</span>
            </div>
            <textarea
              className="w-full h-32 p-4 bg-[var(--ak-color-bg-surface-muted)]/30 border border-[var(--ak-color-border-fine)] rounded-2xl text-[13px] font-medium focus:ring-2 focus:ring-[var(--ak-color-accent-soft)] outline-none transition-all resize-none"
              placeholder="z.B. 'Antworte immer professionell aber nahbar. Benutze Emojis sparsam...'"
              value={customInstructions.responseStyle}
              onChange={(e) => handleCustomInstructionsChange({ responseStyle: e.target.value })}
            />
          </div>
        </div>
      </AkCard>

      {/* --- MEMORY INSIGHT --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-[var(--ak-color-text-muted)] opacity-60" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)]">
              Aktuelles AI-Gedächtnis
            </h4>
          </div>
          <AkButton variant="ghost" size="sm" onClick={() => window.location.href = '/settings?view=memory'} className="text-[10px] font-bold uppercase">
            Vollständiges Memory verwalten <ChevronRight className="w-3 h-3 ml-1" />
          </AkButton>
        </div>
        
        <AkCard className="overflow-hidden border-dashed">
          <div className="divide-y divide-[var(--ak-color-border-fine)]">
            {recentMemories.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--ak-color-text-muted)] italic">
                Noch keine gespeicherten Fakten oder Präferenzen vorhanden.
              </div>
            ) : (
              recentMemories.map((memory) => (
                <div key={memory.id} className="p-4 flex items-start gap-4 hover:bg-[var(--ak-color-bg-surface-muted)]/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4 text-[var(--ak-color-text-muted)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[var(--ak-color-text-primary)] font-medium line-clamp-2">{memory.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <AkBadge tone="neutral" size="xs" className="text-[9px] uppercase tracking-tighter">{memory.type}</AkBadge>
                      <span className="text-[10px] text-[var(--ak-color-text-muted)] italic">Quelle: {memory.source}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </AkCard>
      </div>

      {/* --- FEATURES --- */}
      <div className="space-y-6">
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const categoryFeatures = features.filter(f => f.category === key);
          if (categoryFeatures.length === 0) return null;

          return (
            <div key={key} className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <config.icon className="w-5 h-5 text-[var(--ak-color-text-muted)] opacity-60" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)]">
                  {config.label}
                </h4>
              </div>
              
              <div className="space-y-3">
                {categoryFeatures.map((feature) => {
                  const isBasic = feature.category === 'basic';
                  return (
                    <AkCard key={feature.feature_id} className="p-5 hover:bg-[var(--ak-color-bg-hover)] transition-all group">
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-bold text-[var(--ak-color-text-primary)] text-[15px] truncate">
                              {feature.name}
                            </h5>
                            {isBasic && (
                              <AkBadge tone="neutral" size="sm" className="bg-[var(--ak-color-bg-surface-muted)]">Immer Aktiv</AkBadge>
                            )}
                            {feature.requires_dependencies && (
                              <AkBadge tone="neutral" size="sm" className="bg-[var(--ak-color-accent-soft)]/20 text-[var(--ak-color-accent)] border-none">ML Boost</AkBadge>
                            )}
                          </div>
                          <p className="text-[13px] text-[var(--ak-color-text-muted)] font-medium line-clamp-2">
                            {feature.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold uppercase tracking-tighter text-[var(--ak-color-text-muted)] opacity-50 mb-1">Impact</p>
                            <AkBadge tone={feature.performance_impact === 'high' ? 'warning' : 'neutral'} size="sm">
                              {feature.performance_impact?.toUpperCase() || 'LOW'}
                            </AkBadge>
                          </div>
                          
                          <button
                            onClick={() => !isBasic && toggleFeature(feature.feature_id, !feature.enabled)}
                            disabled={isBasic || saving === feature.feature_id}
                            className={clsx(
                              "w-11 h-6 rounded-full transition-all duration-300 relative",
                              feature.enabled ? "bg-[var(--ak-color-accent)]" : "bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-fine)]",
                              isBasic && "opacity-50 grayscale cursor-not-allowed"
                            )}
                          >
                        <div className={clsx(
                          "absolute top-1 w-4 h-4 rounded-full transition-all shadow-sm",
                          feature.enabled ? "left-6 bg-[var(--ak-color-bg-surface)]" : "left-1 bg-[var(--ak-color-text-muted)]"
                        )} />
                          </button>
                        </div>
                      </div>
                    </AkCard>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- SYSTEM INFO (Expert Mode) --- */}
      {mode === 'expert' && (
        <div className="space-y-6 pt-8 border-t border-[var(--ak-color-border-fine)]">
          <div className="flex items-center gap-3 px-2">
            <CpuChipIcon className="w-5 h-5 text-[var(--ak-color-text-muted)] opacity-60" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)]">
              System-Informationen
            </h4>
          </div>
          <AkCard className="p-6 space-y-4 bg-[var(--ak-color-bg-surface-muted)]/30">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[var(--ak-color-text-primary)] font-bold text-sm">
                <Info className="w-4 h-4 text-[var(--ak-color-accent)]" />
                <span>KI wird automatisch gewählt</span>
              </div>
              <p className="text-[13px] text-[var(--ak-color-text-muted)] font-medium">
                Die KI-Modell-Auswahl, Temperatur und Sampling-Parameter werden automatisch vom System konfiguriert. 
                Keine manuelle Konfiguration erforderlich.
              </p>
              <div className="pt-3 border-t border-[var(--ak-color-border-fine)] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--ak-color-text-muted)] font-medium">Orchestrator API:</span>
                  <span className="text-[var(--ak-color-text-secondary)] font-mono">
                    {getApiBaseUrl().replace(/\/+$/, '')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--ak-color-text-muted)] font-medium">Agent Backend:</span>
                  <span className="text-[var(--ak-color-text-secondary)] font-mono">
                    {process.env.NEXT_PUBLIC_AGENT_BACKEND_URL || 'http://localhost:8000'}
                  </span>
                </div>
              </div>
            </div>
          </AkCard>
        </div>
      )}

      {/* API Info */}
      <div className="flex items-center gap-3 p-4 bg-[var(--ak-color-bg-surface-muted)]/30 rounded-2xl border border-[var(--ak-color-border-fine)] border-dashed">
        <Info className="w-5 h-5 text-[var(--ak-color-text-muted)]" />
        <p className="text-xs text-[var(--ak-color-text-muted)] font-medium">
          Alle KI-Modelle werden lokal oder via verschlüsseltem Gateway verarbeitet. Deine Daten verlassen den EU-Raum nicht ohne explizite Freigabe.
        </p>
      </div>
    </div>
  );
}

