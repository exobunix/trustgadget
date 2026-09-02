import { NextRequest, NextResponse } from 'next/server';
import { db, dbHelpers } from '@/lib/db';

export async function GET() {
  try {
    const brands = db.prepare(`
      SELECT b.*, c.name as categoryName 
      FROM brands b
      JOIN categories c ON b.categoryId = c.id
      ORDER BY c.displayOrder ASC, b.displayOrder ASC, b.name ASC
    `).all();
    return NextResponse.json({ success: true, data: brands });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryId, name, slug, logoUrl, isPopular, displayOrder, adminName } = body;

    if (!categoryId || !name || !slug) {
      return NextResponse.json({ success: false, error: 'Category, name and slug are required' }, { status: 400 });
    }

    const id = `b_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    db.prepare(`
      INSERT INTO brands (id, categoryId, name, slug, logoUrl, isPopular, displayOrder, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(id, categoryId, name, slug.toLowerCase(), logoUrl || null, isPopular ? 1 : 0, displayOrder || 0);

    dbHelpers.createAuditLog({
      adminName: adminName || 'Admin User',
      action: 'CREATE_BRAND',
      entityType: 'Brand',
      entityId: id,
      details: `Created new brand "${name}" under category ID ${categoryId}`,
    });

    return NextResponse.json({ success: true, message: 'Brand created successfully', data: { id, name } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, categoryId, name, slug, logoUrl, isPopular, displayOrder, adminName } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Brand ID is required' }, { status: 400 });
    }

    db.prepare(`
      UPDATE brands 
      SET categoryId = COALESCE(?, categoryId),
          name = COALESCE(?, name),
          slug = COALESCE(?, slug),
          logoUrl = COALESCE(?, logoUrl),
          isPopular = COALESCE(?, isPopular),
          displayOrder = COALESCE(?, displayOrder),
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      categoryId || null,
      name || null,
      slug ? slug.toLowerCase() : null,
      logoUrl || null,
      isPopular !== undefined ? (isPopular ? 1 : 0) : null,
      displayOrder !== undefined ? displayOrder : null,
      id
    );

    dbHelpers.createAuditLog({
      adminName: adminName || 'Admin User',
      action: 'UPDATE_BRAND',
      entityType: 'Brand',
      entityId: id,
      details: `Updated brand "${name || id}"`,
    });

    return NextResponse.json({ success: true, message: 'Brand updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Brand ID is required' }, { status: 400 });
    }

    db.prepare('DELETE FROM brands WHERE id = ?').run(id);

    return NextResponse.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
