'use client';

interface SettingsPlaceholderProps {
  title: string;
}

export function SettingsPlaceholder({ title }: SettingsPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <h2 className="text-lg font-medium text-[var(--ak-color-text-primary)] mb-2">
        {title}
      </h2>
      <p className="text-sm text-[var(--ak-color-text-muted)]">
        Kommt gleich
      </p>
    </div>
  );
}

