import { NextRequest, NextResponse } from 'next/server';
import { db, dbHelpers } from '@/lib/db';
import { mongoGetAllQuestions, syncMongoQuestionsToSqlite } from '@/lib/mongo-catalog';
import { isQuestionApplicable } from '@/lib/question-targeting';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const brandId = searchParams.get('brandId') || undefined;
    const modelId = searchParams.get('modelId') || undefined;

    if (!categoryId) {
      return NextResponse.json({ success: false, error: 'categoryId is required' }, { status: 400 });
    }

    // 1. Resolve device context
    let brandName = '';
    let modelName = '';
    let series = '';
    if (modelId) {
      try {
        const m = db
          .prepare(
            'SELECT m.name as modelName, m.series, b.name as brandName FROM models m LEFT JOIN brands b ON m.brandId = b.id WHERE m.id = ?'
          )
          .get(modelId) as any;
        if (m) {
          modelName = m.modelName || '';
          brandName = m.brandName || '';
          series = m.series || '';
        }
      } catch (e) {}
    } else if (brandId) {
      try {
        const b = db.prepare('SELECT name FROM brands WHERE id = ?').get(brandId) as any;
        if (b) brandName = b.name || '';
      } catch (e) {}
    }

    const deviceContext = {
      categoryId,
      brandId,
      brandName,
      modelId,
      modelName,
      series,
    };

    // 2. Fetch authoritative questions from MongoDB
    try {
      const mongoQuestions = await mongoGetAllQuestions();
      if (mongoQuestions && mongoQuestions.length > 0) {
        const applicable = mongoQuestions.filter(
          (q: any) => q.isActive !== false && isQuestionApplicable(q, deviceContext)
        );

        // Keep local SQLite cache synced in the background
        syncMongoQuestionsToSqlite(db).catch(() => {});

        return NextResponse.json(
          { success: true, data: applicable },
          { headers: { 'Cache-Control': 'no-store, max-age=0' } }
        );
      }
    } catch (mongoErr) {
      console.warn('[valuation/questions] MongoDB query failed, falling back to SQLite:', mongoErr);
    }

    // 3. Fallback to SQLite
    const questions = dbHelpers.getQuestionsForDevice(categoryId, brandId, modelId);
    return NextResponse.json(
      { success: true, data: questions },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
