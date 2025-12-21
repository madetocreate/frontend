"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });

      // Handle install prompt
      window.addEventListener("beforeinstallprompt", (e: Event) => {
        e.preventDefault();
        // Store the event for a custom "Install" button if needed later.
        // (We intentionally keep this local to avoid leaking globals.)
        const deferredPrompt = e;
        void deferredPrompt;
        // You can show a custom install button here
      });
    }
  }, []);

  return null;
}

