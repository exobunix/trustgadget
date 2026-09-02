import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const status = searchParams.get('status');

    let query = 'SELECT * FROM support_tickets';
    const params: any[] = [];

    if (phone) {
      query += ' WHERE customerPhone = ?';
      params.push(phone);
    } else if (status && status !== 'ALL') {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY updatedAt DESC';

    const tickets = db.prepare(query).all(...params) as any[];

    // Attach latest message snippet
    const getLatestMsg = db.prepare('SELECT message, sender, createdAt FROM support_messages WHERE ticketId = ? ORDER BY createdAt DESC LIMIT 1');
    const enriched = tickets.map(t => ({
      ...t,
      latestMessage: getLatestMsg.get(t.id),
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerPhone, customerEmail, orderNumber, subject, message } = body;

    if (!customerName || !customerPhone || !subject || !message) {
      return NextResponse.json({ success: false, error: 'Name, phone, subject and message are required' }, { status: 400 });
    }

    const ticketId = `tkt_${Date.now()}`;
    const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO support_tickets (id, ticketNumber, customerName, customerPhone, customerEmail, orderNumber, subject, status, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN', 'MEDIUM')
      `).run(ticketId, ticketNumber, customerName, customerPhone, customerEmail || null, orderNumber || null, subject);

      db.prepare(`
        INSERT INTO support_messages (id, ticketId, sender, senderName, message)
        VALUES (?, ?, 'CUSTOMER', ?, ?)
      `).run(`msg_${Date.now()}`, ticketId, customerName, message);
    });

    transaction();

    return NextResponse.json({
      success: true,
      data: { id: ticketId, ticketNumber },
      message: 'Support ticket created successfully',
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, priority } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Ticket ID required' }, { status: 400 });
    }

    db.prepare(`
      UPDATE support_tickets
      SET status = COALESCE(?, status),
          priority = COALESCE(?, priority),
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status || null, priority || null, id);

    return NextResponse.json({ success: true, message: 'Ticket status updated' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
