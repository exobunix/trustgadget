import { NextRequest, NextResponse } from 'next/server';
import { db, dbHelpers } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    let query = 'SELECT * FROM questions';
    const params: any[] = [];
    if (categoryId) {
      query += ' WHERE categoryId = ? OR categoryId IS NULL';
      params.push(categoryId);
    }
    query += ' ORDER BY displayOrder ASC';

    const questions = db.prepare(query).all(...params) as any[];
    const getAnswers = db.prepare('SELECT * FROM answers WHERE questionId = ? ORDER BY displayOrder ASC');

    const result = questions.map(q => ({
      ...q,
      answers: getAnswers.all(q.id),
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      categoryId,
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
      return NextResponse.json({ success: false, error: 'Question title and unique code are required' }, { status: 400 });
    }

    const questionId = `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO questions (id, categoryId, brandId, modelId, title, subtitle, code, questionType, isRequired, displayOrder, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1)
      `).run(
        questionId,
        categoryId || null,
        brandId || null,
        modelId || null,
        title,
        subtitle || null,
        code,
        questionType || 'SINGLE_CHOICE',
        displayOrder || 0
      );

      if (Array.isArray(answers)) {
        const insertAns = db.prepare(`
          INSERT INTO answers (id, questionId, code, label, description, adjustmentType, adjustmentValue, isRejection, warningMessage, displayOrder, isActive)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `);

        answers.forEach((ans: any, idx: number) => {
          const ansId = `ans_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`;
          insertAns.run(
            ansId,
            questionId,
            ans.code || `ANS_${idx}`,
            ans.label,
            ans.description || null,
            ans.adjustmentType || 'FIXED',
            Number(ans.adjustmentValue) || 0,
            ans.isRejection ? 1 : 0,
            ans.warningMessage || null,
            idx + 1
          );
        });
      }
    });

    transaction();

    dbHelpers.createAuditLog({
      adminName: adminName || 'Admin User',
      action: 'CREATE_QUESTION',
      entityType: 'Question',
      entityId: questionId,
      details: `Created question "${title}" with ${answers?.length || 0} choices`,
    });

    return NextResponse.json({ success: true, message: 'Question created successfully', data: { id: questionId } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
