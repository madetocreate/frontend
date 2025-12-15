'use client'

import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkListRow } from '@/components/ui/AkListRow'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'

export function GrowthAnalytics() {
  return (
    <div className="p-6 space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <WidgetCard title="Total Revenue" padding="lg" className="apple-glass-enhanced hover:shadow-[var(--ak-shadow-md)] transition-all duration-200">
                <div className="mt-2">
                    <div className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">€24,500</div>
                    <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                        <ArrowUpIcon className="h-3 w-3" />
                        <span>12.5% vs last month</span>
                    </div>
                </div>
            </WidgetCard>
            <WidgetCard title="Avg. Deal Size" padding="lg" className="apple-glass-enhanced hover:shadow-[var(--ak-shadow-md)] transition-all duration-200">
                <div className="mt-2">
                    <div className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">€1,250</div>
                     <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                        <ArrowDownIcon className="h-3 w-3" />
                        <span>2.1% vs last month</span>
                    </div>
                </div>
            </WidgetCard>
            <WidgetCard title="Conversion Rate" padding="lg" className="apple-glass-enhanced hover:shadow-[var(--ak-shadow-md)] transition-all duration-200">
                <div className="mt-2">
                    <div className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">3.8%</div>
                     <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                        <ArrowUpIcon className="h-3 w-3" />
                        <span>0.4% vs last month</span>
                    </div>
                </div>
            </WidgetCard>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WidgetCard title="Lead Sources" className="min-h-[300px] apple-glass-enhanced" padding="lg">
                <div className="space-y-4 pt-2">
                    {[
                        { label: 'Organic Search', value: 45, color: 'bg-blue-500' },
                        { label: 'Social Media', value: 25, color: 'bg-indigo-500' },
                        { label: 'Referral', value: 20, color: 'bg-purple-500' },
                        { label: 'Paid Ads', value: 10, color: 'bg-pink-500' },
                    ].map((item) => (
                        <div key={item.label}>
                            <div className="flex justify-between text-sm mb-1">
                                <span>{item.label}</span>
                                <span className="font-medium">{item.value}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </WidgetCard>

             <WidgetCard title="Recent Activity" className="min-h-[300px] apple-glass-enhanced" padding="sm">
                <div className="divide-y divide-[var(--ak-color-border-hairline)]">
                    <AkListRow 
                        title="New Deal Created" 
                        subtitle="Acme Corp - €5,000" 
                        leading={<div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">$$</div>}
                        trailing={<span className="text-xs text-gray-400">2h ago</span>}
                    />
                    <AkListRow 
                        title="Lead Qualified" 
                        subtitle="Max Mustermann" 
                        leading={<div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">LQ</div>}
                         trailing={<span className="text-xs text-gray-400">4h ago</span>}
                    />
                    <AkListRow 
                        title="Campaign Started" 
                        subtitle="Winter Sale 2025" 
                        leading={<div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs">CP</div>}
                         trailing={<span className="text-xs text-gray-400">1d ago</span>}
                    />
                </div>
            </WidgetCard>
       </div>
    </div>
  )
}
