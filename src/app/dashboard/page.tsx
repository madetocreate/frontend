"use client";

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
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
    className="bg-white p-6 rounded-[24px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] transition-shadow"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-2xl", trendUp ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-600")}>
        <Icon className="w-6 h-6" />
      </div>
      <span
        className={cn(
          "flex items-center text-xs font-medium px-2 py-1 rounded-full",
          trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        )}
      >
        {trendUp ? "+" : ""}
        {trend}
        {trendUp ? <TrendingUp className="w-3 h-3 ml-1" /> : <TrendingUp className="w-3 h-3 ml-1 rotate-180" />}
      </span>
    </div>
    <div className="space-y-1">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">{value}</h3>
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
  <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group">
    <div className="p-2.5 bg-gray-100 rounded-xl text-gray-600 group-hover:bg-white group-hover:shadow-sm transition-all">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-semibold text-gray-900 truncate">{title}</h4>
      <p className="text-sm text-gray-500 truncate">{desc}</p>
    </div>
    <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
  </div>
);

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
  color: string;
  icon: LucideIcon;
}) => (
  <Link
    href={href}
    className="group relative overflow-hidden rounded-[24px] p-6 border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all"
  >
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-${color}-500`}>
      <Icon className="w-24 h-24 -mr-8 -mt-8" />
    </div>
    <div className="relative z-10 space-y-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${color}-50 text-${color}-600`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{desc}</p>
      </div>
      <div className="pt-2">
        <span className="text-sm font-medium text-blue-600 flex items-center opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
          Öffnen <ArrowUpRight className="w-4 h-4 ml-1" />
        </span>
      </div>
    </div>
  </Link>
);

// --- Main Page ---

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1D1D1F] tracking-tight">Admin Dashboard</h1>
            <p className="text-[#86868B] mt-1">Überblick über Systemstatus, Agenten und Performance.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl h-10 border-gray-200 bg-white">
              <Clock className="w-4 h-4 mr-2 text-gray-500" />
              Letzte 24h
            </Button>
            <Button className="rounded-xl h-10 bg-[#1D1D1F] text-white hover:bg-black shadow-lg shadow-gray-200/50">
              <Zap className="w-4 h-4 mr-2" />
              Report erstellen
            </Button>
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
                  title="Immobilien Wizard"
                  desc="Neue Objekte erfassen und verwalten."
                  href="/wizard"
                  color="blue"
                  icon={ArrowUpRight}
                />
                <QuickLink
                  title="Marketplace"
                  desc="Entdecken Sie neue Apps, Agenten und Workflows."
                  href="/marketplace"
                  color="pink"
                  icon={ShoppingBag}
                />
                <QuickLink
                  title="User Management"
                  desc="Benutzerrollen und Zugriffsrechte steuern."
                  href="/onboarding"
                  color="emerald"
                  icon={Users}
                />
              </div>
            </section>

            {/* Chart Placeholder (Simulated) */}
            <section className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#1D1D1F]">System Auslastung</h3>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </Button>
              </div>
              <div className="h-64 flex items-end justify-between gap-2 px-2">
                {[40, 65, 45, 80, 55, 70, 40, 60, 50, 75, 85, 60].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.05 }}
                    className="w-full bg-blue-50 rounded-t-lg relative group"
                  >
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-lg transition-all duration-500 group-hover:bg-blue-600" style={{ height: `${h}%` }} />
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-xs text-gray-400">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:59</span>
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            
            {/* Recent Activity */}
            <section className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-[#1D1D1F] mb-6">Letzte Aktivitäten</h3>
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
                <ActivityItem
                  icon={BarChart3}
                  title="Weekly Report"
                  desc="Generated automatically"
                  time="5h"
                />
              </div>
              <Button variant="ghost" className="w-full mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                Alle anzeigen
              </Button>
            </section>

            {/* System Health */}
            <section className="bg-[#1D1D1F] rounded-[24px] p-6 text-white shadow-lg">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" /> System Status
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>CPU Usage</span>
                    <span>45%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[45%]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Memory</span>
                    <span>62%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[62%]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Storage</span>
                    <span>28%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[28%]" />
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-800 flex items-center justify-between">
                <span className="text-sm text-gray-400">All systems operational</span>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
