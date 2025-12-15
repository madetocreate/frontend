"use client";

import "../i18n/config";

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  // i18n wird beim Import initialisiert
  return <>{children}</>;
}

