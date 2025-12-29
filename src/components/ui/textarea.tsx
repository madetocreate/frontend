import * as React from "react";
import clsx from "clsx";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={clsx(
          "flex min-h-[80px] w-full rounded-md border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] px-3 py-2 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";


