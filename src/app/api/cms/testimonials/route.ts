import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const reviews = db.prepare('SELECT * FROM testimonials ORDER BY createdAt DESC').all();
    return NextResponse.json({ success: true, data: reviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, location, deviceSold, rating, reviewText, isFeatured, isActive } = body;

    if (!customerName || !reviewText) {
      return NextResponse.json({ success: false, error: 'Customer name and review text required' }, { status: 400 });
    }

    const id = `tst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    db.prepare(`
      INSERT INTO testimonials (id, customerName, location, deviceSold, rating, reviewText, isFeatured, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      customerName,
      location || 'India',
      deviceSold || 'Smartphone',
      Number(rating) || 5,
      reviewText,
      isFeatured !== undefined ? (isFeatured ? 1 : 0) : 1,
      isActive !== undefined ? (isActive ? 1 : 0) : 1
    );

    return NextResponse.json({ success: true, message: 'Review added', data: { id } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, customerName, location, deviceSold, rating, reviewText, isFeatured, isActive } = body;

    if (!id || !customerName) {
      return NextResponse.json({ success: false, error: 'ID and customer name required' }, { status: 400 });
    }

    db.prepare(`
      UPDATE testimonials
      SET customerName = ?,
          location = ?,
          deviceSold = ?,
          rating = ?,
          reviewText = ?,
          isFeatured = ?,
          isActive = ?,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      customerName,
      location || 'India',
      deviceSold || 'Smartphone',
      Number(rating) || 5,
      reviewText,
      isFeatured !== undefined ? (isFeatured ? 1 : 0) : 1,
      isActive !== undefined ? (isActive ? 1 : 0) : 1,
      id
    );

    return NextResponse.json({ success: true, message: 'Review updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Review ID required' }, { status: 400 });
    }
    db.prepare('DELETE FROM testimonials WHERE id = ?').run(id);
    return NextResponse.json({ success: true, message: 'Review deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
