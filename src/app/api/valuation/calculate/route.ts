import { NextRequest, NextResponse } from 'next/server';
import { calculateValuation } from '@/lib/valuation-engine';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId, variantId, answers } = body;

    if (!modelId) {
      return NextResponse.json({ success: false, error: 'modelId is required' }, { status: 400 });
    }

    if (!Array.isArray(answers)) {
      return NextResponse.json({ success: false, error: 'answers array is required' }, { status: 400 });
    }

    const result = calculateValuation(modelId, variantId || null, answers);

    // Record valuation session in DB
    const sessionToken = `val_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const model = db.prepare('SELECT * FROM models WHERE id = ?').get(modelId) as any;

    try {
      db.prepare(`
        INSERT INTO valuation_sessions (
          id, sessionToken, categoryId, brandId, modelId, variantId,
          basePrice, additionsTotal, deductionsTotal, estimatedPrice,
          isRejected, rejectionReason, answersSummary
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        sessionToken,
        sessionToken,
        model.categoryId,
        model.brandId,
        model.id,
        variantId || 'DEFAULT',
        result.basePrice,
        result.totalAdditions,
        result.totalDeductions,
        result.estimatedPrice,
        result.isRejected ? 1 : 0,
        result.rejectionReason,
        JSON.stringify(answers)
      );
    } catch (dbErr) {
      console.error('Session record error:', dbErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionToken,
        ...result,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
