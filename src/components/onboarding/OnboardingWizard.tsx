'use client';

import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Check,
  Globe,
  Inbox,
  Loader2,
  Sparkles,
  FileText,
  UploadCloud,
  X,
  AlertCircle,
  Clock,
  User,
  ShieldCheck,
  Flag,
  Zap
} from 'lucide-react';
import { WizardShell } from './WizardShell';
import { DropZone } from '../ui/DragAndDrop';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WebsiteScanResultCard, 
  DocumentScanResultCard,
  BackgroundScanCard,
  type WebsiteScanResult,
  type DocumentScanResult
} from './OnboardingResultCard';
import { WebsiteProfileDrawer } from './WebsiteProfileDrawer';
import { DocumentDetailsDrawer } from './DocumentDetailsDrawer';
import { RefreshCw } from 'lucide-react';

interface OnboardingWizardProps {
  onClose: () => void;
}

type StepStatus = 'idle' | 'running' | 'completed' | 'pending_background' | 'failed';

interface WizardState {
  company_name: string;
  website: string;
  use_website_data: boolean;
  
  // Website Fetch
  fetchRunId?: string;
  fetchStatus: StepStatus;
  fetchStartTime?: number;
  websiteResult?: WebsiteScanResult;
  websiteConfirmed: boolean;
  
  // Document Upload & Scan
  uploadedFiles: File[];
  uploadStatus: 'idle' | 'uploading' | 'completed' | 'failed';
  uploadResults?: { filename: string; status: string; error?: string }[];
  scanRunId?: string;
  scanStatus: StepStatus;
  scanStartTime?: number;
  documentResult?: DocumentScanResult;
  documentConfirmed: boolean;
  
  // Personality
  personalityVibe?: 'professional' | 'friendly' | 'enthusiastic';
}

const TOTAL_STEPS = 5; // 1: Identity, 2: Knowledge, 3: Personality, 4: Review, 5: Finish
const BACKGROUND_TIMEOUT_MS = 25000; // 25 seconds before moving to background

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onClose }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showDocDetailsDrawer, setShowDocDetailsDrawer] = useState(false);
  const [state, setState] = useState<WizardState>({
    company_name: '',
    website: '',
    use_website_data: true,
    fetchStatus: 'idle',
    websiteConfirmed: false,
    uploadedFiles: [],
    uploadStatus: 'idle',
    scanStatus: 'idle',
    documentConfirmed: false,
  });
  
  const fetchPollRef = useRef<NodeJS.Timeout | null>(null);
  const scanPollRef = useRef<NodeJS.Timeout | null>(null);
  const isOnboardingPage = typeof window !== 'undefined' ? window.location.pathname === '/onboarding' : false;

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (fetchPollRef.current) clearInterval(fetchPollRef.current);
      if (scanPollRef.current) clearInterval(scanPollRef.current);
    };
  }, []);

  // Poll for website fetch status
  useEffect(() => {
    if (!state.fetchRunId || state.fetchStatus !== 'running') return;

    const startPolling = async () => {
      const { authedFetch } = await import('@/lib/api/authedFetch');
      
      fetchPollRef.current = setInterval(async () => {
        // Check for timeout
        if (state.fetchStartTime && Date.now() - state.fetchStartTime > BACKGROUND_TIMEOUT_MS) {
          setState(prev => ({ ...prev, fetchStatus: 'pending_background' }));
          if (fetchPollRef.current) clearInterval(fetchPollRef.current);
          savePendingRun('website', state.fetchRunId!);
          return;
        }

        try {
          const response = await authedFetch(`/api/actions/runs/${state.fetchRunId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'completed') {
              const outputData = data.output_data || {};
              const result: WebsiteScanResult = {
                fields: outputData.fields || {},
                highlights: outputData.highlights || [],
              };
              
              setState(prev => ({
                ...prev,
                fetchStatus: 'completed',
                websiteResult: result,
              }));
              
              // Save to settings
              void saveWebsiteProfile(result.fields, result.highlights, 'suggested');
              
              if (fetchPollRef.current) clearInterval(fetchPollRef.current);
            } else if (data.status === 'failed') {
              setState(prev => ({ ...prev, fetchStatus: 'failed' }));
              if (fetchPollRef.current) clearInterval(fetchPollRef.current);
            }
          }
        } catch (error) {
          console.error('Failed to poll fetch status:', error);
        }
      }, 1500);
    };

    startPolling();

    return () => {
      if (fetchPollRef.current) {
        clearInterval(fetchPollRef.current);
        fetchPollRef.current = null;
      }
    };
  }, [state.fetchRunId, state.fetchStatus, state.fetchStartTime]);

  // Poll for document scan status
  useEffect(() => {
    if (!state.scanRunId || state.scanStatus !== 'running') return;

    const startPolling = async () => {
      const { authedFetch } = await import('@/lib/api/authedFetch');
      
      scanPollRef.current = setInterval(async () => {
        // Check for timeout
        if (state.scanStartTime && Date.now() - state.scanStartTime > BACKGROUND_TIMEOUT_MS) {
          setState(prev => ({ ...prev, scanStatus: 'pending_background' }));
          if (scanPollRef.current) clearInterval(scanPollRef.current);
          savePendingRun('document', state.scanRunId!);
          return;
        }

        try {
          const response = await authedFetch(`/api/actions/runs/${state.scanRunId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'completed') {
              const outputData = data.output_data || {};
              const result: DocumentScanResult = {
                documents: state.uploadedFiles.map((f, i) => ({
                  id: `doc-${i}`,
                  filename: f.name,
                  type: getDocType(f.name),
                  summary: outputData.documents?.[i]?.summary || 'Dokument verarbeitet',
                  status: 'processed' as const,
                })),
                tags: outputData.tags || (outputData.fields?.keywords?.split(',').map((s: string) => s.trim()) || []),
                entities: outputData.entities || [],
              };
              
              setState(prev => ({
                ...prev,
                scanStatus: 'completed',
                documentResult: result,
              }));
              
              // Save to settings
              void saveDocumentScanResults(result, 'suggested');
              
              if (scanPollRef.current) clearInterval(scanPollRef.current);
            } else if (data.status === 'failed') {
              setState(prev => ({ ...prev, scanStatus: 'failed' }));
              if (scanPollRef.current) clearInterval(scanPollRef.current);
            }
          }
        } catch (error) {
          console.error('Failed to poll scan status:', error);
        }
      }, 1500);
    };

    startPolling();

    return () => {
      if (scanPollRef.current) {
        clearInterval(scanPollRef.current);
        scanPollRef.current = null;
      }
    };
  }, [state.scanRunId, state.scanStatus, state.scanStartTime, state.uploadedFiles]);

  const getDocType = (filename: string): string => {
    const lower = filename.toLowerCase();
    if (lower.includes('rechnung') || lower.includes('invoice')) return 'Rechnung';
    if (lower.includes('angebot') || lower.includes('quote')) return 'Angebot';
    if (lower.includes('agb') || lower.includes('terms')) return 'AGB';
    if (lower.includes('broschur') || lower.includes('brochure') || lower.includes('flyer')) return 'Broschüre';
    if (lower.endsWith('.pdf')) return 'PDF';
    if (lower.endsWith('.docx') || lower.endsWith('.doc')) return 'Word';
    return 'Dokument';
  };

  const savePendingRun = async (type: 'website' | 'document', runId: string) => {
    try {
      const { authedFetch } = await import('@/lib/api/authedFetch');
      await authedFetch('/api/settings/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patch: {
            onboarding: {
              pendingRuns: {
                [type]: runId,
              },
            },
          },
        }),
      });
    } catch (error) {
      console.warn('Failed to save pending run:', error);
    }
  };

  const saveWebsiteProfile = async (fields: WebsiteScanResult['fields'], highlights?: string[], status: 'suggested' | 'confirmed' = 'suggested') => {
    try {
      const { authedFetch } = await import('@/lib/api/authedFetch');
      await authedFetch('/api/settings/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patch: {
            websiteProfile: {
              company_name: fields.company_name || state.company_name,
              website: fields.website || state.website,
              industry: fields.industry || '',
              value_proposition: fields.value_proposition || '',
              target_audience: fields.target_audience || '',
              products_services: fields.products_services || '',
              keywords: fields.keywords || '',
              highlights: highlights || [],
              fetched_at: new Date().toISOString(),
            },
            onboarding: {
              websiteScan: {
                status,
                updatedAt: new Date().toISOString(),
                source: 'website_fetch',
              },
            },
          },
        }),
      });
    } catch (error) {
      console.warn('Failed to save website profile:', error);
    }
  };

  const saveDocumentScanResults = async (result: DocumentScanResult, status: 'suggested' | 'confirmed' = 'suggested') => {
    try {
      const { authedFetch } = await import('@/lib/api/authedFetch');
      await authedFetch('/api/settings/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patch: {
            onboarding: {
              documentScan: {
                status,
                updatedAt: new Date().toISOString(),
                docCount: result.documents.length,
                topTags: result.tags?.slice(0, 10) || [],
                topEntities: result.entities?.slice(0, 10) || [],
              },
            },
          },
        }),
      });
    } catch (error) {
      console.warn('Failed to save document scan results:', error);
    }
  };

  const startWebsiteProfile = async () => {
    if (!state.use_website_data || !state.website.trim()) return;
    
    try {
      const normalizedUrl = state.website.trim().startsWith('http')
        ? state.website.trim()
        : `https://${state.website.trim()}`;

      const { authedFetch } = await import('@/lib/api/authedFetch');
      const response = await authedFetch('/api/actions/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId: 'website.fetch_and_profile',
          context: {
            module: 'onboarding',
            target: { type: 'tenant', id: 'onboarding' },
            uiContext: { surface: 'onboarding_wizard' },
          },
          config: { url: normalizedUrl, write_memory: true },
          stream: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          fetchRunId: data.run_id,
          fetchStatus: 'running',
          fetchStartTime: Date.now(),
        }));
      }
    } catch (error) {
      console.error('Failed to start website fetch:', error);
      setState(prev => ({ ...prev, fetchStatus: 'failed' }));
    }
  };

  const uploadDocuments = async () => {
    if (state.uploadedFiles.length === 0) return;

    setState(prev => ({ ...prev, uploadStatus: 'uploading' }));

    try {
      const formData = new FormData();
      state.uploadedFiles.forEach(file => {
        formData.append('files', file);
      });

      const { authedFetch } = await import('@/lib/api/authedFetch');
      const response = await authedFetch('/api/onboarding/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          uploadStatus: 'completed',
          uploadResults: data.uploaded,
        }));

        void startDocumentScan();
      } else {
        setState(prev => ({ ...prev, uploadStatus: 'failed' }));
      }
    } catch (error) {
      console.error('Failed to upload documents:', error);
      setState(prev => ({ ...prev, uploadStatus: 'failed' }));
    }
  };

  const startDocumentScan = async () => {
    if (state.uploadedFiles.length === 0) return;

    try {
      const { authedFetch } = await import('@/lib/api/authedFetch');
      const response = await authedFetch('/api/actions/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId: 'documents.ingest_and_scan',
          context: {
            module: 'onboarding',
            target: { type: 'tenant', id: 'onboarding' },
            uiContext: { surface: 'onboarding_wizard' },
            moduleContext: {
              uploadedFiles: state.uploadedFiles.map(f => f.name),
              company_name: state.company_name,
            },
          },
          config: { write_memory: true },
          stream: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          scanRunId: data.run_id,
          scanStatus: 'running',
          scanStartTime: Date.now(),
        }));
      }
    } catch (error) {
      console.error('Failed to start document scan:', error);
      setState(prev => ({ ...prev, scanStatus: 'failed' }));
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!state.company_name.trim()) return;
      void startWebsiteProfile();
    }

    if (currentStep === 2) {
      if (state.uploadedFiles.length > 0 && state.uploadStatus === 'idle') {
        await uploadDocuments();
      }
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    } else {
      void handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleConfirmWebsite = () => {
    setState(prev => ({ ...prev, websiteConfirmed: true }));
    if (state.websiteResult) {
      void saveWebsiteProfile(state.websiteResult.fields, state.websiteResult.highlights, 'confirmed');
    }
  };

  const handleConfirmDocument = () => {
    setState(prev => ({ ...prev, documentConfirmed: true }));
    if (state.documentResult) {
      void saveDocumentScanResults(state.documentResult, 'confirmed');
    }
  };

  const handleSaveWebsiteProfile = async (fields: WebsiteScanResult['fields']) => {
    setState(prev => ({
      ...prev,
      websiteResult: {
        ...prev.websiteResult,
        fields,
        highlights: prev.websiteResult?.highlights || [],
      },
      websiteConfirmed: true,
    }));
    await saveWebsiteProfile(fields, state.websiteResult?.highlights, 'confirmed');
  };

  const handleRetryWebsiteScan = () => {
    setState(prev => ({
      ...prev,
      fetchStatus: 'idle',
      fetchRunId: undefined,
      fetchStartTime: undefined,
      websiteResult: undefined,
      websiteConfirmed: false,
    }));
    void startWebsiteProfile();
  };

  const handleRetryDocumentScan = () => {
    setState(prev => ({
      ...prev,
      uploadStatus: 'idle',
      scanStatus: 'idle',
      scanRunId: undefined,
      scanStartTime: undefined,
      documentResult: undefined,
      documentConfirmed: false,
    }));
    void uploadDocuments();
  };

  const handleComplete = async () => {
    try {
      const { authedFetch } = await import('@/lib/api/authedFetch');
      await authedFetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            company_name: state.company_name,
            website: state.website,
            personality: state.personalityVibe,
            uploaded_files_count: state.uploadedFiles.length,
          },
        }),
      });

      localStorage.setItem('aklow_onboarding_complete', 'true');

      if (isOnboardingPage) {
        router.push('/inbox');
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  // ============================================
  // STEP CONFIG
  // ============================================

  const getStepConfig = (step: number) => {
    switch (step) {
      case 1:
        return {
          title: "Identität",
          icon: <User className="h-5 w-5" />,
          subtitle: state.company_name ? `Für ${state.company_name}` : "Wer bist du?"
        };
      case 2:
        return {
          title: "Wissen",
          icon: <FileText className="h-5 w-5" />,
          subtitle: "Dokumente & Kontext"
        };
      case 3:
        return {
          title: state.personalityVibe === 'enthusiastic' ? "Personality ✨" : "Personality",
          icon: <Zap className="h-5 w-5" />,
          subtitle: "Tonality & Vibe"
        };
      case 4:
        return {
          title: "Prüfung",
          icon: <ShieldCheck className="h-5 w-5" />,
          subtitle: "Zusammenfassung"
        };
      case 5:
        return {
          title: "Fertig",
          icon: <Flag className="h-5 w-5" />,
          subtitle: "Setup abgeschlossen"
        };
      default:
        return { title: "", icon: null };
    }
  };

  const stepConfig = getStepConfig(currentStep);

  // ============================================
  // STEP RENDERERS
  // ============================================

  const renderStep1_Identity = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold ak-text-primary">Lass uns starten. Wer bist du?</h2>
        <p className="ak-text-secondary">Ich scanne deine Website im Hintergrund, um dein Unternehmen zu verstehen.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium ak-text-secondary mb-1">Firmenname</label>
          <input
            type="text"
            value={state.company_name}
            onChange={e => setState(prev => ({ ...prev, company_name: e.target.value }))}
            placeholder="z.B. Acme Corp"
            className="w-full px-4 py-3 rounded-xl ak-bg-surface-2 ak-border-default border ak-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)] transition-all"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium ak-text-secondary mb-1">Website (optional)</label>
          <input
            type="text"
            value={state.website}
            onChange={e => setState(prev => ({ ...prev, website: e.target.value }))}
            placeholder="acme.com"
            className="w-full px-4 py-3 rounded-xl ak-bg-surface-2 ak-border-default border ak-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)] transition-all"
          />
          {state.website.trim() && (
            <p className="text-xs ak-text-muted mt-1 flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Wir analysieren deine Website und füllen dein Profil automatisch aus.
            </p>
          )}
        </div>
      </div>

      {/* Website Scan Status */}
      {state.fetchStatus === 'running' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-[var(--ak-color-accent)]/5 border border-[var(--ak-color-accent)]/30"
        >
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-[var(--ak-color-accent)] animate-spin" />
            <div>
              <p className="text-sm font-medium ak-text-primary">Analysiere Website...</p>
              <p className="text-xs ak-text-secondary">Das dauert nur wenige Sekunden</p>
            </div>
          </div>
        </motion.div>
      )}

      {state.fetchStatus === 'completed' && state.websiteResult && (
        <WebsiteScanResultCard
          result={state.websiteResult}
          onConfirm={handleConfirmWebsite}
          onEdit={() => setShowProfileDrawer(true)}
          confirmed={state.websiteConfirmed}
        />
      )}

      {state.fetchStatus === 'pending_background' && (
        <BackgroundScanCard
          type="website"
          status="pending_background"
          onContinue={() => setCurrentStep(2)}
        />
      )}

      {state.fetchStatus === 'failed' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-[var(--ak-semantic-danger-soft)] border border-[var(--ak-semantic-danger)]/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-[var(--ak-semantic-danger)]" />
              <div>
                <p className="text-sm font-medium text-[var(--ak-semantic-danger)]">Scan fehlgeschlagen</p>
                <p className="text-xs ak-text-secondary">Du kannst es erneut versuchen oder fortfahren.</p>
              </div>
            </div>
            <button
              onClick={handleRetryWebsiteScan}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--ak-semantic-danger)] bg-[var(--ak-semantic-danger-soft)] hover:bg-[var(--ak-semantic-danger-soft)] rounded-lg transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Erneut versuchen
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          disabled={!state.company_name.trim()}
          className={clsx(
            "inline-flex items-center gap-2 h-11 px-8 rounded-2xl transition-all duration-300 font-medium",
            state.company_name.trim()
              ? "bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] shadow-lg shadow-[var(--ak-color-accent)]/20 hover:scale-[1.02]"
              : "ak-bg-surface-2 ak-text-muted cursor-not-allowed"
          )}
        >
          Weiter
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const renderStep2_Knowledge = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold ak-text-primary">Füttere mich mit Wissen.</h2>
        <p className="ak-text-secondary">
          Lade 1–3 typische Dokumente hoch (Angebot, Rechnung, PDF). Wir extrahieren Begriffe und sparen dir später Tipparbeit.
        </p>
      </div>

      {/* Show document result if already scanned */}
      {state.scanStatus === 'completed' && state.documentResult ? (
        <DocumentScanResultCard
          result={state.documentResult}
          onConfirm={handleConfirmDocument}
          onAddMore={() => setState(prev => ({ ...prev, scanStatus: 'idle', uploadStatus: 'idle' }))}
          onDetails={() => setShowDocDetailsDrawer(true)}
          confirmed={state.documentConfirmed}
        />
      ) : state.scanStatus === 'running' ? (
        <BackgroundScanCard type="document" status="running" />
      ) : state.scanStatus === 'pending_background' ? (
        <BackgroundScanCard type="document" status="pending_background" onContinue={() => setCurrentStep(3)} />
      ) : (state.scanStatus === 'failed' || state.uploadStatus === 'failed') ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-[var(--ak-semantic-danger-soft)] border border-[var(--ak-semantic-danger)]/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-[var(--ak-semantic-danger)]" />
              <div>
                <p className="text-sm font-medium text-[var(--ak-semantic-danger)]">
                  {state.uploadStatus === 'failed' ? 'Upload fehlgeschlagen' : 'Scan fehlgeschlagen'}
                </p>
                <p className="text-xs ak-text-secondary">Du kannst es erneut versuchen oder überspringen.</p>
              </div>
            </div>
            <button
              onClick={handleRetryDocumentScan}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--ak-semantic-danger)] bg-[var(--ak-semantic-danger-soft)] hover:bg-[var(--ak-semantic-danger-soft)] rounded-lg transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Erneut versuchen
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          <div className="min-h-[200px]">
            <DropZone
              onDrop={files => {
                const newFiles = Array.from(files);
                setState(prev => ({ ...prev, uploadedFiles: [...prev.uploadedFiles, ...newFiles] }));
              }}
              accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg"
            >
              <div className="text-center space-y-2 pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-[var(--ak-color-accent)]/10 flex items-center justify-center mx-auto mb-4">
                  <UploadCloud className="h-8 w-8 text-[var(--ak-color-accent)]" />
                </div>
                <h3 className="font-semibold text-lg ak-text-primary">Dateien hier ablegen</h3>
                <p className="text-sm ak-text-secondary">oder klicken zum Auswählen</p>
                <p className="text-xs text-[var(--ak-color-text-muted)] mt-2">PDF, DOCX, PNG, JPG bis 10MB</p>
              </div>
            </DropZone>
          </div>

          {state.uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide ak-text-secondary">
                  {state.uploadStatus === 'uploading' ? 'Lade hoch...' :
                   state.uploadStatus === 'completed' ? 'Hochgeladen – Scan läuft...' :
                   `Bereit (${state.uploadedFiles.length})`}
                </p>
                {state.uploadStatus === 'uploading' && (
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--ak-color-accent)]" />
                )}
              </div>
              <div className="space-y-2 max-h-[150px] overflow-y-auto">
                {state.uploadedFiles.map((file, idx) => {
                  const uploadResult = state.uploadResults?.find(r => r.filename === file.name);
                  return (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-[var(--ak-color-bg-surface)] border ak-border-default"
                    >
                      <div className="flex items-center gap-3">
                        {uploadResult?.status === 'uploaded' ? (
                          <Check className="h-4 w-4 ak-text-success" />
                        ) : state.uploadStatus === 'uploading' ? (
                          <Loader2 className="h-4 w-4 animate-spin text-[var(--ak-color-accent)]" />
                        ) : (
                          <FileText className="h-4 w-4 text-[var(--ak-color-accent)]" />
                        )}
                        <span className="text-sm font-medium ak-text-primary truncate max-w-[200px]">{file.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--ak-color-accent)]/10 text-[var(--ak-color-accent)]">
                          {getDocType(file.name)}
                        </span>
                      </div>
                      {state.uploadStatus === 'idle' && (
                        <button
                          onClick={() => setState(prev => ({ ...prev, uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== idx) }))}
                          className="p-1 hover:ak-badge-danger rounded-md transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex items-center justify-between pt-4">
        <button onClick={handleBack} className="text-sm font-medium ak-text-secondary hover:ak-text-primary transition-colors">
          Zurück
        </button>
        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 h-11 px-8 rounded-2xl bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] shadow-lg shadow-[var(--ak-color-accent)]/20 hover:scale-[1.02] transition-all duration-300 font-medium"
        >
          {state.uploadedFiles.length > 0 && state.uploadStatus === 'idle'
            ? `Weiter mit ${state.uploadedFiles.length} Dateien`
            : 'Weiter'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const renderStep3_Personality = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold ak-text-primary">Wie soll ich klingen?</h2>
        <p className="ak-text-secondary">Bestimme die Persönlichkeit deines Assistenten.</p>
        
        {/* Personality Vibe Micro-Copy */}
        {state.personalityVibe === 'friendly' && (
           <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-[var(--ak-color-accent)] font-medium">
             Alles klar – wir machen’s einfach.
           </motion.p>
        )}
        {state.personalityVibe === 'enthusiastic' && (
           <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-[var(--ak-color-accent)] font-medium flex items-center gap-1">
             <Sparkles className="w-3 h-3" />
             Super! Das wird großartig.
           </motion.p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[
          { id: 'professional', label: 'Professionell & Distanziert', desc: 'Siezen, sachlich, präzise. Perfekt für B2B.' },
          { id: 'friendly', label: 'Freundlich & Hilfsbereit', desc: 'Duzen oder Siezen, empathisch, lösungsorientiert.' },
          { id: 'enthusiastic', label: 'Locker & Begeisternd', desc: 'Emojis, Du-Form, energiegeladen. Für Startups.' },
        ].map(opt => (
          <button
            key={opt.id}
            onClick={() => setState(prev => ({ ...prev, personalityVibe: opt.id as any }))}
            className={clsx(
              "relative p-4 rounded-xl text-left border-2 transition-all duration-200",
              state.personalityVibe === opt.id
                ? "border-[var(--ak-color-accent)] bg-[var(--ak-color-accent)]/5 shadow-sm"
                : "border-transparent ak-bg-surface-2 hover:border-[var(--ak-color-border-default)]"
            )}
          >
            <div className="font-semibold ak-text-primary">{opt.label}</div>
            <div className="text-sm ak-text-secondary">{opt.desc}</div>
            {state.personalityVibe === opt.id && (
              <div className="absolute top-4 right-4 text-[var(--ak-color-accent)]">
                <Check className="h-5 w-5" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4">
        <button onClick={handleBack} className="text-sm font-medium ak-text-secondary hover:ak-text-primary transition-colors">
          Zurück
        </button>
        <button
          onClick={handleNext}
          disabled={!state.personalityVibe}
          className={clsx(
            "inline-flex items-center gap-2 h-11 px-8 rounded-2xl transition-all duration-300 font-medium",
            state.personalityVibe
              ? "bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] shadow-lg shadow-[var(--ak-color-accent)]/20 hover:scale-[1.02]"
              : "ak-bg-surface-2 ak-text-muted cursor-not-allowed"
          )}
        >
          Weiter
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const renderStep4_Review = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold ak-text-primary">Zusammenfassung prüfen</h2>
        <p className="ak-text-secondary">Hier siehst du, was wir erkannt haben. Du kannst alles anpassen.</p>
      </div>

      {/* Website Scan Summary */}
      {(state.fetchStatus === 'completed' && state.websiteResult) && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide ak-text-secondary">Website-Profil</h3>
          <WebsiteScanResultCard
            result={state.websiteResult}
            onConfirm={handleConfirmWebsite}
            onEdit={() => setShowProfileDrawer(true)}
            confirmed={state.websiteConfirmed}
          />
        </div>
      )}

      {state.fetchStatus === 'pending_background' && (
        <div className="p-4 rounded-xl ak-bg-surface-2 border ak-border-default flex items-center gap-3">
          <Clock className="h-5 w-5 text-[var(--ak-color-accent)]" />
          <div>
            <p className="text-sm font-medium ak-text-primary">Website-Scan läuft noch</p>
            <p className="text-xs ak-text-secondary">Du wirst benachrichtigt, wenn fertig.</p>
          </div>
        </div>
      )}

      {/* Document Scan Summary */}
      {(state.scanStatus === 'completed' && state.documentResult) && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide ak-text-secondary">Dokument-Scan</h3>
          <DocumentScanResultCard
            result={state.documentResult}
            onConfirm={handleConfirmDocument}
            onDetails={() => setShowDocDetailsDrawer(true)}
            confirmed={state.documentConfirmed}
          />
        </div>
      )}

      {state.scanStatus === 'pending_background' && (
        <div className="p-4 rounded-xl ak-bg-surface-2 border ak-border-default flex items-center gap-3">
          <Clock className="h-5 w-5 text-[var(--ak-color-accent)]" />
          <div>
            <p className="text-sm font-medium ak-text-primary">Dokument-Scan läuft noch</p>
            <p className="text-xs ak-text-secondary">Du wirst benachrichtigt, wenn fertig.</p>
          </div>
        </div>
      )}

      {/* What we'll do */}
      <div className="p-4 rounded-xl ak-bg-surface-2 border ak-border-default">
        <h3 className="text-sm font-semibold ak-text-primary mb-3">Was wir jetzt automatisch vorbereiten:</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-sm ak-text-secondary">
            <Check className="h-4 w-4 text-[var(--ak-semantic-success)] shrink-0" />
            <span>Dein Firmenprofil wird gespeichert</span>
          </li>
          <li className="flex items-center gap-2 text-sm ak-text-secondary">
            <Check className="h-4 w-4 text-[var(--ak-semantic-success)] shrink-0" />
            <span>Erkannte Begriffe verbessern spätere Antworten</span>
          </li>
          <li className="flex items-center gap-2 text-sm ak-text-secondary">
            <Check className="h-4 w-4 text-[var(--ak-semantic-success)] shrink-0" />
            <span>Inbox-Regeln werden an dein Profil angepasst</span>
          </li>
        </ul>
      </div>

      <div className="flex items-center justify-between pt-4">
        <button onClick={handleBack} className="text-sm font-medium ak-text-secondary hover:ak-text-primary transition-colors">
          Zurück
        </button>
        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 h-11 px-8 rounded-2xl bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] shadow-lg shadow-[var(--ak-color-accent)]/20 hover:scale-[1.02] transition-all duration-300 font-medium"
        >
          Onboarding abschließen
          <Sparkles className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const renderStep5_Finish = () => (
    <div className="space-y-8 text-center pt-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--ak-color-accent)]/10 text-[var(--ak-color-accent)] mb-4"
      >
        <Sparkles className="h-10 w-10" />
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold ak-text-primary">Ich bin bereit, {state.company_name}!</h2>
        <p className="ak-text-secondary max-w-md mx-auto">
          {state.fetchStatus === 'completed' && 'Dein Website-Profil ist hinterlegt. '}
          {state.documentResult && `${state.documentResult.documents.length} Dokument${state.documentResult.documents.length > 1 ? 'e' : ''} gelernt. `}
          Dein Workspace ist eingerichtet.
        </p>
      </div>

      {/* Next Step CTA */}
      <div className="max-w-sm mx-auto p-6 rounded-2xl bg-[var(--ak-color-bg-surface)] border ak-border-default shadow-sm text-left">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="p-2 rounded-lg ak-accent-bg-soft ak-accent-icon"
            style={{ '--ak-color-accent': 'var(--ak-accent-inbox)', '--ak-color-accent-soft': 'var(--ak-accent-inbox-soft)' } as React.CSSProperties}
          >
            <Inbox className="h-6 w-6" />
          </div>
          <div>
            <div className="font-semibold text-sm">Empfohlener nächster Schritt</div>
            <div className="font-bold text-lg">E-Mail verbinden</div>
          </div>
        </div>
        <p className="text-sm ak-text-secondary mb-4">
          Damit ich antworten kann, brauche ich Zugang zu deinem Postfach.
        </p>
        <button
          onClick={() => router.push('/actions?cat=setup&integration=email')}
          className="w-full py-2.5 rounded-xl bg-[var(--ak-accent-inbox)] font-medium hover:opacity-90 transition-opacity"
          style={{ color: 'var(--ak-text-primary-dark)' }}
        >
          Jetzt verbinden
        </button>
      </div>

      <div className="pt-4">
        <button
          onClick={handleComplete}
          className="text-sm font-medium ak-text-secondary hover:ak-text-primary underline decoration-dotted underline-offset-4"
        >
          Nein danke, bring mich zum Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <>
      <WizardShell 
        currentStep={currentStep} 
        totalSteps={TOTAL_STEPS} 
        onClose={onClose} 
        maxWidth="max-w-2xl"
        title={stepConfig.title}
        icon={stepConfig.icon}
        subtitle={stepConfig.subtitle}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {currentStep === 1 && renderStep1_Identity()}
            {currentStep === 2 && renderStep2_Knowledge()}
            {currentStep === 3 && renderStep3_Personality()}
            {currentStep === 4 && renderStep4_Review()}
            {currentStep === 5 && renderStep5_Finish()}
          </motion.div>
        </AnimatePresence>
      </WizardShell>

      {/* Profile Edit Drawer */}
      <WebsiteProfileDrawer
        isOpen={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
        initialData={state.websiteResult?.fields || {}}
        onSave={handleSaveWebsiteProfile}
      />

      {/* Document Details Drawer */}
      {state.documentResult && (
        <DocumentDetailsDrawer
          isOpen={showDocDetailsDrawer}
          onClose={() => setShowDocDetailsDrawer(false)}
          result={state.documentResult}
        />
      )}
    </>
  );
};
