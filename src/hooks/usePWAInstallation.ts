"use client";

import { useEffect, useState } from "react";

interface InstallationEvent {
  timestamp: number;
  userAgent: string;
  platform: string;
  isStandalone: boolean;
  displayMode: string;
}

export function usePWAInstallation() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [installationDate, setInstallationDate] = useState<Date | null>(null);

  useEffect(() => {
    // Check if PWA is installed
    const checkInstallation = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");

      setIsInstalled(isStandalone);

      if (isStandalone) {
        // Check if we have stored installation date
        const stored = localStorage.getItem("pwa_installation_date");
        if (!stored) {
          // First time detected as installed
          const event: InstallationEvent = {
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            isStandalone: true,
            displayMode: window.matchMedia("(display-mode: standalone)").matches
              ? "standalone"
              : "browser",
          };

          // Store installation date
          localStorage.setItem("pwa_installation_date", new Date().toISOString());
          localStorage.setItem("pwa_installation_event", JSON.stringify(event));

          // Track installation (optional: send to analytics)
          trackInstallation(event);
        } else {
          setInstallationDate(new Date(stored));
        }
      }
    };

    checkInstallation();

    // Listen for appinstalled event (Chrome/Edge)
    const handleAppInstalled = () => {
      const event: InstallationEvent = {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        isStandalone: true,
        displayMode: "standalone",
      };

      localStorage.setItem("pwa_installation_date", new Date().toISOString());
      localStorage.setItem("pwa_installation_event", JSON.stringify(event));
      setIsInstalled(true);
      setInstallationDate(new Date());

      trackInstallation(event);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return {
    isInstalled,
    installationDate,
  };
}

function trackInstallation(event: InstallationEvent) {
  // Optional: Send to analytics endpoint
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "1") {
    try {
      // You can extend this to send to your analytics service
      console.log("[PWA Analytics] Installation tracked:", event);
      
      // Example: Send to analytics endpoint
      // fetch('/api/analytics/pwa-installation', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // }).catch(() => {});
    } catch (e) {
      // Silent fail
    }
  }
}

