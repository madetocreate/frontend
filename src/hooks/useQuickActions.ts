"use client";

import { useEffect } from "react";
import {
  emitQuickAction,
  subscribeQuickAction,
  type QuickActionPayload,
} from "@/lib/quickActionsBus";

export type QuickAction = QuickActionPayload;

export function useQuickActions(onAction: (action: QuickAction) => void) {
  useEffect(() => {
    const unsubscribe = subscribeQuickAction(onAction);
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [onAction]);
}

export function triggerQuickAction(action: QuickAction) {
  emitQuickAction(action);
}
