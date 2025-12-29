import * as React from "react"
import { cn } from "@/lib/utils"

interface FeatureStatusDotProps {
  enabled: boolean;
  saving?: boolean;
  className?: string;
}

export function FeatureStatusDot({ enabled, saving = false, className }: FeatureStatusDotProps) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Main Dot */}
      <div
        className={cn(
          "w-2.5 h-2.5 rounded-full transition-all duration-300",
          enabled ? "bg-[var(--ak-semantic-success)]" : "bg-[var(--ak-color-text-muted)]",
          enabled && !saving && "animate-pulse"
        )}
      />
      
      {/* Pulse Ring */}
      {enabled && !saving && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--ak-semantic-success)] opacity-75 animate-ping" />
      )}
      
      {/* Saving Spinner */}
      {saving && (
        <div className="absolute -inset-1">
          <div className="w-full h-full border-2 border-[var(--ak-semantic-info)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

