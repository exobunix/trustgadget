import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const rows = db.prepare('SELECT * FROM settings').all() as any[];
    const settingsMap: Record<string, string> = {};
    rows.forEach((r) => {
      settingsMap[r.key] = r.value;
    });
    return NextResponse.json({ success: true, data: settingsMap, list: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // body can be an object with key-value pairs: { support_phone: '...', support_email: '...', ... }
    const stmt = db.prepare(`
      INSERT INTO settings (key, value, groupName, description, updatedAt)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updatedAt = CURRENT_TIMESTAMP
    `);

    const transaction = db.transaction(() => {
      for (const [key, value] of Object.entries(body)) {
        if (value !== undefined && value !== null) {
          stmt.run(key, String(value), 'general', `${key.replace(/_/g, ' ')}`);
        }
      }
    });

    transaction();

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
