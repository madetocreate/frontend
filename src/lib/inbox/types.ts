export type InboxChannel = 'email' | 'messenger' | 'phone' | 'reviews' | 'website' | 'documents' | 'support' | 'shopify' | 'notifications';

export type InboxState = 'new' | 'triaged' | 'waiting' | 'drafted' | 'approved' | 'sent' | 'archived';

export type UniversalInboxItem = { 
  id: string;
  threadId: string | null;
  channel: InboxChannel;
  source?: string;              // z.B. Gmail, WhatsApp, Google Reviews, Shopify
  sender: string;               // Anzeige-Name (oder Nummer)
  title: string;                // Subject / Event title
  snippet: string;              // Kurzvorschau
  time: string;                 // Display-Zeit
  unread?: boolean;
  important?: boolean;
  tags?: string[];
  status?: InboxState | string; // tolerant
  ai_state?: string;
  sla?: string;
  owner?: string;
  kind?: string;                // z.B. 'email'|'review'|'document'|'order' etc. (optional)
  meta?: Record<string, any>;   // safe optional
  nextAction?: { label: string; tone?: 'neutral'|'urgent'|'info' } | null; // für UI-Chip
  suggestedActions?: Array<{
    id: string;
    label: string;
    icon?: string;
    actionId?: string;
  }>;
  isDemo?: boolean;             // Marks demo/example items (from backend: is_demo)
};

