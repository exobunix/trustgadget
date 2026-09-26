import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    let query = 'SELECT * FROM faqs';
    const params: any[] = [];
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    query += ' ORDER BY displayOrder ASC, createdAt DESC';
    const faqs = db.prepare(query).all(...params);
    return NextResponse.json({ success: true, data: faqs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, question, answer, displayOrder, isFeatured, isActive } = body;

    if (!question || !answer) {
      return NextResponse.json({ success: false, error: 'Question and answer are required' }, { status: 400 });
    }

    const id = `faq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    db.prepare(`
      INSERT INTO faqs (id, category, question, answer, displayOrder, isFeatured, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      category || 'General',
      question,
      answer,
      Number(displayOrder) || 0,
      isFeatured ? 1 : 0,
      isActive !== undefined ? (isActive ? 1 : 0) : 1
    );

    return NextResponse.json({ success: true, message: 'FAQ created successfully', data: { id } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, category, question, answer, displayOrder, isFeatured, isActive } = body;

    if (!id || !question || !answer) {
      return NextResponse.json({ success: false, error: 'FAQ ID, question and answer required' }, { status: 400 });
    }

    db.prepare(`
      UPDATE faqs
      SET category = ?,
          question = ?,
          answer = ?,
          displayOrder = ?,
          isFeatured = ?,
          isActive = ?,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      category || 'General',
      question,
      answer,
      Number(displayOrder) || 0,
      isFeatured ? 1 : 0,
      isActive !== undefined ? (isActive ? 1 : 0) : 1,
      id
    );

    return NextResponse.json({ success: true, message: 'FAQ updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'FAQ ID required' }, { status: 400 });
    }
    db.prepare('DELETE FROM faqs WHERE id = ?').run(id);
    return NextResponse.json({ success: true, message: 'FAQ deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
