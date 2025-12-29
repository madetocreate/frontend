'use client'

import React from 'react'
import { 
  ChatBubbleLeftRightIcon, 
  BoltIcon, 
  LightBulbIcon,
  CodeBracketIcon,
  PencilSquareIcon,
  ArrowRightIcon,
  SparklesIcon,
  CpuChipIcon
} from "@heroicons/react/24/outline";
import { DrawerHeader, DrawerCard, ActionGroup, ActionButton } from '@/components/ui/drawer-kit'
import { AkDrawerScaffold } from '@/components/ui/AkDrawerScaffold'

export function ChatOverviewWidget() {
  return (
    <AkDrawerScaffold
      header={<DrawerHeader 
        title="KI Assistent" 
        subtitle="Dein intelligenter Begleiter"
        status={{ label: 'Online', tone: 'success' }}
      />}
      bodyClassName="p-4 space-y-4 ak-scrollbar"
    >
      {/* Hero / Stats Card */}
      <DrawerCard className="bg-gradient-to-br from-[var(--ak-accent-inbox-soft)] to-[var(--ak-accent-documents-soft)] border-[var(--ak-accent-inbox)]/20">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase text-[var(--ak-color-text-muted)] flex items-center gap-1.5">
              <ChatBubbleLeftRightIcon className="w-3 h-3" />
              Interaktionen
            </div>
            <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">48</div>
            <div className="text-[10px] text-[var(--ak-semantic-success)] font-bold">+12% heute</div>
          </div>
          <div className="space-y-1 text-right">
            <div className="text-[10px] font-bold uppercase text-[var(--ak-color-text-muted)] flex items-center gap-1.5 justify-end">
              <BoltIcon className="w-3 h-3" />
              Reaktionszeit
            </div>
            <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">24ms</div>
            <div className="text-[10px] text-[var(--ak-color-text-muted)] font-medium italic">Turbo Mode</div>
          </div>
        </div>
      </DrawerCard>

      {/* Modes & Capabilities */}
      <DrawerCard title="Modi & Fähigkeiten">
        <div className="space-y-2">
          {[
            { label: 'Code Expert', icon: <CodeBracketIcon className="w-4 h-4" />, color: 'text-[var(--ak-accent-inbox)]' },
            { label: 'Creative Writer', icon: <PencilSquareIcon className="w-4 h-4" />, color: 'text-[var(--ak-accent-documents)]' },
            { label: 'Strategist', icon: <LightBulbIcon className="w-4 h-4" />, color: 'text-[var(--ak-semantic-warning)]' },
          ].map((mode, i) => (
            <button key={i} className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] hover:bg-[var(--ak-color-bg-hover)] transition-all group">
              <div className="flex items-center gap-3">
                <span className={mode.color}>{mode.icon}</span>
                <span className="text-xs font-bold text-[var(--ak-color-text-primary)]">{mode.label}</span>
              </div>
              <ArrowRightIcon className="w-3 h-3 text-[var(--ak-color-text-muted)] group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>
      </DrawerCard>

      {/* Recent Chats Card */}
      <DrawerCard title="Letzte Chats">
        <div className="space-y-3">
          {[
            { title: 'Landing Page Copy', time: '10 Min' },
            { title: 'React Bugfix', time: '2 Std' },
            { title: 'Q1 Marketing', time: 'Gestern' }
          ].map((chat, i) => (
            <div key={i} className="flex items-center justify-between gap-3 group cursor-pointer">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center text-[var(--ak-color-text-muted)] group-hover:text-[var(--ak-accent-documents)] transition-colors">
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-[var(--ak-color-text-secondary)] truncate group-hover:text-[var(--ak-color-text-primary)]">{chat.title}</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--ak-color-text-muted)] uppercase">{chat.time}</span>
            </div>
          ))}
        </div>
      </DrawerCard>

      {/* Global AI Actions */}
      <DrawerCard title="System Aktionen">
        <ActionGroup label="Verstehen">
          <ActionButton icon={<SparklesIcon className="h-3.5 w-3.5" />} label="Zusammenfassen" shortcut="S" />
          <ActionButton icon={<CpuChipIcon className="h-3.5 w-3.5" />} label="Analyse" shortcut="A" />
        </ActionGroup>
      </DrawerCard>
    </AkDrawerScaffold>
  )
}
