import type { StartScreenPrompt } from '@openai/chatkit-react';

export const CHATKIT_API_URL =
  process.env.NEXT_PUBLIC_CHATKIT_API_URL ?? 'http://127.0.0.1:8000/chatkit';

export const CHATKIT_DOMAIN_KEY =
  process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY ?? 'domain_pk_localhost_dev';

export const GREETING = 'Hi, ich bin dein KI Assistent. Womit kann ich helfen?';

export const PLACEHOLDER_INPUT =
  'Frag mich etwas zu deinem Projekt oder Code.';

export const STARTER_PROMPTS: StartScreenPrompt[] = [
  {
    label: 'Architektur erklaeren',
    prompt: 'Erklaere mir die Architektur dieser App.',
    icon: 'circle-question',
  },
  {
    label: 'Bug Hilfe',
    prompt: 'Hilf mir einen Bug zu analysieren.',
    icon: 'bug',
  },
];
