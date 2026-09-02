import { NextRequest, NextResponse } from 'next/server';
import { db, dbHelpers } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const model = db.prepare(`
      SELECT m.*, b.name as brandName, b.slug as brandSlug, b.logoUrl as brandLogoUrl,
             c.name as categoryName, c.slug as categorySlug
      FROM models m
      JOIN brands b ON m.brandId = b.id
      JOIN categories c ON m.categoryId = c.id
      WHERE m.id = ? OR m.slug = ?
    `).get(id, id) as any;

    if (!model) {
      return NextResponse.json({ success: false, error: 'Model not found' }, { status: 404 });
    }

    const variants = dbHelpers.getVariantsByModel(model.id);

    return NextResponse.json({
      success: true,
      data: {
        ...model,
        specifications: model.specifications ? JSON.parse(model.specifications) : {},
        variants,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
