import { NextRequest, NextResponse } from 'next/server';
import { db, dbHelpers } from '@/lib/db';

export async function GET() {
  try {
    const models = db.prepare(`
      SELECT m.*, b.name as brandName, c.name as categoryName 
      FROM models m
      JOIN brands b ON m.brandId = b.id
      JOIN categories c ON m.categoryId = c.id
      ORDER BY m.createdAt DESC
    `).all() as any[];

    const getVariants = db.prepare('SELECT * FROM variants WHERE modelId = ?');
    const enriched = models.map(m => ({
      ...m,
      variants: getVariants.all(m.id),
      specifications: m.specifications ? JSON.parse(m.specifications) : {},
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      brandId,
      categoryId,
      name,
      slug,
      series,
      imageUrl,
      releaseYear,
      basePrice,
      minPrice,
      maxPrice,
      isPopular,
      isFeatured,
      specifications,
      variants,
      adminName,
    } = body;

    if (!brandId || !categoryId || !name || !basePrice) {
      return NextResponse.json({ success: false, error: 'Brand, Category, Model Name, and Base Price are required' }, { status: 400 });
    }

    const modelId = `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const modelSlug = slug ? slug.toLowerCase() : name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO models (
          id, brandId, categoryId, name, slug, series, imageUrl, releaseYear,
          basePrice, minPrice, maxPrice, isPopular, isFeatured, isActive, specifications
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
      `).run(
        modelId,
        brandId,
        categoryId,
        name,
        modelSlug,
        series || null,
        imageUrl || null,
        releaseYear || new Date().getFullYear(),
        Number(basePrice),
        minPrice ? Number(minPrice) : Math.round(Number(basePrice) * 0.7),
        maxPrice ? Number(maxPrice) : Math.round(Number(basePrice) * 1.25),
        isPopular ? 1 : 0,
        isFeatured ? 1 : 0,
        specifications ? JSON.stringify(specifications) : '{}'
      );

      if (Array.isArray(variants) && variants.length > 0) {
        const insertVar = db.prepare(`
          INSERT INTO variants (id, modelId, name, slug, ram, storage, processor, gpu, basePrice, isDefault, isActive)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `);

        variants.forEach((v: any, idx: number) => {
          const varId = `v_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`;
          insertVar.run(
            varId,
            modelId,
            v.name,
            v.slug ? v.slug.toLowerCase() : v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            v.ram || null,
            v.storage || null,
            v.processor || null,
            v.gpu || null,
            Number(v.basePrice) || Number(basePrice),
            idx === 0 ? 1 : 0
          );
        });
      } else {
        // Create default variant
        db.prepare(`
          INSERT INTO variants (id, modelId, name, slug, basePrice, isDefault, isActive)
          VALUES (?, ?, 'Standard Variant', 'standard', ?, 1, 1)
        `).run(`v_${Date.now()}_default`, modelId, Number(basePrice));
      }
    });

    transaction();

    dbHelpers.createAuditLog({
      adminName: adminName || 'Admin User',
      action: 'CREATE_MODEL',
      entityType: 'Model',
      entityId: modelId,
      details: `Added new device model "${name}" with Base Price ₹${Number(basePrice).toLocaleString('en-IN')}`,
    });

    return NextResponse.json({ success: true, message: 'Model created successfully', data: { id: modelId, name } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, brandId, categoryId, name, slug, series, imageUrl, releaseYear, basePrice, isPopular, variants, adminName } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Model ID is required' }, { status: 400 });
    }

    const transaction = db.transaction(() => {
      db.prepare(`
        UPDATE models
        SET brandId = COALESCE(?, brandId),
            categoryId = COALESCE(?, categoryId),
            name = COALESCE(?, name),
            slug = COALESCE(?, slug),
            series = COALESCE(?, series),
            imageUrl = COALESCE(?, imageUrl),
            releaseYear = COALESCE(?, releaseYear),
            basePrice = COALESCE(?, basePrice),
            isPopular = COALESCE(?, isPopular),
            updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        brandId || null,
        categoryId || null,
        name || null,
        slug ? slug.toLowerCase() : null,
        series || null,
        imageUrl || null,
        releaseYear ? Number(releaseYear) : null,
        basePrice ? Number(basePrice) : null,
        isPopular !== undefined ? (isPopular ? 1 : 0) : null,
        id
      );

      // If variants provided, update base prices
      if (Array.isArray(variants) && variants.length > 0) {
        variants.forEach((v: any) => {
          if (v.id) {
            db.prepare(`
              UPDATE variants
              SET name = COALESCE(?, name),
                  storage = COALESCE(?, storage),
                  ram = COALESCE(?, ram),
                  basePrice = COALESCE(?, basePrice)
              WHERE id = ?
            `).run(v.name || null, v.storage || null, v.ram || null, v.basePrice ? Number(v.basePrice) : null, v.id);
          }
        });
      }
    });

    transaction();

    dbHelpers.createAuditLog({
      adminName: adminName || 'Admin User',
      action: 'UPDATE_MODEL',
      entityType: 'Model',
      entityId: id,
      details: `Updated model details for "${name || id}"`,
    });

    return NextResponse.json({ success: true, message: 'Model updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Model ID is required' }, { status: 400 });
    }

    db.prepare('DELETE FROM variants WHERE modelId = ?').run(id);
    db.prepare('DELETE FROM models WHERE id = ?').run(id);

    return NextResponse.json({ success: true, message: 'Model deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
