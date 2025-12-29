import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // In einer echten App: Datenbank update
    // await db.inboxItems.update({ where: { id }, data: { status: 'archived' } });
    
    console.log(`[Inbox API] Archived item ${id}`);
    
    // Optional Backend Sync
    // await fetch(`${process.env.ORCHESTRATOR_URL}/inbox/${id}/archive`, { method: 'POST' });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
