import { NextRequest, NextResponse } from 'next/server';
import { db, dbHelpers } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const ruleType = searchParams.get('ruleType');

    let query = 'SELECT * FROM pricing_rules';
    const params: any[] = [];
    const conditions: string[] = [];

    if (categoryId) {
      conditions.push('categoryId = ?');
      params.push(categoryId);
    }
    if (ruleType) {
      conditions.push('ruleType = ?');
      params.push(ruleType);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY createdAt DESC';
    const rules = db.prepare(query).all(...params);

    return NextResponse.json({ success: true, data: rules });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      categoryId,
      brandId,
      modelId,
      variantId,
      questionCode,
      answerCode,
      ruleType,
      adjustmentType,
      adjustmentValue,
      priorityLevel,
      maxCap,
      minCap,
      adminName,
    } = body;

    if (!name || adjustmentValue === undefined) {
      return NextResponse.json({ success: false, error: 'Rule name and adjustment value are required' }, { status: 400 });
    }

    const id = `rule_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    db.prepare(`
      INSERT INTO pricing_rules (
        id, name, categoryId, brandId, modelId, variantId,
        questionCode, answerCode, ruleType, adjustmentType,
        adjustmentValue, priorityLevel, maxCap, minCap, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      id,
      name,
      categoryId || null,
      brandId || null,
      modelId || null,
      variantId || null,
      questionCode || null,
      answerCode || null,
      ruleType || 'DEDUCTION',
      adjustmentType || 'FIXED',
      Number(adjustmentValue),
      priorityLevel || 'GLOBAL',
      maxCap ? Number(maxCap) : null,
      minCap ? Number(minCap) : null
    );

    // Audit log
    dbHelpers.createAuditLog({
      adminName: adminName || 'Admin User',
      action: 'CREATE_RULE',
      entityType: 'PricingRule',
      entityId: id,
      details: `Created ${ruleType} rule "${name}" (${adjustmentType} ${adjustmentValue}) with priority ${priorityLevel}`,
    });

    return NextResponse.json({ success: true, data: { id, name }, message: 'Pricing rule created successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Rule ID is required' }, { status: 400 });
    }

    db.prepare('DELETE FROM pricing_rules WHERE id = ?').run(id);

    dbHelpers.createAuditLog({
      adminName: 'Admin User',
      action: 'DELETE_RULE',
      entityType: 'PricingRule',
      entityId: id,
      details: `Deleted pricing rule ID ${id}`,
    });

    return NextResponse.json({ success: true, message: 'Rule deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
