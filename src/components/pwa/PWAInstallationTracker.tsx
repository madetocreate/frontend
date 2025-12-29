"use client";

import { useEffect } from "react";
import { usePWAInstallation } from "../../hooks/usePWAInstallation";

/**
 * Tracks PWA installation events
 * Silent component - no UI, just analytics
 */
export function PWAInstallationTracker() {
  const { isInstalled, installationDate } = usePWAInstallation();

  useEffect(() => {
    // Installation tracking happens in the hook
    // This component just ensures the hook is active
    if (isInstalled && installationDate) {
      // Optional: Additional tracking logic here
    }
  }, [isInstalled, installationDate]);

  return null;
}

