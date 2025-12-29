import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // In einer echten Implementierung würde dies den Status von Nango oder der Datenbank abfragen.
  // Hier mocken wir die Antwort basierend auf dem typischen Schema.
  
  const mockStatus = {
    email: [
      { id: 'conn_gmail_1', provider: 'gmail', label: 'support@aklow.ai', fromAddress: 'support@aklow.ai', connected: true, type: 'primary' },
      { id: 'conn_smtp_1', provider: 'smtp', label: 'noreply@aklow.ai', fromAddress: 'noreply@aklow.ai', connected: true, type: 'system' }
    ],
    messenger: [
      { id: 'conn_tg_1', provider: 'telegram', label: 'AKLOW Bot', connected: true }
    ],
    review: [
        { id: 'conn_gmb_1', provider: 'google', label: 'AKLOW HQ', connected: true }
    ],
    support: []
  };

  // Optional: Versuchen echte Daten vom Backend zu holen
  try {
      const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL;
      if (ORCHESTRATOR_URL) {
          // const response = await fetch(`${ORCHESTRATOR_URL}/integrations/status`);
          // if (response.ok) return NextResponse.json(await response.json());
      }
  } catch (e) {
      // Ignore and return mock
  }

  return NextResponse.json(mockStatus);
}

