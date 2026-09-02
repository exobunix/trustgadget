import { NextRequest, NextResponse } from 'next/server';
import { db, dbHelpers } from '@/lib/db';

export async function GET() {
  try {
    // Collect users and their order stats
    const users = db.prepare(`
      SELECT 
        o.customerPhone,
        o.customerName,
        o.customerEmail,
        COUNT(o.id) as totalOrders,
        SUM(COALESCE(o.finalVerifiedPrice, o.estimatedPrice)) as totalEarnings,
        MAX(o.createdAt) as lastActive,
        COALESCE(u.isBlocked, 0) as isBlocked,
        u.id as userId
      FROM orders o
      LEFT JOIN (
        SELECT id, phone, email, isBlocked FROM users
      ) u ON o.customerPhone = u.phone
      GROUP BY o.customerPhone
      ORDER BY totalEarnings DESC
    `).all();

    return NextResponse.json({ success: true, data: users });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { phone, isBlocked, adminName } = await req.json();

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number required' }, { status: 400 });
    }

    // Insert or update block flag
    const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone) as any;
    if (existing) {
      db.prepare('UPDATE users SET isBlocked = ? WHERE phone = ?').run(isBlocked ? 1 : 0, phone);
    } else {
      db.prepare(`
        INSERT INTO users (id, phone, name, email, isBlocked)
        VALUES (?, ?, 'Customer', '', ?)
      `).run(`usr_${Date.now()}`, phone, isBlocked ? 1 : 0);
    }

    dbHelpers.createAuditLog({
      adminName: adminName || 'Super Admin',
      action: isBlocked ? 'BLOCK_USER' : 'UNBLOCK_USER',
      entityType: 'User',
      entityId: phone,
      details: `${isBlocked ? 'Blocked' : 'Unblocked'} customer user phone ${phone}`,
    });

    return NextResponse.json({ success: true, message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully` });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number required' }, { status: 400 });
    }

    db.prepare('DELETE FROM users WHERE phone = ?').run(phone);
    db.prepare('DELETE FROM orders WHERE customerPhone = ?').run(phone);

    return NextResponse.json({ success: true, message: 'User and associated records deleted' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
