import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';

export async function GET() {
  try {
    const categories = dbHelpers.getCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, icon, description, imageUrl, displayOrder } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const id = `cat_${Date.now()}`;
    const cleanSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    dbHelpers.createCategory({
      id,
      name,
      slug: cleanSlug,
      icon: icon || 'Smartphone',
      description: description || '',
      imageUrl: imageUrl || '',
      displayOrder: Number(displayOrder) || 10,
    });

    return NextResponse.json({ success: true, message: 'Category created' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, slug, icon, description, imageUrl, displayOrder, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID is required' }, { status: 400 });
    }

    dbHelpers.updateCategory(id, {
      name,
      slug,
      icon,
      description,
      imageUrl,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : undefined,
      isActive: isActive !== undefined ? (isActive ? 1 : 0) : undefined,
    });

    return NextResponse.json({ success: true, message: 'Category updated' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID is required' }, { status: 400 });
    }

    dbHelpers.deleteCategory(id);
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
