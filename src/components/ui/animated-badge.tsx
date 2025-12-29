import * as React from "react"
import { cn } from "@/lib/utils"
import { Zap, AlertTriangle, CheckCircle2 } from "lucide-react"

interface AnimatedBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  impact: 'low' | 'medium' | 'high' | 'negative';
  animate?: boolean;
}

interface ImpactDetail {
  icon: React.ElementType;
  gradient: string;
  label: string;
  glow: string;
  textColor: string;
  shouldAnimate?: boolean;
}

const IMPACT_CONFIG: Record<'low' | 'medium' | 'high' | 'negative', ImpactDetail> = {
  low: { 
    icon: CheckCircle2, 
    gradient: "bg-[var(--ak-semantic-success)]",
    label: "Blitzschnell",
    glow: "ak-shadow-color-semantic-success-soft",
    textColor: "text-[var(--ak-color-text-inverted)]"
  },
  medium: {
    icon: Zap,
    gradient: "bg-[var(--ak-semantic-info)]",
    label: "Normal",
    glow: "ak-shadow-color-semantic-info-soft",
    textColor: "text-[var(--ak-color-text-inverted)]"
  },
  negative: { 
    icon: Zap, 
    gradient: "bg-[var(--ak-semantic-warning)]",
    label: "⚡ Turbo-Boost",
    glow: "ak-shadow-color-semantic-warning-soft",
    textColor: "text-[var(--ak-color-text-inverted)]",
    shouldAnimate: true
  },
  high: { 
    icon: AlertTriangle, 
    gradient: "bg-[var(--ak-semantic-danger)]",
    label: "GPU-Hungry",
    glow: "ak-shadow-color-semantic-danger-soft",
    textColor: "text-[var(--ak-color-text-inverted)]"
  }
};

function AnimatedBadge({ impact, animate = true, className, ...props }: AnimatedBadgeProps) {
  const config = IMPACT_CONFIG[impact];
  const Icon = config.icon;
  const shouldPulse = config.shouldAnimate && animate;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5",
        config.gradient,
        config.textColor,
        "text-xs font-semibold rounded-full",
        "shadow-lg",
        config.glow,
        "transition-all duration-300 hover:scale-105",
        shouldPulse && "animate-pulse",
        className
      )}
      {...props}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </div>
  )
}

export { AnimatedBadge }
export type { AnimatedBadgeProps }

