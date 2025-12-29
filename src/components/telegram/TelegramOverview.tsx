'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { 
  appleCardStyle, 
  appleSectionTitle, 
  appleSubTitle, 
  appleGroupedList, 
  appleListItem,
  appleButtonStyle,
  appleAnimationFadeInUp,
  appleAnimationHoverFloat
} from '@/lib/appleDesign'

interface TelegramStats {
  totalChats: number
  activeChats24h: number
  messagesReceived24h: number
  messagesSent24h: number
  avgResponseTime: string
  autoReplyRate: number
}

interface TelegramActivity {
  type: 'message' | 'broadcast'
  title: string
  description: string
  time: string
  threadId?: string
}

import { getTenantId as getTenantIdFromAuth } from '@/lib/tenant'

function getTenantId(): string | null {
  return getTenantIdFromAuth()
}

export function TelegramOverview() {
  const router = useRouter()
  const [stats, setStats] = useState<TelegramStats>({
    totalChats: 0,
    activeChats24h: 0,
    messagesReceived24h: 0,
    messagesSent24h: 0,
    avgResponseTime: '-',
    autoReplyRate: 0,
  })
  const [activity, setActivity] = useState<TelegramActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'
    const headers = {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    }

    try {
      // Load Stats
      const statsResponse = await fetch(`${backendUrl}/integrations/telegram/analytics`, { headers })
      if (statsResponse.ok) {
        const data = await statsResponse.json()
        setStats({
          totalChats: data.stats?.totalChats || 0,
          activeChats24h: data.stats?.chatCount || 0,
          messagesReceived24h: data.stats?.messageCount24h || 0,
          messagesSent24h: data.stats?.messagesSent24h || 0,
          avgResponseTime: data.stats?.avgResponseTime || '-',
          autoReplyRate: data.stats?.autoReplyRate || 0,
        })
      }

      // Load Activity
      const activityResponse = await fetch(`${backendUrl}/integrations/telegram/activity`, { headers })
      if (activityResponse.ok) {
        const data = await activityResponse.json()
        setActivity(data.activity || [])
      }
    } catch (error) {
      console.error('Failed to load Telegram data:', error)
    }
    setLoading(false)
  }

  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return 'Gerade eben'
    if (diffMins < 60) return `Vor ${diffMins} Min.`
    if (diffHours < 24) return `Vor ${diffHours} Std.`
    return date.toLocaleDateString('de-DE')
  }

  const statCards = [
    {
      label: 'Aktive Chats (24h)',
      value: loading ? '-' : stats.activeChats24h.toString(),
      icon: ChatBubbleLeftRightIcon,
      color: 'text-[var(--ak-semantic-info)]',
      bgColor: 'bg-[var(--ak-semantic-info-soft)]',
    },
    {
      label: 'Empfangene Messages',
      value: loading ? '-' : stats.messagesReceived24h.toString(),
      icon: PaperAirplaneIcon,
      color: 'text-[var(--ak-semantic-success)]',
      bgColor: 'bg-[var(--ak-semantic-success-soft)]',
    },
    {
      label: 'Gesendete Messages',
      value: loading ? '-' : stats.messagesSent24h.toString(),
      icon: CheckCircleIcon,
      color: 'text-[var(--ak-accent-documents)]',
      bgColor: 'bg-[var(--ak-accent-documents-soft)]',
    },
    {
      label: 'Ø Antwortzeit',
      value: loading ? '-' : stats.avgResponseTime,
      icon: ClockIcon,
      color: 'text-[var(--ak-semantic-warning)]',
      bgColor: 'bg-[var(--ak-semantic-warning-soft)]',
    },
    {
      label: 'Gesamt Chats',
      value: loading ? '-' : stats.totalChats.toString(),
      icon: UserGroupIcon,
      color: 'text-[var(--ak-color-accent)]',
      bgColor: 'bg-[var(--ak-color-accent-soft)]',
    },
    {
      label: 'Auto-Reply Rate',
      value: loading ? '-' : `${stats.autoReplyRate}%`,
      icon: ChartBarIcon,
      color: 'text-[var(--ak-semantic-success)]',
      bgColor: 'bg-[var(--ak-semantic-success-soft)]',
    },
  ]

  return (
    <div className={`space-y-8 ${appleAnimationFadeInUp}`}>
      {/* Header */}
      <div>
        <h2 className={appleSectionTitle}>
          Telegram-Bot Übersicht
        </h2>
        <p className={`${appleSubTitle} mt-1`}>
          Aktivität und Statistiken der letzten 24 Stunden
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => (
          <div
            key={stat.label}
            className={`${appleCardStyle} p-6 ${appleAnimationHoverFloat}`}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--ak-color-text-secondary)] mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-[var(--ak-color-text-primary)] tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
            Schnellaktionen
          </h3>
          <div className={`${appleCardStyle} p-6 space-y-3`}>
            <button
              className={`w-full ${appleButtonStyle.primary} flex items-center justify-center gap-2`}
              onClick={() => {
                router.push('/telegram?view=broadcasts')
              }}
            >
              <PaperAirplaneIcon className="h-5 w-5" />
              Broadcast senden
            </button>
            <button
              className={`w-full ${appleButtonStyle.secondary} flex items-center justify-center gap-2`}
              onClick={() => void loadData()}
            >
              <ChartBarIcon className="h-5 w-5" />
              Statistiken aktualisieren
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
            Letzte Aktivität
          </h3>
          <div className={appleGroupedList}>
            {loading ? (
              <div className="p-8 text-center text-[var(--ak-color-text-secondary)]">
                Lade Aktivitäten...
              </div>
            ) : activity.length === 0 ? (
              <div className="p-8 text-center text-[var(--ak-color-text-secondary)]">
                Noch keine Aktivitäten vorhanden
              </div>
            ) : (
              activity.map((item, idx) => (
                <div 
                  key={idx} 
                  className={appleListItem}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${item.type === 'message' ? 'bg-[var(--ak-semantic-info-soft)]' : 'bg-[var(--ak-accent-documents-soft)]'}`}>
                      {item.type === 'message' ? (
                        <ChatBubbleLeftRightIcon className="h-5 w-5 text-[var(--ak-semantic-info)]" />
                      ) : (
                        <PaperAirplaneIcon className="h-5 w-5 text-[var(--ak-accent-documents)]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--ak-color-text-primary)]">
                        {item.title}
                      </p>
                      <p className="text-xs text-[var(--ak-color-text-secondary)] line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--ak-color-text-muted)]">
                      {formatActivityTime(item.time)}
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-[var(--ak-color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

