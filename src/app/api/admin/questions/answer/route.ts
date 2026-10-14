import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mongoUpdateAnswer, mongoDeleteAnswer } from '@/lib/mongo-catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      answerId,
      questionId,
      adjustmentValue,
      label,
      description,
      code,
      adjustmentType,
      isRejection,
      warningMessage,
    } = body;

    if (!answerId) {
      return NextResponse.json({ success: false, error: 'Answer ID required' }, { status: 400 });
    }

    let realId = answerId;
    let ansCode = code || `OPT_${Date.now().toString().slice(-4)}`;

    // Check if this is a newly added temporary answer
    if (answerId.startsWith('ans_temp_')) {
      if (!questionId) {
        return NextResponse.json({ success: false, error: 'questionId is required for new answers' }, { status: 400 });
      }
      realId = `ans_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    }

    // 1. Safe SQLite write
    try {
      if (questionId) {
        const qExists = db.prepare('SELECT id FROM questions WHERE id = ?').get(questionId);
        if (!qExists) {
          db.prepare(`
            INSERT OR IGNORE INTO questions (id, title, code, displayOrder, isActive, updatedAt)
            VALUES (?, 'Diagnostic Question', ?, 0, 1, CURRENT_TIMESTAMP)
          `).run(questionId, `Q_${Date.now()}`);
        }
      }

      if (answerId.startsWith('ans_temp_')) {
        db.prepare(`
          INSERT OR REPLACE INTO answers (id, questionId, code, label, description, adjustmentType, adjustmentValue, isRejection, warningMessage, displayOrder, isActive, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 99, 1, CURRENT_TIMESTAMP)
        `).run(
          realId,
          questionId,
          ansCode,
          label || 'New Option',
          description || null,
          adjustmentType || 'FIXED',
          Number(adjustmentValue) || 0,
          isRejection ? 1 : 0,
          warningMessage || null
        );
      } else {
        const existing = db.prepare('SELECT id FROM answers WHERE id = ?').get(answerId);
        if (!existing && questionId) {
          db.prepare(`
            INSERT OR REPLACE INTO answers (id, questionId, code, label, description, adjustmentType, adjustmentValue, isRejection, warningMessage, displayOrder, isActive, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 99, 1, CURRENT_TIMESTAMP)
          `).run(
            answerId,
            questionId,
            code || `OPT_${Date.now().toString().slice(-4)}`,
            label || 'Option',
            description || null,
            adjustmentType || 'FIXED',
            Number(adjustmentValue) || 0,
            isRejection ? 1 : 0,
            warningMessage || null
          );
        } else {
          db.prepare(`
            UPDATE answers 
            SET adjustmentValue = COALESCE(?, adjustmentValue),
                label = COALESCE(?, label),
                description = COALESCE(?, description),
                adjustmentType = COALESCE(?, adjustmentType),
                isRejection = COALESCE(?, isRejection),
                warningMessage = COALESCE(?, warningMessage),
                updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(
            adjustmentValue !== undefined ? Number(adjustmentValue) : null,
            label !== undefined ? label : null,
            description !== undefined ? description : null,
            adjustmentType !== undefined ? adjustmentType : null,
            isRejection !== undefined ? (isRejection ? 1 : 0) : null,
            warningMessage !== undefined ? warningMessage : null,
            answerId
          );
        }
      }
    } catch (sqliteErr: any) {
      console.warn('[PATCH /api/admin/questions/answer] SQLite cache write warning:', sqliteErr.message);
    }

    // 2. Persist to MongoDB (authoritative)
    if (questionId) {
      await mongoUpdateAnswer(answerId, questionId, {
        id: realId,
        code: code || (answerId.startsWith('ans_temp_') ? `OPT_${Date.now().toString().slice(-4)}` : undefined),
        adjustmentValue: adjustmentValue !== undefined ? Number(adjustmentValue) : undefined,
        label,
        description,
        adjustmentType,
        isRejection: isRejection !== undefined ? Boolean(isRejection) : undefined,
        warningMessage,
      });
    }

    return NextResponse.json({ success: true, message: 'Answer updated successfully', data: { id: realId } });
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

    // 1. Delete from SQLite
    db.prepare('DELETE FROM answers WHERE id = ?').run(id);

    // 2. Delete from MongoDB
    await mongoDeleteAnswer(id);

    return NextResponse.json({ success: true, message: 'Answer deleted' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
