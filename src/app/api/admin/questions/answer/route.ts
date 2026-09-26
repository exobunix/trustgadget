import { NextRequest, NextResponse } from 'next/server';
import { db, dbHelpers } from '@/lib/db';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { answerId, questionId, adjustmentValue, label, description, code, adjustmentType, isRejection } = body;

    if (!answerId) {
      return NextResponse.json({ success: false, error: 'Answer ID required' }, { status: 400 });
    }

    // Check if this is a newly added temporary answer
    if (answerId.startsWith('ans_temp_')) {
      if (!questionId) {
        return NextResponse.json({ success: false, error: 'questionId is required for new answers' }, { status: 400 });
      }

      const realId = `ans_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const ansCode = code || `OPT_${Date.now().toString().slice(-4)}`;

      db.prepare(`
        INSERT INTO answers (id, questionId, code, label, description, adjustmentType, adjustmentValue, isRejection, displayOrder, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 99, 1)
      `).run(
        realId,
        questionId,
        ansCode,
        label || 'New Option',
        description || null,
        adjustmentType || 'FIXED',
        Number(adjustmentValue) || 0,
        isRejection ? 1 : 0
      );

      return NextResponse.json({ success: true, message: 'Answer created successfully', data: { id: realId } });
    }

    // Existing answer: check if exists in DB
    const existing = db.prepare('SELECT id FROM answers WHERE id = ?').get(answerId);
    if (!existing) {
      if (questionId) {
        // Insert if missing
        db.prepare(`
          INSERT INTO answers (id, questionId, code, label, description, adjustmentType, adjustmentValue, isRejection, displayOrder, isActive)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 99, 1)
        `).run(
          answerId,
          questionId,
          code || `OPT_${Date.now().toString().slice(-4)}`,
          label || 'Option',
          description || null,
          adjustmentType || 'FIXED',
          Number(adjustmentValue) || 0,
          isRejection ? 1 : 0
        );
        return NextResponse.json({ success: true, message: 'Answer inserted' });
      }
      return NextResponse.json({ success: false, error: 'Answer not found' }, { status: 404 });
    }

    db.prepare(`
      UPDATE answers 
      SET adjustmentValue = COALESCE(?, adjustmentValue),
          label = COALESCE(?, label),
          description = COALESCE(?, description),
          adjustmentType = COALESCE(?, adjustmentType),
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      adjustmentValue !== undefined ? Number(adjustmentValue) : null,
      label !== undefined ? label : null,
      description !== undefined ? description : null,
      adjustmentType !== undefined ? adjustmentType : null,
      answerId
    );

    return NextResponse.json({ success: true, message: 'Answer updated successfully' });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Answer ID required' }, { status: 400 });
    }

    db.prepare('DELETE FROM answers WHERE id = ?').run(id);
    return NextResponse.json({ success: true, message: 'Answer deleted' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
