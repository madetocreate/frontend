"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

export function useWebShare() {
  const [isSupported, setIsSupported] = useState(false);

  // Check support on mount
  useState(() => {
    if (typeof navigator !== "undefined") {
      setIsSupported("share" in navigator);
    }
  });

  const share = useCallback(
    async (data: ShareData) => {
      if (!("share" in navigator)) {
        // Fallback: Copy to clipboard
        const text = data.text || data.title || "";
        const url = data.url || window.location.href;
        const fullText = `${text} ${url}`.trim();

        try {
          await navigator.clipboard.writeText(fullText);
          toast.success("In Zwischenablage kopiert", {
            description: "Der Link wurde in die Zwischenablage kopiert.",
          });
        } catch (e) {
          toast.error("Fehler beim Kopieren", {
            description: "Bitte kopieren Sie den Link manuell.",
          });
        }
        return;
      }

      try {
        await navigator.share(data);
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== "AbortError") {
          console.warn("[Web Share] Share failed:", error);
          toast.error("Teilen fehlgeschlagen", {
            description: error.message || "Bitte versuchen Sie es erneut.",
          });
        }
      }
    },
    []
  );

  return {
    isSupported,
    share,
  };
}

