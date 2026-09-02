import { NextRequest, NextResponse } from 'next/server';
import { db, dbHelpers } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const categorySlug = searchParams.get('categorySlug');
    const popularOnly = searchParams.get('popular') === 'true';

    let resolvedCategoryId = categoryId;
    if (!resolvedCategoryId && categorySlug) {
      const cat = dbHelpers.getCategoryBySlug(categorySlug) as any;
      if (cat) resolvedCategoryId = cat.id;
    }

    if (popularOnly) {
      const brands = dbHelpers.getPopularBrands(resolvedCategoryId || undefined);
      return NextResponse.json({ success: true, data: brands });
    }

    if (resolvedCategoryId) {
      const brands = dbHelpers.getBrandsByCategory(resolvedCategoryId);
      return NextResponse.json({ success: true, data: brands });
    }

    const allBrands = db.prepare('SELECT * FROM brands WHERE isActive = 1 ORDER BY displayOrder ASC, name ASC').all();
    return NextResponse.json({ success: true, data: allBrands });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
