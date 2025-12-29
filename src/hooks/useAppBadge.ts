"use client";

import { useCallback } from "react";

export function useAppBadge() {
  const setBadge = useCallback(async (count?: number) => {
    if ("setAppBadge" in navigator) {
      try {
        if (count === undefined) {
          await navigator.setAppBadge();
        } else if (count > 0) {
          await navigator.setAppBadge(count);
        } else {
          await navigator.clearAppBadge();
        }
      } catch (e) {
        console.warn("Error setting app badge:", e);
      }
    }
  }, []);

  const clearBadge = useCallback(async () => {
    if ("clearAppBadge" in navigator) {
      try {
        await navigator.clearAppBadge();
      } catch (e) {
        console.warn("Error clearing app badge:", e);
      }
    }
  }, []);

  return { setBadge, clearBadge };
}

