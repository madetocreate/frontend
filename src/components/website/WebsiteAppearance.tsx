'use client'

import { useState } from 'react'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkButton } from '@/components/ui/AkButton'
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, PhotoIcon, SparklesIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

export function WebsiteAppearance() {
  const [primaryColor, setPrimaryColor] = useState('#007aff')
  const [greeting, setGreeting] = useState('Hallo! Wie kann ich dir helfen?')
  const [glassEffect, setGlassEffect] = useState(true)
  const [position, setPosition] = useState<'left' | 'right'>('right')
  
  return (
    <div className="p-6 h-full flex flex-col lg:flex-row gap-8 overflow-y-auto lg:overflow-hidden">
      {/* Editor Spalte */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0 lg:overflow-y-auto pr-2">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ak-color-text-primary)] tracking-tight">Design & Widget</h2>
          <p className="text-sm text-[var(--ak-color-text-secondary)] mt-1">
            Gestalte das Chat-Erlebnis passend zu deiner Brand.
          </p>
        </div>

        <WidgetCard title="Erscheinungsbild" padding="md">
          <div className="space-y-6">
            {/* Farbe */}
            <div>
              <label className="block text-xs font-medium text-[var(--ak-color-text-secondary)] uppercase tracking-wider mb-3">Akzentfarbe</label>
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full overflow-hidden shadow-sm border border-[var(--ak-color-border-default)] transition-transform hover:scale-105">
                    <input 
                    type="color" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="absolute inset-0 h-[150%] w-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer p-0 border-0"
                    />
                </div>
                <div className="flex-1">
                    <input 
                    type="text" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full rounded-lg border border-[var(--ak-color-border-default)] bg-[var(--ak-color-bg-surface)] px-3 py-2 text-sm font-mono focus:border-[var(--ak-color-accent)] focus:outline-none transition-colors"
                    />
                </div>
              </div>
            </div>
            
            {/* Branding */}
            <div>
              <label className="block text-xs font-medium text-[var(--ak-color-text-secondary)] uppercase tracking-wider mb-3">Branding</label>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 border border-[var(--ak-color-border-default)] flex items-center justify-center shadow-inner">
                  <span className="text-[10px] font-bold text-gray-400">LOGO</span>
                </div>
                <div className="flex flex-col gap-2">
                    <AkButton variant="secondary" size="sm" leftIcon={<PhotoIcon className="h-3.5 w-3.5" />}>Logo hochladen</AkButton>
                    <span className="text-[10px] text-[var(--ak-color-text-muted)]">Empfohlen: 512x512px PNG</span>
                </div>
              </div>
            </div>

            {/* Stil Optionen */}
            <div>
                <label className="block text-xs font-medium text-[var(--ak-color-text-secondary)] uppercase tracking-wider mb-3">Stil</label>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setGlassEffect(true)}
                        className={clsx(
                            "flex-1 py-2 px-3 rounded-lg text-sm border transition-all",
                            glassEffect 
                                ? "bg-[var(--ak-color-bg-selected)] border-[var(--ak-color-accent)] text-[var(--ak-color-accent)] font-medium shadow-sm" 
                                : "border-[var(--ak-color-border-default)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)]"
                        )}
                    >
                        Glass (Modern)
                    </button>
                    <button 
                        onClick={() => setGlassEffect(false)}
                        className={clsx(
                            "flex-1 py-2 px-3 rounded-lg text-sm border transition-all",
                            !glassEffect 
                                ? "bg-[var(--ak-color-bg-selected)] border-[var(--ak-color-accent)] text-[var(--ak-color-accent)] font-medium shadow-sm" 
                                : "border-[var(--ak-color-border-default)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)]"
                        )}
                    >
                        Solid (Klassisch)
                    </button>
                </div>
            </div>
          </div>
        </WidgetCard>

        <WidgetCard title="Inhalte" padding="md">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--ak-color-text-secondary)] uppercase tracking-wider mb-2">Begrüßung</label>
              <textarea 
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-[var(--ak-color-border-default)] bg-[var(--ak-color-bg-surface)] px-3 py-2 text-sm focus:border-[var(--ak-color-accent)] focus:outline-none resize-none transition-colors"
              />
            </div>
            
            <div className="pt-2 border-t border-[var(--ak-color-border-hairline)] mt-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--ak-color-text-primary)]">Widget Position</span>
                    <div className="flex bg-[var(--ak-color-bg-sidebar)] p-0.5 rounded-lg border border-[var(--ak-color-border-default)]">
                        <button 
                            onClick={() => setPosition('left')}
                            className={clsx(
                                "px-3 py-1 text-xs rounded-md transition-all",
                                position === 'left' ? "bg-white shadow-sm text-black" : "text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]"
                            )}
                        >
                            Links
                        </button>
                        <button 
                            onClick={() => setPosition('right')}
                            className={clsx(
                                "px-3 py-1 text-xs rounded-md transition-all",
                                position === 'right' ? "bg-white shadow-sm text-black" : "text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]"
                            )}
                        >
                            Rechts
                        </button>
                    </div>
                </div>
            </div>
          </div>
        </WidgetCard>

        <div className="flex justify-end gap-3 mt-auto pt-4">
            <AkButton variant="ghost">Zurücksetzen</AkButton>
            <AkButton variant="primary" leftIcon={<SparklesIcon className="h-4 w-4"/>}>Veröffentlichen</AkButton>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 rounded-[2rem] border border-[var(--ak-color-border-default)] relative overflow-hidden shadow-inner flex flex-col min-h-[600px] lg:min-h-0">
        {/* Mock Browser UI */}
        <div className="absolute top-4 left-4 right-4 h-12 bg-white/60 backdrop-blur-md rounded-xl border border-white/40 shadow-sm flex items-center px-4 gap-3 z-10">
            <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
            </div>
            <div className="flex-1 flex justify-center">
                <div className="h-6 w-48 bg-white/50 rounded-md flex items-center justify-center text-[10px] text-gray-400 font-medium tracking-wide">
                    deine-website.de
                </div>
            </div>
        </div>
        
        {/* Abstract Content Background */}
        <div className="absolute inset-0 pt-20 px-8 opacity-40 pointer-events-none select-none">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="h-64 rounded-2xl bg-gradient-to-r from-blue-100/50 to-purple-100/50 border border-white/50" />
                <div className="grid grid-cols-3 gap-6">
                    <div className="h-32 rounded-xl bg-white/40" />
                    <div className="h-32 rounded-xl bg-white/40" />
                    <div className="h-32 rounded-xl bg-white/40" />
                </div>
                <div className="space-y-4">
                    <div className="h-4 w-3/4 bg-gray-200/50 rounded" />
                    <div className="h-4 w-1/2 bg-gray-200/50 rounded" />
                    <div className="h-4 w-5/6 bg-gray-200/50 rounded" />
                </div>
            </div>
        </div>

        {/* The Widget Preview */}
        <div 
            className={clsx(
                "absolute bottom-8 flex flex-col items-end transition-all duration-500 ease-out",
                position === 'right' ? 'right-8 items-end' : 'left-8 items-start'
            )}
        >
            {/* Chat Window */}
            <div 
                className={clsx(
                    "mb-4 w-[360px] h-[500px] rounded-[1.5rem] flex flex-col overflow-hidden shadow-2xl transition-all duration-300 transform origin-bottom-right",
                    glassEffect 
                        ? "bg-white/75 backdrop-blur-xl border border-white/50" 
                        : "bg-white border border-gray-200"
                )}
                style={{
                    boxShadow: glassEffect 
                        ? '0 20px 40px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.2) inset' 
                        : '0 20px 40px -5px rgba(0,0,0,0.1)'
                }}
            >
                {/* Header */}
                <div 
                    className="p-5 flex items-center justify-between shrink-0 relative overflow-hidden"
                >
                    {/* Gradient Background for Header */}
                    <div 
                        className="absolute inset-0 opacity-90"
                        style={{ backgroundColor: primaryColor }}
                    />
                    {glassEffect && <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />}
                    
                    <div className="relative z-10 flex items-center gap-3 text-white">
                        <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-sm">
                            <SparklesIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm leading-tight">AI Assistant</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                                <p className="text-[11px] font-medium opacity-90">Antwortet sofort</p>
                            </div>
                        </div>
                    </div>
                    <button className="relative z-10 p-2 rounded-full hover:bg-white/10 transition-colors text-white/90">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth">
                    <div className="text-center text-[10px] text-gray-400 font-medium my-2 uppercase tracking-widest opacity-60">Heute</div>
                    
                    {/* Bot Message */}
                    <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-100 to-white shadow-sm border border-gray-100 flex items-center justify-center shrink-0 mt-1">
                            <SparklesIcon className="h-4 w-4" style={{ color: primaryColor }} />
                        </div>
                        <div 
                            className={clsx(
                                "p-3.5 rounded-2xl rounded-tl-none text-[13px] leading-relaxed max-w-[85%] shadow-sm",
                                glassEffect ? "bg-white/60 backdrop-blur-md border border-white/60 text-gray-800" : "bg-white text-gray-800 border border-gray-100"
                            )}
                        >
                            {greeting}
                        </div>
                    </div>

                    {/* User Message */}
                    <div className="flex gap-3 flex-row-reverse">
                        <div 
                            className="p-3.5 rounded-2xl rounded-tr-none text-[13px] leading-relaxed max-w-[85%] text-white shadow-md relative overflow-hidden"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {/* Subtle shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
                            Gibt es auch Enterprise-Tarife?
                        </div>
                    </div>

                    {/* Bot Message with Action */}
                    <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-100 to-white shadow-sm border border-gray-100 flex items-center justify-center shrink-0 mt-1">
                            <SparklesIcon className="h-4 w-4" style={{ color: primaryColor }} />
                        </div>
                        <div className="space-y-2 max-w-[85%]">
                            <div 
                                className={clsx(
                                    "p-3.5 rounded-2xl rounded-tl-none text-[13px] leading-relaxed shadow-sm",
                                    glassEffect ? "bg-white/60 backdrop-blur-md border border-white/60 text-gray-800" : "bg-white text-gray-800 border border-gray-100"
                                )}
                            >
                                Ja, absolut! Für Enterprise-Kunden bieten wir maßgeschneiderte Lösungen an.
                            </div>
                            <button 
                                className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium bg-white border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-between group"
                            >
                                <span style={{ color: primaryColor }}>Preise ansehen</span>
                                <span className="text-gray-400 group-hover:translate-x-0.5 transition-transform">→</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer / Input */}
                <div 
                    className={clsx(
                        "p-4 border-t",
                        glassEffect ? "border-white/20 bg-white/40 backdrop-blur-md" : "border-gray-100 bg-white"
                    )}
                >
                    <div className="relative flex items-center">
                        <input 
                            className={clsx(
                                "w-full rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none transition-all placeholder:text-gray-400",
                                glassEffect 
                                    ? "bg-white/50 border border-white/40 focus:bg-white/80 focus:shadow-md" 
                                    : "bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 focus:shadow-sm"
                            )}
                            placeholder="Nachricht senden..." 
                        />
                        <button 
                            className="absolute right-1.5 p-1.5 rounded-full transition-all hover:scale-105 active:scale-95 shadow-sm"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <PaperAirplaneIcon className="h-4 w-4 text-white translate-x-px translate-y-px" />
                        </button>
                    </div>
                    <div className="flex justify-center mt-2.5">
                        <p className="text-[10px] font-medium text-gray-400 flex items-center gap-1 opacity-70">
                            Powered by <span className="font-bold tracking-tight">AI Shield</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Launcher Button */}
            <button 
                className="h-16 w-16 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 relative group"
                style={{ backgroundColor: primaryColor }}
            >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity" style={{ backgroundColor: primaryColor }} />
                
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-white relative z-10" />
                
                {/* Notification Badge */}
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center z-20 shadow-sm">
                    <span className="text-[10px] font-bold text-white">1</span>
                </div>
            </button>
        </div>
      </div>
    </div>
  )
}
