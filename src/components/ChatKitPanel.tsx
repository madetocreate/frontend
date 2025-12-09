'use client';

import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { chatKitOptions, chatKitOptionsWithoutPrompts } from "@/lib/chatkit-config";
import { MicrophoneButton } from "./MicrophoneButton";

type ChatKitPanelProps = {
  showPrompts?: boolean; // Standard: true (Prompts anzeigen)
}

export function ChatKitPanel({ showPrompts = true }: ChatKitPanelProps = {}) {
  const options = showPrompts ? chatKitOptions : chatKitOptionsWithoutPrompts;
  const { control } = useChatKit(options);

  return (
    <div className="relative h-full w-full bg-white">
      <ChatKit control={control} className="h-full w-full" />
      {/* Mikrofon-Button positioniert neben dem Send-Button im Composer */}
      <div 
        className="microphone-button-container absolute z-[9999] flex items-center gap-2"
        style={{
          bottom: '23px', // Etwas nach oben verschoben
          right: '65px', // 50% zurück nach links von der rechten Position
        }}
      >
        <MicrophoneButton />
      </div>
    </div>
  );
}

export default ChatKitPanel;
