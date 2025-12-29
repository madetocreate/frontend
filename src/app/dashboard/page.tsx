"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Activity,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowUpRight,
  MoreHorizontal,
  Bot,
  BarChart3,
  Globe,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AkButton } from "@/components/ui/AkButton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  CartesianGrid
} from '@/components/ui/Charts';

// --- Types ---

interface ChartDataPoint {
  name: string;
  value: number;
}

interface PieDataPoint {
  name: string;
  value: number;
  color: string;
  [key: string]: unknown;
}

interface AgentMetrics {
  dailyRequests?: ChartDataPoint[];
}

interface FeedbackMetrics {
  sentimentDistribution?: PieDataPoint[];
}

// --- Components ---

const MetricCard = ({
  title,
  value,
  trend,
  trendUp,
  icon: Icon,
  delay,
}: {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: LucideIcon;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-[var(--ak-color-bg-surface)] p-6 rounded-[var(--ak-radius-2xl)] ak-shadow-card border border-[var(--ak-color-border-subtle)] hover:ak-shadow-elevated transition-shadow"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-2xl", trendUp ? "bg-[var(--ak-semantic-info-soft)] text-[var(--ak-semantic-info)]" : "bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)]")}>
        <Icon className="w-6 h-6" />
      </div>
      <span
        className={cn(
          "flex items-center text-xs font-medium px-2 py-1 rounded-full",
          trendUp ? "ak-badge-success" : "ak-badge-danger"
        )}
      >
        {trendUp ? "+" : ""}
        {trend}
        {trendUp ? <TrendingUp className="w-3 h-3 ml-1" /> : <TrendingUp className="w-3 h-3 ml-1 rotate-180" />}
      </span>
    </div>
    <div className="space-y-1">
      <p className="text-sm font-medium text-[var(--ak-color-text-secondary)]">{title}</p>
      <h3 className="text-3xl font-bold tracking-tight text-[var(--ak-color-text-primary)]">{value}</h3>
    </div>
  </motion.div>
);

const ActivityItem = ({
  icon: Icon,
  title,
  desc,
  time,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  time: string;
}) => (
  <div className="flex items-start gap-4 p-4 hover:bg-[var(--ak-color-bg-surface-muted)] rounded-2xl transition-colors cursor-pointer group">
    <div className="p-2.5 bg-[var(--ak-color-bg-surface-muted)] rounded-xl text-[var(--ak-color-text-secondary)] group-hover:bg-[var(--ak-color-bg-surface)] group-hover:shadow-sm transition-all">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-semibold text-[var(--ak-color-text-primary)] truncate">{title}</h4>
      <p className="text-sm text-[var(--ak-color-text-secondary)] truncate">{desc}</p>
    </div>
    <span className="text-xs text-[var(--ak-color-text-muted)] whitespace-nowrap">{time}</span>
  </div>
);

const quickLinkStyles: Record<
  string,
  { overlay: string; icon: string; accent: string }
> = {
  violet: {
    overlay: "text-[var(--ak-accent-documents)] opacity-10",
    icon: "bg-[var(--ak-accent-documents-soft)] text-[var(--ak-accent-documents)]",
    accent: "text-[var(--ak-accent-documents)]",
  },
  amber: {
    overlay: "text-[var(--ak-semantic-warning)] opacity-10",
    icon: "bg-[var(--ak-semantic-warning-soft)] text-[var(--ak-semantic-warning)]",
    accent: "text-[var(--ak-semantic-warning)]",
  },
  blue: {
    overlay: "text-[var(--ak-accent-inbox)] opacity-10",
    icon: "bg-[var(--ak-accent-inbox-soft)] text-[var(--ak-accent-inbox)]",
    accent: "text-[var(--ak-accent-inbox)]",
  },
  pink: {
    overlay: "text-[var(--ak-accent-phone)] opacity-10",
    icon: "bg-[var(--ak-accent-phone-soft)] text-[var(--ak-accent-phone)]",
    accent: "text-[var(--ak-accent-phone)]",
  },
  emerald: {
    overlay: "text-[var(--ak-semantic-success)] opacity-10",
    icon: "bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)]",
    accent: "text-[var(--ak-semantic-success)]",
  },
};

const QuickLink = ({
  title,
  desc,
  href,
  color,
  icon: Icon,
}: {
  title: string;
  desc: string;
  href: string;
  color: keyof typeof quickLinkStyles;
  icon: LucideIcon;
}) => {
  const styles = quickLinkStyles[color] ?? quickLinkStyles.blue;
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[var(--ak-radius-2xl)] p-6 border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] shadow-sm hover:shadow-md transition-all"
    >
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${styles.overlay}`}>
        <Icon className="w-24 h-24 -mr-8 -mt-8" />
      </div>
      <div className="relative z-10 space-y-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", styles.icon)}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)] group-hover:text-[var(--ak-color-text-primary)] transition-colors">
            {title}
          </h3>
          <p className="text-sm text-[var(--ak-color-text-secondary)] mt-1">{desc}</p>
        </div>
        <div className="pt-2">
          <span className={cn("text-sm font-medium flex items-center opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300", styles.accent)}>
            Öffnen <ArrowUpRight className="w-4 h-4 ml-1" />
          </span>
        </div>
      </div>
    </Link>
  );
};

// --- Main Page ---

export default function DashboardPage() {
  const [agentMetrics, setAgentMetrics] = useState<AgentMetrics | null>(null);
  const [feedbackMetrics, setFeedbackMetrics] = useState<FeedbackMetrics | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { authedFetch } = await import('@/lib/api/authedFetch')
        const [agentRes, feedbackRes] = await Promise.all([
          authedFetch('/api/agent-monitoring/metrics').catch(() => null),
          authedFetch('/api/feedback/metrics').catch(() => null)
        ]);

        if (agentRes?.ok) {
          setAgentMetrics(await agentRes.json());
        }
        if (feedbackRes?.ok) {
          setFeedbackMetrics(await feedbackRes.json());
        }
      } catch (e) {
        console.error("Failed to fetch dashboard data", e);
      }
    }
    fetchData();
  }, []);

  // Mock data if fetch fails or during loading for preview
  const chartData = agentMetrics?.dailyRequests || [
    { name: 'Mo', value: 400 },
    { name: 'Di', value: 300 },
    { name: 'Mi', value: 550 },
    { name: 'Do', value: 450 },
    { name: 'Fr', value: 600 },
    { name: 'Sa', value: 350 },
    { name: 'So', value: 200 },
  ];

  const pieData = feedbackMetrics?.sentimentDistribution || [
    { name: 'Positiv', value: 65, color: '#10B981' },
    { name: 'Neutral', value: 25, color: '#F59E0B' },
    { name: 'Negativ', value: 10, color: '#EF4444' },
  ];

  return (
    <div className="min-h-screen bg-[var(--ak-color-bg-app)] p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--ak-color-text-primary)] tracking-tight">Admin Dashboard</h1>
            <p className="text-[var(--ak-color-text-muted)] mt-1">Überblick über Systemstatus, Agenten und Performance.</p>
          </div>
          <div className="flex items-center gap-3">
            <AkButton variant="secondary" className="rounded-xl h-10 border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]">
              <Clock className="w-4 h-4 mr-2 text-[var(--ak-color-text-secondary)]" />
              Letzte 24h
            </AkButton>
            <AkButton variant="primary" className="rounded-xl h-10 shadow-lg ak-shadow-color-border-subtle-50">
              <Zap className="w-4 h-4 mr-2" />
              Report erstellen
            </AkButton>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Aktive Nutzer"
            value="12.450"
            trend="12%"
            trendUp={true}
            icon={Users}
            delay={0.1}
          />
          <MetricCard
            title="Avg. Response Time"
            value="1.2s"
            trend="0.3s"
            trendUp={true}
            icon={Activity}
            delay={0.2}
          />
          <MetricCard
            title="Security Score"
            value="98/100"
            trend="2%"
            trendUp={true}
            icon={ShieldCheck}
            delay={0.3}
          />
          <MetricCard
            title="API Requests"
            value="845k"
            trend="5%"
            trendUp={true}
            icon={Globe}
            delay={0.4}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Links */}
            <section>
              <h2 className="text-xl font-semibold text-[#1D1D1F] mb-4">Module</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <QuickLink
                  title="Agent Monitoring"
                  desc="Performance und Status der AI Agenten überwachen."
                  href="/dashboard/agents"
                  color="violet"
                  icon={Bot}
                />
                <QuickLink
                  title="Quality Assurance"
                  desc="Feedback-Analyse und Qualitätsmetriken."
                  href="/dashboard/quality"
                  color="amber"
                  icon={BarChart3}
                />
                <QuickLink
                  title="Erste Schritte"
                  desc="Onboarding und Einstellungen verwalten."
                  href="/settings?view=onboarding"
                  color="emerald"
                  icon={Users}
                />
              </div>
            </section>

            {/* Main Chart */}
            <section className="bg-[var(--ak-color-bg-surface)] rounded-[var(--ak-radius-2xl)] p-6 shadow-sm border border-[var(--ak-color-border-subtle)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">System Auslastung & Requests</h3>
                <AkButton variant="ghost" size="sm" className="rounded-full w-9 h-9 p-0" aria-label="Mehr Optionen">
                  <MoreHorizontal className="w-5 h-5 text-[var(--ak-color-text-muted)]" />
                </AkButton>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#F3F4F6' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#3B82F6" 
                      radius={[6, 6, 0, 0]} 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            
            {/* Feedback / Sentiment Chart */}
            <section className="bg-[var(--ak-color-bg-surface)] rounded-[var(--ak-radius-2xl)] p-6 shadow-sm border border-[var(--ak-color-border-subtle)]">
                <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)] mb-6">User Feedback</h3>
                <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry: PieDataPoint, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.color || '#E5E7EB'} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="text-3xl font-bold text-[var(--ak-color-text-primary)]">92%</span>
                            <p className="text-xs text-[var(--ak-color-text-muted)]">Positiv</p>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex justify-center gap-4">
                    {pieData.map((entry: PieDataPoint, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-[var(--ak-color-text-secondary)]">{entry.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Recent Activity */}
            <section className="bg-[var(--ak-color-bg-surface)] rounded-[var(--ak-radius-2xl)] p-6 shadow-sm border border-[var(--ak-color-border-subtle)]">
              <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)] mb-6">Letzte Aktivitäten</h3>
              <div className="space-y-2">
                <ActivityItem
                  icon={Bot}
                  title="New Agent Deployed"
                  desc="Customer Service Bot v2.1"
                  time="2m"
                />
                <ActivityItem
                  icon={ShieldCheck}
                  title="Security Alert Resolved"
                  desc="IP Block 192.168.x.x"
                  time="15m"
                />
                <ActivityItem
                  icon={Users}
                  title="New User Onboarded"
                  desc="Sarah Meyer (Marketing)"
                  time="1h"
                />
                <ActivityItem
                  icon={Activity}
                  title="System Update"
                  desc="Maintenance Patch 4.0"
                  time="3h"
                />
              </div>
              <AkButton variant="ghost" className="w-full mt-4 text-[var(--ak-accent-inbox)] hover:brightness-110 hover:bg-[var(--ak-accent-inbox-soft)]">
                Alle anzeigen
              </AkButton>
            </section>

            {/* System Health */}
            <section className="bg-[var(--ak-color-graphite-surface)] rounded-[var(--ak-radius-2xl)] p-6 shadow-lg" style={{ color: 'var(--ak-color-graphite-text)' }}>
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[var(--ak-semantic-success)]" /> System Status
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-[var(--ak-text-muted-dark)]">
                    <span>CPU Usage</span>
                    <span>45%</span>
                  </div>
                  <div className="h-2 bg-[var(--ak-color-graphite-surface-muted)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--ak-semantic-success)] w-[45%]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-[var(--ak-text-muted-dark)]">
                    <span>Memory</span>
                    <span>62%</span>
                  </div>
                  <div className="h-2 bg-[var(--ak-color-graphite-surface-muted)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--ak-accent-inbox)] w-[62%]" />
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-[var(--ak-color-graphite-border)] flex items-center justify-between">
                <span className="text-sm text-[var(--ak-text-muted-dark)]">All systems operational</span>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--ak-semantic-success)] animate-pulse" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
