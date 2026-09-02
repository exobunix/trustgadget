import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get('ticketId');

    if (!ticketId) {
      return NextResponse.json({ success: false, error: 'Ticket ID required' }, { status: 400 });
    }

    const messages = db.prepare('SELECT * FROM support_messages WHERE ticketId = ? ORDER BY createdAt ASC').all(ticketId);
    const ticket = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(ticketId);

    return NextResponse.json({ success: true, data: { ticket, messages } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketId, sender, senderName, message } = body;

    if (!ticketId || !message) {
      return NextResponse.json({ success: false, error: 'Ticket ID and message are required' }, { status: 400 });
    }

    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO support_messages (id, ticketId, sender, senderName, message)
        VALUES (?, ?, ?, ?, ?)
      `).run(msgId, ticketId, sender || 'AGENT', senderName || 'Support Specialist', message);

      // Update ticket timestamp & status
      db.prepare(`
        UPDATE support_tickets 
        SET updatedAt = CURRENT_TIMESTAMP,
            status = CASE WHEN ? = 'CUSTOMER' THEN 'OPEN' ELSE 'IN_PROGRESS' END
        WHERE id = ?
      `).run(sender || 'AGENT', ticketId);
    });

    transaction();

    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
