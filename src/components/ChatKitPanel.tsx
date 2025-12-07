'use client'

import { ChatKit, useChatKit } from '@openai/chatkit-react'

const CHATKIT_API_URL =
  process.env.NEXT_PUBLIC_CHATKIT_API_URL ?? 'http://127.0.0.1:8000/chatkit'

const CHATKIT_DOMAIN_KEY =
  process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY ?? 'domain_pk_localhost_dev'

export function ChatKitPanel() {
  const { control } = useChatKit({
    api: {
      url: CHATKIT_API_URL,
      domainKey: CHATKIT_DOMAIN_KEY,
    },
    startScreen: {
      greeting: 'Hi, ich bin dein KI-Assistent. Womit kann ich helfen?',
      prompts: [
        {
          label: 'Architektur erklären',
          prompt: 'Erkläre mir die Architektur dieser App.',
          icon: 'bolt',
        },
        {
          label: 'Bug analysieren',
          prompt: 'Hilf mir, einen Bug in meinem Code zu finden.',
          icon: 'bug',
        },
      ],
    },
    composer: {
      placeholder: 'Frag mich etwas zu deinem Projekt oder Code...',
    },
  })

  return (
    <div className="h-full w-full">
      <ChatKit control={control} />
    </div>
  )
}

export default ChatKitPanel
