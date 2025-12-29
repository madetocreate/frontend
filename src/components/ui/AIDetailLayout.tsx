"use client";

import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SparklesIcon, XMarkIcon, CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { AkButton } from "./AkButton";

// --- Types ---

export type AIAction = {
  id: string;
  label: string;
  icon?: ReactNode;
  prompt: string;
  tone?: 'professional' | 'friendly' | 'concise';
};

type AIDetailLayoutProps = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  originalContent: ReactNode; // Die E-Mail, das Dokument, etc.
  summary?: string; // Automatische Zusammenfassung
  actions: AIAction[]; // Verfügbare KI-Aktionen
  onActionTriggered: (action: AIAction) => Promise<string>; // Funktion, die den Output generiert
  className?: string;
};

// --- Components ---

/**
 * Smart Summary Widget
 * Zeigt eine automatische Zusammenfassung an, die "lebt".
 */
const SmartSummaryWidget = ({ text }: { text: string }) => {
  return (
    <div className="mb-6 relative group">
      <div className="relative ak-bg-glass p-5 rounded-[var(--ak-radius-lg)] border border-[var(--ak-color-border-subtle)] shadow-sm">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--ak-color-accent)]">
          <SparklesIcon className="w-4 h-4" />
          <span>KI Analyse</span>
        </div>
        <p className="text-[var(--ak-color-text-secondary)] leading-relaxed text-sm">
          {text}
        </p>
      </div>
    </div>
  );
};

/**
 * Output Area
 * Der Bereich, in dem das Ergebnis erscheint (Editable).
 */
const AIOutputArea = ({ 
  content, 
  isLoading, 
  onClose,
  onAccept 
}: { 
  content: string; 
  isLoading: boolean; 
  onClose: () => void;
  onAccept: (text: string) => void;
}) => {
  const [editableContent, setEditableContent] = useState(content);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEditableContent(content);
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editableContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="mt-6 flex flex-col h-full min-h-[300px] bg-[var(--ak-color-bg-surface)] rounded-[var(--ak-radius-xl)] border border-[var(--ak-color-border-fine)] ak-shadow-soft overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)]/50">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--ak-color-text-primary)]">
          <SparklesIcon className="w-4 h-4 text-[var(--ak-color-accent)]" />
          {isLoading ? "AI generiert..." : "AI Entwurf"}
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleCopy}
            className="p-1.5 hover:bg-[var(--ak-color-bg-hover)] rounded-lg text-[var(--ak-color-text-secondary)] transition-colors"
            title="Kopieren"
          >
            {copied ? <CheckIcon className="w-4 h-4 text-[var(--ak-semantic-success)]" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-[var(--ak-color-bg-hover)] rounded-lg text-[var(--ak-color-text-secondary)] transition-colors"
            title="Schließen"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-0 relative bg-[var(--ak-color-bg-surface)]">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-[var(--ak-color-accent)] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-[var(--ak-color-text-secondary)] animate-pulse">Thinking...</p>
          </div>
        ) : (
          <textarea
            value={editableContent}
            onChange={(e) => setEditableContent(e.target.value)}
            className="w-full h-full p-5 resize-none bg-transparent border-none focus:ring-0 text-[var(--ak-color-text-primary)] leading-relaxed font-sans"
            placeholder="Der Output erscheint hier..."
          />
        )}
      </div>

      {/* Footer Actions */}
      {!isLoading && (
        <div className="p-3 border-t border-[var(--ak-color-border-subtle)] flex justify-end gap-2 bg-[var(--ak-color-bg-surface)]">
          <AkButton variant="ghost" size="sm" onClick={onClose}>Verwerfen</AkButton>
          <AkButton variant="primary" size="sm" onClick={() => onAccept(editableContent)}>
            <CheckIcon className="w-4 h-4 mr-1" />
            Übernehmen
          </AkButton>
        </div>
      )}
    </motion.div>
  );
};

// --- Main Layout ---

export function AIDetailLayout({
  title,
  subtitle,
  onClose,
  originalContent,
  summary,
  actions,
  onActionTriggered,
  className
}: AIDetailLayoutProps) {
  const [activeAction, setActiveAction] = useState<AIAction | null>(null);
  const [output, setOutput] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleActionClick = async (action: AIAction) => {
    setActiveAction(action);
    setIsGenerating(true);
    setOutput(""); // Reset output

    try {
      // Simulate streaming effect or wait for promise
      const result = await onActionTriggered(action);
      setOutput(result);
    } catch (error) {
      console.error("AI Error:", error);
      setOutput("Entschuldigung, es gab einen Fehler bei der Generierung.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={clsx("h-full flex flex-col bg-[var(--ak-color-bg-app)]", className)}>
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-[var(--ak-color-border-subtle)] flex items-start justify-between bg-[var(--ak-glass-bg)] backdrop-blur-md sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">{title}</h2>
          {subtitle && <p className="text-[var(--ak-color-text-secondary)] mt-1">{subtitle}</p>}
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-[var(--ak-color-bg-hover)] rounded-full transition-colors"
        >
          <XMarkIcon className="w-6 h-6 text-[var(--ak-color-text-secondary)]" />
        </button>
      </div>

      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto ak-scrollbar">
        <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-8">
          
          {/* 1. Original Content Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--ak-color-text-muted)]">Original</h3>
            <div className="p-5 bg-[var(--ak-color-bg-surface-muted)]/30 border border-[var(--ak-color-border-fine)] rounded-[var(--ak-radius-lg)] text-[var(--ak-color-text-primary)]">
              {originalContent}
            </div>
          </section>

          {/* 2. AI Intelligence Layer (Summary) */}
          {summary && (
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SmartSummaryWidget text={summary} />
            </motion.section>
          )}

          {/* 3. Action Hub */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--ak-color-text-muted)]">
                AI Actions
              </h3>
              {activeAction && (
                <button 
                  onClick={() => setActiveAction(null)}
                  className="text-xs text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-accent)] transition-colors"
                >
                  Zurücksetzen
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className={clsx(
                    "group flex items-center gap-2 px-4 py-2.5 rounded-[var(--ak-radius-md)] text-sm font-medium transition-all duration-300 border",
                    activeAction?.id === action.id
                      ? "bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] border-transparent shadow-sm"
                      : "bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] border-[var(--ak-color-border-fine)] hover:bg-[var(--ak-color-bg-hover)] transition-all"
                  )}
                >
                  {action.icon ? (
                    <span className={clsx(activeAction?.id === action.id ? "text-[var(--ak-color-text-inverted)]" : "text-[var(--ak-color-accent)]")}>
                      {action.icon}
                    </span>
                  ) : (
                    <SparklesIcon className={clsx("w-4 h-4", activeAction?.id === action.id ? "text-[var(--ak-color-text-inverted)]" : "text-[var(--ak-color-accent)]")} />
                  )}
                  {action.label}
                </button>
              ))}
            </div>
          </section>

          {/* 4. Output Field (Expands) */}
          <AnimatePresence>
            {activeAction && (
              <AIOutputArea 
                content={output} 
                isLoading={isGenerating} 
                onClose={() => setActiveAction(null)}
                onAccept={(finalText) => {
                  console.log("Accepted:", finalText);
                  // Hier könnte man den Text in das Originalfeld übernehmen oder absenden
                  setActiveAction(null);
                }}
              />
            )}
          </AnimatePresence>

          {/* Bottom Spacer */}
          <div className="h-10" />
        </div>
      </div>
    </div>
  );
}

