import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email } = body;

    if (!phone && !email) {
      return NextResponse.json({ success: false, error: 'Phone number or email is required' }, { status: 400 });
    }

    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : null;
    const userEmail = email ? email.trim().toLowerCase() : `${cleanPhone}@trustmygadget.user`;
    const userName = name?.trim() || `Customer ${cleanPhone ? cleanPhone.slice(-4) : ''}`;

    // Check if user exists by phone or email
    let user: any = null;
    if (cleanPhone) {
      user = db.prepare('SELECT * FROM users WHERE phone = ?').get(cleanPhone);
    }
    if (!user && userEmail) {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(userEmail);
    }

    if (!user) {
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      db.prepare(`
        INSERT INTO users (id, name, email, phone, role, isBlocked)
        VALUES (?, ?, ?, ?, 'CUSTOMER', 0)
      `).run(userId, userName, userEmail, cleanPhone);

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    } else {
      // Update name/phone/email if provided
      db.prepare(`
        UPDATE users
        SET name = COALESCE(?, name),
            phone = COALESCE(?, phone),
            email = COALESCE(?, email),
            updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(name?.trim() || null, cleanPhone || null, userEmail || null, user.id);

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      message: 'Authentication successful',
    });
  } catch (error: any) {
    console.error('Customer auth error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
