"use client";

import { useEffect } from "react";
import clsx from "clsx";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { chatKitOptions } from "@/lib/chatkit-config";
import { useRealtimeVoice } from "@/hooks/useRealtimeVoice";

export function ChatKitPanel() {
  const { control, setThreadId } = useChatKit(chatKitOptions);
  const { isLive, isConnecting, toggle } = useRealtimeVoice();

  // Chat-Nachrichten mit Memory verbinden
  useEffect(() => {
    const handleMessage = async (message: { threadId?: string; role?: string; content?: string }) => {
      try {
        // Speichere Nachricht im Memory über Backend
        await fetch('/api/memory/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            threadId: message.threadId,
            role: message.role,
            content: message.content,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.error('Fehler beim Speichern im Memory:', error);
      }
    };

    // Event-Listener für ChatKit-Nachrichten
    const handleChatKitMessage = (e: CustomEvent) => {
      if (e.detail?.message) {
        handleMessage(e.detail.message);
      }
    };

    window.addEventListener('chatkit-message', handleChatKitMessage as EventListener);

    return () => {
      window.removeEventListener('chatkit-message', handleChatKitMessage as EventListener);
    };
  }, []);

  // Event-Listener für Thread-Wechsel aus der Sidebar
  useEffect(() => {
    const handleNewChat = () => {
      setThreadId(null);
    };

    const handleSelectThread = (e: CustomEvent<{ threadId: string }>) => {
      setThreadId(e.detail.threadId);
    };

    window.addEventListener("aklow-new-chat", handleNewChat as EventListener);
    window.addEventListener(
      "aklow-select-thread",
      handleSelectThread as EventListener
    );

    return () => {
      window.removeEventListener(
        "aklow-new-chat",
        handleNewChat as EventListener
      );
      window.removeEventListener(
        "aklow-select-thread",
        handleSelectThread as EventListener
      );
    };
  }, [setThreadId]);

  return (
    <div className="relative h-full w-full bg-white">
      <ChatKit control={control} className="h-full w-full" />

      {/* Runder Mikro-Button links neben dem Send-Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '22px',
          right: '65px',
          zIndex: 99999,
          pointerEvents: 'auto',
        }}
      >
        <button
          type="button"
          onClick={toggle}
          className={clsx(
            "flex h-9 w-9 items-center justify-center rounded-full",
            "border transition-all duration-200 ease-[var(--ak-motion-ease)]",
            "backdrop-blur-sm",
            "border-black/80 bg-white/70",
            isConnecting && "opacity-70 animate-pulse"
          )}
          aria-label="Sprachaufnahme starten/stoppen"
        >
          {/* Punkt innen + kleiner Kreis + großer Kreis */}
          <div className="relative flex items-center justify-center">
            {/* Großer Kreis außen (bleibt immer gleich) */}
            <div className="h-5 w-5 rounded-full border border-slate-400/30" />
            {/* Kleiner Kreis (schwarz, leuchtet rot wenn aktiv) */}
            <div className={clsx(
              "absolute h-2.5 w-2.5 rounded-full border",
              isLive 
                ? "border-red-500/70 bg-red-500/20 shadow-[0_0_6px_rgba(239,68,68,0.8)]" 
                : "border-black/60 bg-black/30"
            )} />
            {/* Punkt innen (leuchtet rot wenn aktiv) */}
            <div className={clsx(
              "absolute h-1.5 w-1.5 rounded-full",
              isLive 
                ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1),0_0_12px_rgba(239,68,68,0.8)]" 
                : "bg-slate-400/50"
            )} />
          </div>
        </button>
      </div>
    </div>
  );
}

export default ChatKitPanel;
