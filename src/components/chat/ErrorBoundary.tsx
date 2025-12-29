'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error Boundary für einzelne Chat-Karten
 */
export class ChatCardErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ChatCardErrorBoundary] Uncaught error:', error, errorInfo)
  }

  private handleCopyDetails = () => {
    if (this.state.error) {
      navigator.clipboard.writeText(this.state.error.message)
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="p-4 mx-auto max-w-3xl w-full border border-dashed border-[var(--ak-color-border-subtle)] rounded-xl bg-[var(--ak-color-bg-surface-muted)] text-center">
          <div className="flex flex-col items-center gap-2">
            <ExclamationTriangleIcon className="h-6 w-6 text-[var(--ak-color-text-muted)] opacity-50" />
            <h4 className="text-sm font-semibold text-[var(--ak-color-text-secondary)]">
              Karte konnte nicht angezeigt werden
            </h4>
            <p className="text-xs text-[var(--ak-color-text-muted)] max-w-sm">
              Ein technischer Fehler ist beim Rendern dieser Karte aufgetreten.
            </p>
            <button 
              onClick={this.handleCopyDetails}
              className="mt-2 text-[10px] uppercase tracking-wider font-bold text-[var(--ak-color-accent)] hover:underline"
            >
              Fehler-Details kopieren
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

interface ChatViewErrorBoundaryProps {
  children: ReactNode
  onRetry?: () => void
}

interface ChatViewErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

/**
 * Error Boundary für die gesamte Chat-Ansicht
 */
export class ChatViewErrorBoundary extends Component<ChatViewErrorBoundaryProps, ChatViewErrorBoundaryState> {
  public state: ChatViewErrorBoundaryState = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): Partial<ChatViewErrorBoundaryState> {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ChatViewErrorBoundary] Uncaught error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    this.props.onRetry?.()
  }

  private handleCopyDetails = () => {
    const { error, errorInfo } = this.state
    const details = [
      `Error: ${error?.message || 'Unknown error'}`,
      `Stack: ${error?.stack || 'No stack trace'}`,
      `Component Stack: ${errorInfo?.componentStack || 'No component stack'}`
    ].join('\n\n')
    navigator.clipboard.writeText(details)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center space-y-6">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-[var(--ak-color-text-muted)]" />
            </div>
            
            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
                Chat konnte nicht geladen werden
              </h2>
              <p className="text-sm text-[var(--ak-color-text-secondary)]">
                Beim Laden des Chats ist ein Fehler aufgetreten. 
                Bitte versuche es erneut oder starte einen neuen Chat.
              </p>
            </div>
            
            {/* Error Message (collapsed) */}
            <details className="text-left bg-[var(--ak-color-bg-surface-muted)] rounded-lg p-3">
              <summary className="text-xs font-medium text-[var(--ak-color-text-muted)] cursor-pointer hover:text-[var(--ak-color-text-secondary)]">
                Technische Details
              </summary>
              <pre className="mt-2 text-[10px] text-[var(--ak-color-text-muted)] font-mono whitespace-pre-wrap break-all max-h-32 overflow-auto">
                {this.state.error?.message || 'Unbekannter Fehler'}
              </pre>
            </details>
            
            {/* Actions */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--ak-color-accent)] font-medium text-sm hover:brightness-110 transition-all"
                style={{ color: 'var(--ak-text-primary-dark)' }}
              >
                <ArrowPathIcon className="h-4 w-4" />
                Erneut versuchen
              </button>
              <button
                onClick={this.handleCopyDetails}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] font-medium text-sm hover:bg-[var(--ak-color-bg-hover)] transition-all"
              >
                Details kopieren
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Error Boundary für die Sidebar
 */
export class SidebarErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[SidebarErrorBoundary] Uncaught error:', error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-4 text-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-[var(--ak-color-text-muted)] mb-3" />
          <p className="text-sm text-[var(--ak-color-text-secondary)] mb-3">
            Sidebar konnte nicht geladen werden
          </p>
          <button
            onClick={this.handleRetry}
            className="text-xs text-[var(--ak-color-accent)] hover:underline"
          >
            Seite neu laden
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

