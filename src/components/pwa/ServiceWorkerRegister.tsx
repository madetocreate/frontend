"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function ServiceWorkerRegister() {
  useEffect(() => {
    const isProd = process.env.NODE_ENV === "production";
    const devEnabled = process.env.NEXT_PUBLIC_PWA_DEV === "1";

    if (!isProd && !devEnabled) return;
    if (!("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;
    let updateInterval: NodeJS.Timeout | null = null;
    let checkForUpdates: (() => void) | null = null;
    let updateToastId: string | number | null = null;

    const onLoad = async () => {
      try {
        registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

        // Update-Check: Prüfe regelmäßig auf neue Versionen
        registration.addEventListener("updatefound", () => {
          const newWorker = registration?.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // Neuer Service Worker ist installiert, aber noch nicht aktiv
              // Zeige Toast statt Auto-Reload
              if (updateToastId) {
                toast.dismiss(updateToastId);
              }
              
              updateToastId = toast.info("Neue Version verfügbar", {
                description: "Eine neue Version von AKLOW ist verfügbar. Seite neu laden?",
                duration: Infinity,
                action: {
                  label: "Jetzt aktualisieren",
                  onClick: () => {
                    newWorker.postMessage({ type: "SKIP_WAITING" });
                    
                    // Warte auf Controller-Wechsel statt sofortiges Reload
                    let reloaded = false;
                    let fallbackTimeout: NodeJS.Timeout | null = null;
                    
                    const controllerChangeHandler = () => {
                      if (reloaded) return;
                      reloaded = true;
                      if (fallbackTimeout) {
                        clearTimeout(fallbackTimeout);
                      }
                      navigator.serviceWorker.removeEventListener("controllerchange", controllerChangeHandler);
                      window.location.reload();
                    };
                    
                    navigator.serviceWorker.addEventListener("controllerchange", controllerChangeHandler);
                    
                    // Fallback: Reload nach 3 Sekunden, falls controllerchange nicht feuert
                    fallbackTimeout = setTimeout(() => {
                      if (!reloaded) {
                        reloaded = true;
                        navigator.serviceWorker.removeEventListener("controllerchange", controllerChangeHandler);
                        window.location.reload();
                      }
                    }, 3000);
                  },
                },
                cancel: {
                  label: "Später",
                  onClick: () => {
                    // User kann später manuell neu laden
                    toast.dismiss(updateToastId!);
                    updateToastId = null;
                  },
                },
              });
            }
          });
        });

        // Prüfe auf Updates beim Fokus-Wechsel (User kehrt zur App zurück)
        checkForUpdates = () => {
          registration?.update().catch((err) => {
            console.warn("[PWA] Update check failed:", err);
          });
        };

        window.addEventListener("focus", checkForUpdates);
        // Prüfe auch periodisch (alle 60 Sekunden)
        updateInterval = setInterval(checkForUpdates, 60000);
      } catch (err) {
        // bewusst nur warnen – PWA darf niemals die App killen
        console.warn("[PWA] Service Worker registration failed:", err);
      }
    };

    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      if (checkForUpdates) {
        window.removeEventListener("focus", checkForUpdates);
      }
      if (updateInterval) {
        clearInterval(updateInterval);
      }
      if (updateToastId) {
        toast.dismiss(updateToastId);
      }
    };
  }, []);

  return null;
}

