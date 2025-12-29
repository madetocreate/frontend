"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Initial status
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Verbindung wiederhergestellt", {
        description: "Sie sind wieder online.",
        duration: 3000,
        id: "network-status",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Keine Internetverbindung", {
        description: "AKLOW ist im Offline-Modus.",
        duration: Infinity, // Bleibt bis man wieder online ist oder wegklickt
        id: "network-status",
        action: {
            label: "Schließen",
            onClick: () => toast.dismiss("network-status"),
        }
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return null; // Renderless component, only toasts
}

