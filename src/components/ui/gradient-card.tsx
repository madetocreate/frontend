import * as React from "react"
import { cn } from "@/lib/utils"

interface GradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: 'blue' | 'purple' | 'orange' | 'none';
  glow?: boolean;
  children: React.ReactNode;
}

const GRADIENT_CLASSES = {
  blue: "bg-[var(--ak-semantic-info-soft)]",
  purple: "bg-[var(--ak-accent-documents-soft)]",
  orange: "bg-[var(--ak-semantic-warning-soft)]",
  none: "bg-[var(--ak-color-bg-surface)]"
};

const GLOW_CLASSES = {
  blue: "ak-shadow-color-semantic-info-soft",
  purple: "ak-shadow-color-accent-documents-soft",
  orange: "ak-shadow-color-semantic-warning-soft",
  none: ""
};

export function GradientCard({ 
  gradient = 'blue', 
  glow = false,
  className, 
  children,
  ...props 
}: GradientCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl",
        GRADIENT_CLASSES[gradient],
        "border border-[var(--ak-color-border-subtle)]",
        "backdrop-blur-xl",
        "transition-all duration-300",
        glow && [
          "shadow-2xl",
          GLOW_CLASSES[gradient]
        ],
        "hover:shadow-2xl",
        glow && gradient !== 'none' && GLOW_CLASSES[gradient],
        "group",
        className
      )}
      {...props}
    >
      {/* Shimmer Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--ak-color-bg-surface)]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}

