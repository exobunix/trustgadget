import { NextRequest, NextResponse } from 'next/server';
import { db, dbHelpers } from '@/lib/db';

export async function GET() {
  try {
    const banners = db.prepare('SELECT * FROM banners ORDER BY displayOrder ASC, createdAt DESC').all();
    return NextResponse.json({ success: true, data: banners });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, subtitle, badgeText, desktopImage, mobileImage, ctaText, ctaUrl, displayOrder, isActive } = body;

    if (!title || !desktopImage) {
      return NextResponse.json({ success: false, error: 'Banner title and desktop image are required' }, { status: 400 });
    }

    const id = `ban_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    db.prepare(`
      INSERT INTO banners (id, title, subtitle, badgeText, desktopImage, mobileImage, ctaText, ctaUrl, displayOrder, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title,
      subtitle || null,
      badgeText || 'SPECIAL OFFER',
      desktopImage,
      mobileImage || desktopImage,
      ctaText || 'Sell Now',
      ctaUrl || '/sell',
      Number(displayOrder) || 0,
      isActive !== undefined ? (isActive ? 1 : 0) : 1
    );

    return NextResponse.json({ success: true, message: 'Banner created successfully', data: { id } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, subtitle, badgeText, desktopImage, mobileImage, ctaText, ctaUrl, displayOrder, isActive } = body;

    if (!id || !title) {
      return NextResponse.json({ success: false, error: 'Banner ID and title required' }, { status: 400 });
    }

    db.prepare(`
      UPDATE banners
      SET title = ?,
          subtitle = ?,
          badgeText = ?,
          desktopImage = COALESCE(?, desktopImage),
          mobileImage = COALESCE(?, mobileImage),
          ctaText = ?,
          ctaUrl = ?,
          displayOrder = ?,
          isActive = ?,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title,
      subtitle || null,
      badgeText || null,
      desktopImage || null,
      mobileImage || null,
      ctaText || 'Sell Now',
      ctaUrl || '/sell',
      Number(displayOrder) || 0,
      isActive !== undefined ? (isActive ? 1 : 0) : 1,
      id
    );

    return NextResponse.json({ success: true, message: 'Banner updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Banner ID required' }, { status: 400 });
    }
    db.prepare('DELETE FROM banners WHERE id = ?').run(id);
    return NextResponse.json({ success: true, message: 'Banner deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
