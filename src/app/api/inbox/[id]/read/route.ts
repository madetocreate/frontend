import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // In einer echten App: Datenbank update
    // await db.inboxItems.update({ where: { id }, data: { status: 'open', read: true } });
    
    // Mock Erfolg
    console.log(`[Inbox API] Marked item ${id} as read`);
    
    // Wir können optional an den Orchestrator weiterleiten, falls der Backend State syncen muss
    // await fetch(`${process.env.ORCHESTRATOR_URL}/inbox/${id}/read`, { method: 'POST' });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
