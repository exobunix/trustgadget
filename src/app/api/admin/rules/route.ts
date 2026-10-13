import { NextRequest, NextResponse } from 'next/server';
import { db, dbHelpers } from '@/lib/db';
import {
  mongoGetAllPricingRules,
  mongoUpsertPricingRule,
  mongoDeletePricingRule,
} from '@/lib/mongo-catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const ruleType = searchParams.get('ruleType');

    // 1. Try authoritative MongoDB
    const filter: any = {};
    if (categoryId) filter.categoryId = categoryId;
    if (ruleType) filter.ruleType = ruleType;

    const mongoRules = await mongoGetAllPricingRules(filter);
    if (mongoRules && mongoRules.length > 0) {
      return NextResponse.json(
        { success: true, data: mongoRules },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    // 2. Fallback to SQLite
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

    return NextResponse.json(
      { success: true, data: rules },
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
      name,
      categoryId,
      targetCategory,
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

    // 1. Insert into SQLite
    db.prepare(`
      INSERT INTO pricing_rules (
        id, name, categoryId, targetCategory, brandId, modelId, variantId,
        questionCode, answerCode, ruleType, adjustmentType,
        adjustmentValue, priorityLevel, maxCap, minCap, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      id,
      name,
      categoryId || null,
      targetCategory || 'ALL',
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

    // 2. Persist to MongoDB
    await mongoUpsertPricingRule({
      id,
      name,
      categoryId: categoryId || null,
      targetCategory: targetCategory || 'ALL',
      brandId: brandId || null,
      modelId: modelId || null,
      variantId: variantId || null,
      questionCode: questionCode || null,
      answerCode: answerCode || null,
      ruleType: ruleType || 'DEDUCTION',
      adjustmentType: adjustmentType || 'FIXED',
      adjustmentValue: Number(adjustmentValue),
      priorityLevel: priorityLevel || 'GLOBAL',
      maxCap: maxCap ? Number(maxCap) : null,
      minCap: minCap ? Number(minCap) : null,
      isActive: true,
    });

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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      categoryId,
      targetCategory,
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
      isActive,
      adminName,
    } = body;

    if (!id || !name) {
      return NextResponse.json({ success: false, error: 'Rule ID and name are required' }, { status: 400 });
    }

    // 1. Update SQLite
    db.prepare(`
      UPDATE pricing_rules
      SET name = ?,
          categoryId = ?,
          targetCategory = ?,
          brandId = ?,
          modelId = ?,
          variantId = ?,
          questionCode = ?,
          answerCode = ?,
          ruleType = ?,
          adjustmentType = ?,
          adjustmentValue = ?,
          priorityLevel = ?,
          maxCap = ?,
          minCap = ?,
          isActive = COALESCE(?, isActive),
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name,
      categoryId || null,
      targetCategory || 'ALL',
      brandId || null,
      modelId || null,
      variantId || null,
      questionCode || null,
      answerCode || null,
      ruleType || 'DEDUCTION',
      adjustmentType || 'FIXED',
      Number(adjustmentValue) || 0,
      priorityLevel || 'GLOBAL',
      maxCap ? Number(maxCap) : null,
      minCap ? Number(minCap) : null,
      isActive !== undefined ? (isActive ? 1 : 0) : null,
      id
    );

    // 2. Persist to MongoDB
    await mongoUpsertPricingRule({
      id,
      name,
      categoryId: categoryId || null,
      targetCategory: targetCategory || 'ALL',
      brandId: brandId || null,
      modelId: modelId || null,
      variantId: variantId || null,
      questionCode: questionCode || null,
      answerCode: answerCode || null,
      ruleType: ruleType || 'DEDUCTION',
      adjustmentType: adjustmentType || 'FIXED',
      adjustmentValue: Number(adjustmentValue) || 0,
      priorityLevel: priorityLevel || 'GLOBAL',
      maxCap: maxCap ? Number(maxCap) : null,
      minCap: minCap ? Number(minCap) : null,
      isActive: isActive !== false,
    });

    dbHelpers.createAuditLog({
      adminName: adminName || 'Admin User',
      action: 'UPDATE_RULE',
      entityType: 'PricingRule',
      entityId: id,
      details: `Updated pricing rule "${name}"`,
    });

    return NextResponse.json({ success: true, message: 'Pricing rule updated successfully' });
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

    // 1. Delete from SQLite
    db.prepare('DELETE FROM pricing_rules WHERE id = ?').run(id);

    // 2. Delete from MongoDB
    await mongoDeletePricingRule(id);

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
