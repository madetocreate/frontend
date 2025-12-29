'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Mail,
  MousePointer,
  Eye,
  AlertTriangle,
  Users,
  Clock,
  Calendar,
  ArrowUpRight,
  ChevronDown,
  RefreshCcw,
  Download,
  Filter,
  Info,
} from 'lucide-react'

interface CampaignStats {
  campaignId: string
  campaignName: string
  totalSends: number
  totalDelivered: number
  totalOpens: number
  totalUniqueOpens: number
  totalClicks: number
  totalUniqueClicks: number
  totalBounces: number
  totalComplaints: number
  totalUnsubscribes: number
  openRate: number
  clickRate: number
  clickToOpenRate: number
  bounceRate: number
}

interface DailyStats {
  date: string
  sendsCount: number
  opensCount: number
  clicksCount: number
  openRate: number
  clickRate: number
}

interface LinkStats {
  linkUrl: string
  linkName?: string
  clickCount: number
  uniqueClicks: number
}

interface CampaignAnalyticsProps {
  tenantId: string
  campaignId: string
  stats?: CampaignStats
  dailyStats?: DailyStats[]
  linkStats?: LinkStats[]
  onRefresh?: () => void
}

// Benchmark data
const INDUSTRY_AVERAGES = {
  openRate: 21.5,
  clickRate: 2.6,
  bounceRate: 2.1,
}

const DEMO_STATS: CampaignStats = {
  campaignId: 'demo',
  campaignName: 'Sommer Newsletter 2024',
  totalSends: 5234,
  totalDelivered: 5089,
  totalOpens: 2156,
  totalUniqueOpens: 1834,
  totalClicks: 423,
  totalUniqueClicks: 312,
  totalBounces: 145,
  totalComplaints: 3,
  totalUnsubscribes: 12,
  openRate: 36.0,
  clickRate: 8.3,
  clickToOpenRate: 17.0,
  bounceRate: 2.8,
}

const DEMO_DAILY_STATS: DailyStats[] = Array.from({ length: 14 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (13 - i))
  return {
    date: date.toISOString().split('T')[0],
    sendsCount: Math.floor(Math.random() * 500) + 100,
    opensCount: Math.floor(Math.random() * 200) + 50,
    clicksCount: Math.floor(Math.random() * 50) + 10,
    openRate: 30 + Math.random() * 15,
    clickRate: 5 + Math.random() * 5,
  }
})

const DEMO_LINK_STATS: LinkStats[] = [
  { linkUrl: 'https://example.com/product', linkName: 'Produkt CTA', clickCount: 156, uniqueClicks: 134 },
  { linkUrl: 'https://example.com/blog', linkName: 'Blog Link', clickCount: 89, uniqueClicks: 78 },
  { linkUrl: 'https://example.com/pricing', linkName: 'Preise', clickCount: 67, uniqueClicks: 54 },
  { linkUrl: 'https://example.com/demo', linkName: 'Demo buchen', clickCount: 45, uniqueClicks: 38 },
  { linkUrl: 'https://example.com/social', linkName: 'Social Media', clickCount: 23, uniqueClicks: 21 },
]

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  trendValue,
  color = 'purple',
  tooltip,
}: {
  icon: typeof Mail
  label: string
  value: string | number
  subValue?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: 'purple' | 'green' | 'blue' | 'orange' | 'red'
  tooltip?: string
}) {
  const colorClasses = {
    purple: 'bg-[var(--ak-color-accent-marketing-soft)] text-[var(--ak-color-accent-marketing)]',
    green: 'bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)]',
    blue: 'bg-[var(--ak-semantic-info-soft)] text-[var(--ak-semantic-info)]',
    orange: 'bg-[var(--ak-semantic-warning-soft)] text-[var(--ak-semantic-warning)]',
    red: 'bg-[var(--ak-semantic-danger-soft)] text-[var(--ak-semantic-danger)]',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--ak-color-bg-surface)]/80 rounded-xl p-5 border border-[var(--ak-color-border-subtle)] group relative"
    >
      {tooltip && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative group/tooltip">
            <Info className="w-4 h-4 text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-secondary)]" />
            <div className="absolute right-0 top-6 w-48 p-2 bg-[var(--ak-color-bg-app-dark)]/90 text-xs text-[var(--ak-color-text-secondary)] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10">
              {tooltip}
            </div>
          </div>
        </div>
      )}
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div
            className={`
              flex items-center gap-1 text-sm font-medium
              ${trend === 'up' ? 'text-[var(--ak-semantic-success)]' : trend === 'down' ? 'text-[var(--ak-semantic-danger)]' : 'text-[var(--ak-color-text-secondary)]'}
            `}
          >
            {trend === 'up' && <TrendingUp className="w-4 h-4" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4" />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-[var(--ak-color-text-primary)] mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-sm text-[var(--ak-color-text-secondary)]">{label}</div>
      {subValue && <div className="text-xs text-[var(--ak-color-text-muted)] mt-1">{subValue}</div>}
    </motion.div>
  )
}

function MiniChart({ data, height = 40 }: { data: number[]; height?: number }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {data.map((value, i) => {
        const normalizedHeight = ((value - min) / range) * 100
        return (
        <div
          key={i}
          className="flex-1 bg-[var(--ak-color-accent-marketing-soft)]/70 rounded-t"
          style={{ height: `${Math.max(normalizedHeight, 10)}%` }}
        />
        )
      })}
    </div>
  )
}

export function CampaignAnalytics({
  tenantId,
  campaignId,
  stats = DEMO_STATS,
  dailyStats = DEMO_DAILY_STATS,
  linkStats = DEMO_LINK_STATS,
  onRefresh,
}: CampaignAnalyticsProps) {
  const [dateRange, setDateRange] = useState('14d')

  const chartData = useMemo(() => {
    return dailyStats.map((d) => d.opensCount)
  }, [dailyStats])

  const insights = useMemo(() => {
    const insights: Array<{ type: 'success' | 'warning' | 'error'; text: string }> = []
    if (stats.openRate > 30) insights.push({ type: 'success', text: 'Hervorragende Öffnungsrate!' })
    if (stats.clickRate < 2) insights.push({ type: 'warning', text: 'Klickrate könnte verbessert werden' })
    if (stats.bounceRate > 5) insights.push({ type: 'error', text: 'Hohe Bounce-Rate - E-Mail-Liste prüfen' })
    return insights
  }, [stats])

  const insightToneClasses: Record<'success' | 'warning' | 'error', string> = {
    success: 'bg-[var(--ak-semantic-success-soft)] border-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success-strong)]',
    warning: 'bg-[var(--ak-semantic-warning-soft)] border-[var(--ak-semantic-warning-soft)] text-[var(--ak-semantic-warning-strong)]',
    error: 'bg-[var(--ak-semantic-danger-soft)] border-[var(--ak-semantic-danger-soft)] text-[var(--ak-semantic-danger-strong)]',
  }

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Opens\n"
      + dailyStats.map(row => `${row.date},${row.opensCount}`).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `campaign-${campaignId}-export.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--ak-color-text-primary)]">{stats.campaignName}</h2>
          <p className="text-[var(--ak-color-text-secondary)] mt-1">Kampagnen-Analyse & Performance</p>
          
          {/* Quick Insights */}
          <div className="flex gap-2 mt-2">
            {insights.map((insight, i) => (
              <span
                key={i}
                className={`text-xs px-2 py-1 rounded-full border ${insightToneClasses[insight.type] ?? ''}`}
              >
                {insight.text}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)] text-sm"
          >
            <option value="7d">Letzte 7 Tage</option>
            <option value="14d">Letzte 14 Tage</option>
            <option value="30d">Letzte 30 Tage</option>
            <option value="all">Gesamtzeitraum</option>
          </select>
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Mail}
          label="Gesendet"
          value={stats.totalSends}
          subValue={`${stats.totalDelivered.toLocaleString()} zugestellt`}
          color="blue"
          tooltip="Anzahl der versendeten E-Mails abzüglich Bounces"
        />
        <StatCard
          icon={Eye}
          label="Öffnungsrate"
          value={`${stats.openRate.toFixed(1)}%`}
          subValue={`${stats.totalUniqueOpens.toLocaleString()} eindeutige Öffnungen`}
          trend={stats.openRate > INDUSTRY_AVERAGES.openRate ? 'up' : 'down'}
          trendValue={`${(stats.openRate - INDUSTRY_AVERAGES.openRate).toFixed(1)}% vs. Benchmark`}
          color="green"
          tooltip={`Prozent der zugestellten E-Mails, die geöffnet wurden. Branchendurchschnitt: ${INDUSTRY_AVERAGES.openRate}%`}
        />
        <StatCard
          icon={MousePointer}
          label="Klickrate"
          value={`${stats.clickRate.toFixed(1)}%`}
          subValue={`${stats.totalUniqueClicks.toLocaleString()} eindeutige Klicks`}
          trend={stats.clickRate > INDUSTRY_AVERAGES.clickRate ? 'up' : 'down'}
          trendValue={`${(stats.clickRate - INDUSTRY_AVERAGES.clickRate).toFixed(1)}% vs. Benchmark`}
          color="purple"
          tooltip={`Prozent der zugestellten E-Mails, in denen ein Link geklickt wurde. Branchendurchschnitt: ${INDUSTRY_AVERAGES.clickRate}%`}
        />
        <StatCard
          icon={AlertTriangle}
          label="Bounce-Rate"
          value={`${stats.bounceRate.toFixed(1)}%`}
          subValue={`${stats.totalBounces.toLocaleString()} Bounces`}
          trend={stats.bounceRate < INDUSTRY_AVERAGES.bounceRate ? 'up' : 'down'}
          trendValue={`${(INDUSTRY_AVERAGES.bounceRate - stats.bounceRate).toFixed(1)}% vs. Benchmark`}
          color="orange"
          tooltip={`Prozent der unzustellbaren E-Mails. Branchendurchschnitt: ${INDUSTRY_AVERAGES.bounceRate}%`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Opens Over Time */}
        <div className="bg-[var(--ak-color-bg-surface)]/80 rounded-xl p-6 border border-[var(--ak-color-border-subtle)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-[var(--ak-color-text-primary)]">Öffnungen über Zeit</h3>
              <p className="text-sm text-[var(--ak-color-text-secondary)] mt-1">Tägliche Öffnungen der letzten 14 Tage</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-[var(--ak-color-accent-marketing)]" />
                <span className="text-[var(--ak-color-text-secondary)]">Öffnungen</span>
              </div>
            </div>
          </div>
          <div className="h-40">
            <MiniChart data={chartData} height={160} />
          </div>
          <div className="flex justify-between mt-4 text-xs text-[var(--ak-color-text-muted)]">
            {dailyStats.filter((_, i) => i % 3 === 0).map((d) => (
              <span key={d.date}>
                {new Date(d.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
              </span>
            ))}
          </div>
        </div>

        {/* Engagement Funnel */}
        <div className="bg-[var(--ak-color-bg-surface)]/80 rounded-xl p-6 border border-[var(--ak-color-border-subtle)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-[var(--ak-color-text-primary)]">Engagement-Funnel</h3>
              <p className="text-sm text-[var(--ak-color-text-secondary)] mt-1">Von Versand bis Klick</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Gesendet', value: stats.totalSends, percent: 100, color: 'bg-[var(--ak-semantic-info)]' },
              {
                label: 'Zugestellt',
                value: stats.totalDelivered,
                percent: (stats.totalDelivered / stats.totalSends) * 100,
                color: 'bg-[var(--ak-color-accent-documents)]',
              },
              {
                label: 'Geöffnet',
                value: stats.totalUniqueOpens,
                percent: (stats.totalUniqueOpens / stats.totalSends) * 100,
                color: 'bg-[var(--ak-semantic-success)]',
              },
              {
                label: 'Geklickt',
                value: stats.totalUniqueClicks,
                percent: (stats.totalUniqueClicks / stats.totalSends) * 100,
                color: 'bg-[var(--ak-color-accent-marketing)]',
              },
            ].map((step, i) => (
              <div key={step.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-[var(--ak-color-text-secondary)]">{step.label}</span>
                  <span className="text-sm font-medium text-[var(--ak-color-text-primary)]">
                    {step.value.toLocaleString()} ({step.percent.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-[var(--ak-color-bg-surface-muted)]/60 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${step.percent}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className={`h-full ${step.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Link Performance */}
      <div className="bg-[var(--ak-color-bg-surface)]/80 rounded-xl border border-[var(--ak-color-border-subtle)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--ak-color-border-subtle)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[var(--ak-color-text-primary)]">Link-Performance</h3>
              <p className="text-sm text-[var(--ak-color-text-secondary)] mt-1">Klicks pro Link in dieser Kampagne</p>
            </div>
            <button className="flex items-center gap-2 text-sm text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]">
              <Filter className="w-4 h-4" />
              Filtern
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-[var(--ak-color-text-secondary)] border-b border-[var(--ak-color-border-subtle)]">
                <th className="px-6 py-3 font-medium">Link</th>
                <th className="px-6 py-3 font-medium text-right">Klicks</th>
                <th className="px-6 py-3 font-medium text-right">Eindeutig</th>
                <th className="px-6 py-3 font-medium text-right">% der Klicks</th>
              </tr>
            </thead>
            <tbody>
              {linkStats.map((link, i) => {
                const totalClicks = linkStats.reduce((sum, l) => sum + l.clickCount, 0)
                const percentage = (link.clickCount / totalClicks) * 100
                return (
                  <motion.tr
                    key={link.linkUrl}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  className="border-b border-[var(--ak-color-border-subtle)] hover:bg-[var(--ak-color-bg-surface)]/80"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-[var(--ak-color-text-primary)]">
                          {link.linkName || 'Unnamed Link'}
                        </div>
                        <div className="text-sm text-[var(--ak-color-text-muted)] truncate max-w-xs">
                          {link.linkUrl}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-[var(--ak-color-text-primary)] font-medium">
                      {link.clickCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-[var(--ak-color-text-secondary)]">
                      {link.uniqueClicks.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-24 h-2 bg-[var(--ak-color-bg-surface-muted)]/60 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--ak-color-accent-marketing)] rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-[var(--ak-color-text-primary)] font-medium w-12 text-right">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--ak-color-bg-surface)]/80 rounded-xl p-5 border border-[var(--ak-color-border-subtle)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--ak-semantic-danger-soft)] text-[var(--ak-semantic-danger)]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-[var(--ak-color-text-primary)]">{stats.totalUnsubscribes}</div>
              <div className="text-sm text-[var(--ak-color-text-secondary)]">Abmeldungen</div>
            </div>
          </div>
          <div className="text-xs text-[var(--ak-color-text-muted)]">
            {((stats.totalUnsubscribes / stats.totalDelivered) * 100).toFixed(2)}% Abmelderate
          </div>
        </div>

        <div className="bg-[var(--ak-color-bg-surface)]/80 rounded-xl p-5 border border-[var(--ak-color-border-subtle)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--ak-semantic-warning-soft)] text-[var(--ak-semantic-warning)]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-[var(--ak-color-text-primary)]">{stats.totalComplaints}</div>
              <div className="text-sm text-[var(--ak-color-text-secondary)]">Spam-Beschwerden</div>
            </div>
          </div>
          <div className="text-xs text-[var(--ak-color-text-muted)]">
            {((stats.totalComplaints / stats.totalDelivered) * 100).toFixed(3)}% Beschwerderate
          </div>
        </div>

        <div className="bg-[var(--ak-color-bg-surface)]/80 rounded-xl p-5 border border-[var(--ak-color-border-subtle)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--ak-semantic-info-soft)] text-[var(--ak-semantic-info)]">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-[var(--ak-color-text-primary)]">{stats.clickToOpenRate.toFixed(1)}%</div>
              <div className="text-sm text-[var(--ak-color-text-secondary)]">Click-to-Open Rate</div>
            </div>
          </div>
          <div className="text-xs text-[var(--ak-color-text-muted)]">
            Von Öffnern, die auch geklickt haben
          </div>
        </div>
      </div>
    </div>
  )
}

export default CampaignAnalytics

