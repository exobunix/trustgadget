import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const coupons = db.prepare('SELECT * FROM coupons ORDER BY createdAt DESC').all();
    return NextResponse.json({ success: true, data: coupons });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, title, description, discountType, discountValue, minDeviceValue, maxBonus, expiryDate } = body;

    if (!code || !discountValue) {
      return NextResponse.json({ success: false, error: 'Code and bonus value are required' }, { status: 400 });
    }

    const id = `cpn_${Date.now()}`;
    const cleanCode = code.toUpperCase().trim();

    db.prepare(`
      INSERT INTO coupons (id, code, title, description, discountType, discountValue, minDeviceValue, maxBonus, expiryDate, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      id,
      cleanCode,
      title || `${cleanCode} Bonus`,
      description || 'Special exchange payout bonus',
      discountType || 'FIXED',
      Number(discountValue),
      Number(minDeviceValue) || 0,
      maxBonus ? Number(maxBonus) : null,
      expiryDate || null
    );

    return NextResponse.json({ success: true, message: 'Coupon created successfully' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Coupon ID required' }, { status: 400 });
    }

    db.prepare('DELETE FROM coupons WHERE id = ?').run(id);
    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
