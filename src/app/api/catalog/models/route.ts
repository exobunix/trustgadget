import { NextRequest, NextResponse } from 'next/server';
import { db, dbHelpers } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    const brandSlug = searchParams.get('brandSlug');
    const categoryId = searchParams.get('categoryId');
    const popularOnly = searchParams.get('popular') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (popularOnly) {
      const models = dbHelpers.getPopularModels(limit);
      return NextResponse.json({ success: true, data: models });
    }

    let resolvedBrandId = brandId;
    if (!resolvedBrandId && brandSlug) {
      const brand = db.prepare('SELECT id FROM brands WHERE slug = ?').get(brandSlug) as any;
      if (brand) resolvedBrandId = brand.id;
    }

    if (resolvedBrandId) {
      const models = dbHelpers.getModelsByBrand(resolvedBrandId);
      return NextResponse.json({ success: true, data: models });
    }

    if (categoryId) {
      const models = db.prepare(`
        SELECT m.*, b.name as brandName, b.slug as brandSlug 
        FROM models m
        JOIN brands b ON m.brandId = b.id
        WHERE m.categoryId = ? AND m.isActive = 1
        ORDER BY m.isPopular DESC, m.basePrice DESC
        LIMIT ?
      `).all(categoryId, limit);
      return NextResponse.json({ success: true, data: models });
    }

    const allModels = db.prepare(`
      SELECT m.*, b.name as brandName, b.slug as brandSlug, c.name as categoryName
      FROM models m
      JOIN brands b ON m.brandId = b.id
      JOIN categories c ON m.categoryId = c.id
      WHERE m.isActive = 1
      ORDER BY m.isPopular DESC, m.basePrice DESC
      LIMIT ?
    `).all(limit);

    return NextResponse.json({ success: true, data: allModels });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
