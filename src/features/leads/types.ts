export type LeadSource = 'contact' | 'check' | 'demo' | 'newsletter' | 'exit_intent';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';

export interface Lead {
  id: string;
  source: LeadSource;
  email: string | null;
  name: string | null;
  phone: string | null;
  company: string | null;
  city: string | null;
  website: string | null;
  message: string | null;
  intent: string | null;
  status: LeadStatus;
  owner_user_id: string | null;
  score: number | null;
  raw_payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  last_seen_at: string | null;
}

