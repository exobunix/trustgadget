import { NextRequest, NextResponse } from 'next/server';
import { db, dbHelpers } from '@/lib/db';
import {
  mongoGetAllQuestions,
  mongoUpsertQuestion,
  mongoDeleteQuestion,
} from '@/lib/mongo-catalog';
import { normalizeTargetCategory } from '@/lib/question-targeting';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    // 1. Try authoritative MongoDB first
    const mongoQuestions = await mongoGetAllQuestions();
    if (mongoQuestions && mongoQuestions.length > 0) {
      let filtered = mongoQuestions;
      if (categoryId) {
        filtered = mongoQuestions.filter(
          (q: any) => !q.categoryId || q.categoryId === categoryId
        );
      }
      return NextResponse.json(
        { success: true, data: filtered },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    // 2. Fallback to SQLite
    let query = 'SELECT * FROM questions';
    const params: any[] = [];
    if (categoryId) {
      query += ' WHERE categoryId = ? OR categoryId IS NULL';
      params.push(categoryId);
    }
    query += ' ORDER BY displayOrder ASC, createdAt ASC';

    const questions = db.prepare(query).all(...params) as any[];
    const getAnswers = db.prepare('SELECT * FROM answers WHERE questionId = ? ORDER BY displayOrder ASC');

    const result = questions.map((q) => ({
      ...q,
      targetCategory: q.targetCategory || normalizeTargetCategory(null, q.categoryId, q.code),
      answers: getAnswers.all(q.id),
    }));

    return NextResponse.json(
      { success: true, data: result },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      categoryId,
      targetCategory,
      brandId,
      modelId,
      title,
      subtitle,
      code,
      questionType,
      displayOrder,
      answers,
      adminName,
    } = body;

    if (!title || !code) {
      return NextResponse.json(
        { success: false, error: 'Question title and unique code are required' },
        { status: 400 }
      );
    }

    const questionId = `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const normalizedTarget = normalizeTargetCategory(targetCategory, categoryId, code);

    // Prepare processed answers
    const processedAnswers = Array.isArray(answers)
      ? answers.map((ans: any, idx: number) => ({
          id: ans.id && !ans.id.startsWith('ans_temp_') ? ans.id : `ans_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
          questionId,
          code: ans.code || `ANS_${idx + 1}`,
          label: ans.label || 'Choice',
          description: ans.description || null,
          adjustmentType: ans.adjustmentType || 'FIXED',
          adjustmentValue: Number(ans.adjustmentValue) || 0,
          isRejection: Boolean(ans.isRejection),
          warningMessage: ans.warningMessage || null,
          displayOrder: idx + 1,
          isActive: true,
        }))
      : [];

    // 1. Safe write to SQLite cache
    try {
      let safeCategoryId = categoryId || null;
      if (safeCategoryId) {
        try {
          const cat = db.prepare('SELECT id FROM categories WHERE id = ?').get(safeCategoryId);
          if (!cat) safeCategoryId = null;
        } catch (_) {
          safeCategoryId = null;
        }
      }

      const transaction = db.transaction(() => {
        db.prepare(`
          INSERT OR REPLACE INTO questions (id, categoryId, targetCategory, brandId, modelId, title, subtitle, code, questionType, isRequired, displayOrder, isActive, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1, CURRENT_TIMESTAMP)
        `).run(
          questionId,
          safeCategoryId,
          normalizedTarget,
          brandId || null,
          modelId || null,
          title,
          subtitle || null,
          code,
          questionType || 'SINGLE_CHOICE',
          displayOrder || 0
        );

        const insertAns = db.prepare(`
          INSERT OR REPLACE INTO answers (id, questionId, code, label, description, adjustmentType, adjustmentValue, isRejection, warningMessage, displayOrder, isActive, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
        `);

        for (const ans of processedAnswers) {
          insertAns.run(
            ans.id,
            questionId,
            ans.code,
            ans.label,
            ans.description,
            ans.adjustmentType,
            ans.adjustmentValue,
            ans.isRejection ? 1 : 0,
            ans.warningMessage,
            ans.displayOrder
          );
        }
      });

      transaction();
    } catch (sqliteErr: any) {
      console.warn('[POST /api/admin/questions] SQLite write warning:', sqliteErr.message);
    }

    // 2. Persist to MongoDB (authoritative)
    await mongoUpsertQuestion(
      {
        id: questionId,
        categoryId: categoryId || null,
        targetCategory: normalizedTarget,
        brandId: brandId || null,
        modelId: modelId || null,
        title,
        subtitle: subtitle || null,
        code,
        questionType: questionType || 'SINGLE_CHOICE',
        isRequired: true,
        displayOrder: displayOrder || 0,
        isActive: true,
      },
      processedAnswers
    );

    dbHelpers.createAuditLog({
      adminName: adminName || 'Super Admin',
      action: 'CREATE_QUESTION',
      entityType: 'Question',
      entityId: questionId,
      details: `Created question "${title}" targeting ${normalizedTarget} with ${processedAnswers.length} choices`,
    });

    return NextResponse.json({
      success: true,
      message: 'Question created successfully',
      data: {
        id: questionId,
        title,
        subtitle,
        code,
        targetCategory: normalizedTarget,
        categoryId,
        answers: processedAnswers,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      subtitle,
      categoryId,
      targetCategory,
      code,
      questionType,
      isActive,
      displayOrder,
      answers,
      adminName,
    } = body;

    if (!id || !title) {
      return NextResponse.json({ success: false, error: 'Question ID and title are required' }, { status: 400 });
    }

    const normalizedTarget = normalizeTargetCategory(targetCategory, categoryId, code);

    // Prepare processed answers
    const processedAnswers = Array.isArray(answers)
      ? answers.map((ans: any, idx: number) => ({
          id: ans.id && !ans.id.startsWith('ans_temp_')
            ? ans.id
            : `ans_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
          questionId: id,
          code: ans.code || `ANS_${idx + 1}`,
          label: ans.label || 'Choice',
          description: ans.description || null,
          adjustmentType: ans.adjustmentType || 'FIXED',
          adjustmentValue: Number(ans.adjustmentValue) || 0,
          isRejection: Boolean(ans.isRejection),
          warningMessage: ans.warningMessage || null,
          displayOrder: idx + 1,
          isActive: ans.isActive !== false,
        }))
      : [];

    // 1. Safe update/upsert to SQLite cache
    try {
      let safeCategoryId = categoryId || null;
      if (safeCategoryId) {
        try {
          const cat = db.prepare('SELECT id FROM categories WHERE id = ?').get(safeCategoryId);
          if (!cat) safeCategoryId = null;
        } catch (_) {
          safeCategoryId = null;
        }
      }

      const transaction = db.transaction(() => {
        const existingQ = db.prepare('SELECT id FROM questions WHERE id = ?').get(id) as any;
        if (existingQ) {
          db.prepare(`
            UPDATE questions
            SET title = ?,
                subtitle = ?,
                categoryId = ?,
                targetCategory = ?,
                code = COALESCE(?, code),
                questionType = COALESCE(?, questionType),
                isActive = COALESCE(?, isActive),
                displayOrder = COALESCE(?, displayOrder),
                updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(
            title,
            subtitle || null,
            safeCategoryId,
            normalizedTarget,
            code || null,
            questionType || null,
            isActive !== undefined ? (isActive ? 1 : 0) : 1,
            displayOrder !== undefined ? displayOrder : 0,
            id
          );
        } else {
          db.prepare(`
            INSERT OR REPLACE INTO questions (
              id, categoryId, targetCategory, title, subtitle, code,
              questionType, isRequired, displayOrder, isActive, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, CURRENT_TIMESTAMP)
          `).run(
            id,
            safeCategoryId,
            normalizedTarget,
            title,
            subtitle || null,
            code || `Q_${Date.now()}`,
            questionType || 'SINGLE_CHOICE',
            displayOrder !== undefined ? displayOrder : 0,
            isActive !== undefined ? (isActive ? 1 : 0) : 1
          );
        }

        // If answers provided, reconcile in SQLite
        if (processedAnswers.length > 0) {
          db.prepare('DELETE FROM answers WHERE questionId = ?').run(id);
          const insertAns = db.prepare(`
            INSERT OR REPLACE INTO answers (
              id, questionId, code, label, description, adjustmentType,
              adjustmentValue, isRejection, warningMessage, displayOrder, isActive, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `);

          processedAnswers.forEach((ans) => {
            insertAns.run(
              ans.id,
              id,
              ans.code,
              ans.label,
              ans.description,
              ans.adjustmentType,
              ans.adjustmentValue,
              ans.isRejection ? 1 : 0,
              ans.warningMessage,
              ans.displayOrder,
              ans.isActive ? 1 : 0
            );
          });
        }
      });

      transaction();
    } catch (sqliteErr: any) {
      console.warn('[PUT /api/admin/questions] SQLite write warning:', sqliteErr.message);
    }

    // 2. Persist to MongoDB (authoritative)
    await mongoUpsertQuestion(
      {
        id,
        title,
        subtitle: subtitle || null,
        categoryId: categoryId || null,
        targetCategory: normalizedTarget,
        code: code || null,
        questionType: questionType || 'SINGLE_CHOICE',
        isActive: isActive !== false,
        displayOrder: displayOrder ?? 0,
      },
      processedAnswers
    );

    dbHelpers.createAuditLog({
      adminName: adminName || 'Super Admin',
      action: 'UPDATE_QUESTION',
      entityType: 'Question',
      entityId: id,
      details: `Updated question "${title}" targeting ${normalizedTarget}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Question updated successfully',
      data: { id, targetCategory: normalizedTarget },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Question ID required' }, { status: 400 });
    }

    // 1. Delete from SQLite
    dbHelpers.deleteQuestion(id);

    // 2. Delete from MongoDB
    await mongoDeleteQuestion(id);

    dbHelpers.createAuditLog({
      adminName: 'Super Admin',
      action: 'DELETE_QUESTION',
      entityType: 'Question',
      entityId: id,
      details: `Deleted question ID ${id}`,
    });

    return NextResponse.json({ success: true, message: 'Question deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
