'use client';

import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { chatKitOptions } from "@/lib/chatkit-config";

export function ChatKitPanel() {
  const { control } = useChatKit(chatKitOptions);

  return (
    <div className="h-full w-full bg-white">
      <ChatKit control={control} className="h-full w-full" />
    </div>
  );
}

export default ChatKitPanel;
