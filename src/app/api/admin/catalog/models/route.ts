import { NextRequest, NextResponse } from 'next/server';
import { db, dbHelpers, flushDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    return NextResponse.json(
      { success: true, data: enriched },
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

    if (!name || !basePrice) {
      return NextResponse.json({ success: false, error: 'Model Name and Base Price are required' }, { status: 400 });
    }

    // Resolve and validate brandId
    let finalBrandId = brandId;
    let bRow = finalBrandId ? db.prepare('SELECT id, categoryId FROM brands WHERE id = ?').get(finalBrandId) as any : null;
    if (!bRow && finalBrandId) {
      bRow = db.prepare('SELECT id, categoryId FROM brands WHERE slug = ? OR LOWER(name) = LOWER(?)').get(finalBrandId, finalBrandId) as any;
      if (bRow) finalBrandId = bRow.id;
    }
    if (!bRow) {
      const defaultB = db.prepare('SELECT id, categoryId FROM brands LIMIT 1').get() as any;
      finalBrandId = defaultB?.id || 'b_phone_apple';
      bRow = defaultB;
    }

    // Resolve and validate categoryId
    let finalCategoryId = categoryId;
    let cRow = finalCategoryId ? db.prepare('SELECT id FROM categories WHERE id = ?').get(finalCategoryId) as any : null;
    if (!cRow && finalCategoryId) {
      cRow = db.prepare('SELECT id FROM categories WHERE slug = ? OR LOWER(name) = LOWER(?)').get(finalCategoryId, finalCategoryId) as any;
      if (cRow) finalCategoryId = cRow.id;
    }
    if (!cRow) {
      finalCategoryId = bRow?.categoryId || 'cat_smartphone';
    }

    // Check if duplicate model name already exists under this brand
    const existingByName = db.prepare('SELECT id, name FROM models WHERE brandId = ? AND LOWER(TRIM(name)) = LOWER(TRIM(?))').get(finalBrandId, name) as any;
    if (existingByName) {
      return NextResponse.json({
        success: false,
        error: `A model named "${name}" already exists for this brand. Please use Quick Edit to adjust pricing or variants on the existing model instead of creating a duplicate.`,
        existingId: existingByName.id,
      }, { status: 409 });
    }

    const modelId = `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    let modelSlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!modelSlug) modelSlug = `model-${Date.now()}`;

    // Ensure modelSlug is unique within brand
    let checkModel = db.prepare('SELECT id FROM models WHERE brandId = ? AND slug = ?').get(finalBrandId, modelSlug);
    let modelSlugCounter = 2;
    const baseModelSlug = modelSlug;
    while (checkModel) {
      modelSlug = `${baseModelSlug}-${modelSlugCounter}`;
      modelSlugCounter++;
      checkModel = db.prepare('SELECT id FROM models WHERE brandId = ? AND slug = ?').get(finalBrandId, modelSlug);
    }

    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO models (
          id, brandId, categoryId, name, slug, series, imageUrl, releaseYear,
          basePrice, minPrice, maxPrice, isPopular, isFeatured, isActive, specifications
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
      `).run(
        modelId,
        finalBrandId,
        finalCategoryId,
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
          INSERT OR REPLACE INTO variants (id, modelId, name, slug, ram, storage, processor, gpu, basePrice, minPrice, maxPrice, isDefault, isActive)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `);

        const seenSlugs = new Set<string>();

        variants.forEach((v: any, idx: number) => {
          const varId = v.id && !String(v.id).startsWith('temp_') && !String(v.id).endsWith('_def')
            ? v.id
            : `v_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`;

          const variantName = v.name || `${v.ram ? v.ram + ' / ' : ''}${v.storage || 'Standard'}`.trim();
          let rawSlug = (v.slug || variantName || `var-${idx + 1}`)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || `var-${idx + 1}`;

          let uniqueSlug = rawSlug;
          let counter = 2;
          while (seenSlugs.has(uniqueSlug)) {
            uniqueSlug = `${rawSlug}-${counter}`;
            counter++;
          }
          seenSlugs.add(uniqueSlug);

          const varPrice = Number(v.basePrice) || Number(basePrice);

          insertVar.run(
            varId,
            modelId,
            variantName,
            uniqueSlug,
            v.ram || null,
            v.storage || null,
            v.processor || null,
            v.gpu || null,
            varPrice,
            Math.round(varPrice * 0.7),
            Math.round(varPrice * 1.25),
            idx === 0 ? 1 : 0
          );
        });
      } else {
        // Create default variant
        db.prepare(`
          INSERT OR REPLACE INTO variants (id, modelId, name, slug, basePrice, minPrice, maxPrice, isDefault, isActive)
          VALUES (?, ?, 'Standard Variant', 'standard', ?, ?, ?, 1, 1)
        `).run(
          `v_${Date.now()}_default`,
          modelId,
          Number(basePrice),
          Math.round(Number(basePrice) * 0.7),
          Math.round(Number(basePrice) * 1.25)
        );
      }
    });

    transaction();
    flushDb();

    try {
      revalidatePath('/admin/catalog/models');
      revalidatePath('/sell');
      revalidatePath('/');
    } catch (e) {}

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
    const {
      id,
      brandId,
      categoryId,
      name,
      slug,
      series,
      imageUrl,
      releaseYear,
      basePrice,
      isPopular,
      isFeatured,
      isActive,
      variants,
      variantId,
      variantPrice,
      updateAllVariants,
      replaceVariants,
      adminName,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Model ID is required' }, { status: 400 });
    }

    const parsedBasePrice = basePrice !== undefined && basePrice !== null && !isNaN(Number(basePrice))
      ? Number(basePrice)
      : null;

    // Verify existing model
    const existingModel = db.prepare('SELECT * FROM models WHERE id = ?').get(id) as any;

    // Resolve and validate brandId to eliminate FK constraint errors
    let finalBrandId = brandId || existingModel?.brandId || null;
    let bRow: any = null;
    if (finalBrandId) {
      bRow = db.prepare('SELECT id, categoryId FROM brands WHERE id = ?').get(finalBrandId) as any;
      if (!bRow) {
        bRow = db.prepare('SELECT id, categoryId FROM brands WHERE slug = ? OR LOWER(name) = LOWER(?)').get(finalBrandId, finalBrandId) as any;
        if (bRow) {
          finalBrandId = bRow.id;
        } else if (existingModel?.brandId) {
          finalBrandId = existingModel.brandId;
        } else {
          const firstB = db.prepare('SELECT id, categoryId FROM brands LIMIT 1').get() as any;
          finalBrandId = firstB?.id || 'b_phone_apple';
          bRow = firstB;
        }
      }
    } else {
      const firstB = db.prepare('SELECT id, categoryId FROM brands LIMIT 1').get() as any;
      finalBrandId = firstB?.id || 'b_phone_apple';
      bRow = firstB;
    }

    // Resolve and validate categoryId to eliminate FK constraint errors
    let finalCategoryId = categoryId || existingModel?.categoryId || bRow?.categoryId || null;
    if (finalCategoryId) {
      const cRow = db.prepare('SELECT id FROM categories WHERE id = ?').get(finalCategoryId) as any;
      if (!cRow) {
        const cBySlug = db.prepare('SELECT id FROM categories WHERE slug = ? OR LOWER(name) = LOWER(?)').get(finalCategoryId, finalCategoryId) as any;
        if (cBySlug) {
          finalCategoryId = cBySlug.id;
        } else if (bRow?.categoryId) {
          finalCategoryId = bRow.categoryId;
        } else if (existingModel?.categoryId) {
          finalCategoryId = existingModel.categoryId;
        } else {
          finalCategoryId = 'cat_smartphone';
        }
      }
    } else {
      finalCategoryId = bRow?.categoryId || existingModel?.categoryId || 'cat_smartphone';
    }

    const modelSlug = slug
      ? slug.toLowerCase()
      : (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : (existingModel?.slug || id));

    const transaction = db.transaction(() => {
      if (!existingModel) {
        // Upsert model if it doesn't exist yet (e.g. across serverless cold starts) so variants FK NEVER fails
        db.prepare(`
          INSERT INTO models (
            id, brandId, categoryId, name, slug, series, imageUrl, releaseYear,
            basePrice, minPrice, maxPrice, isPopular, isFeatured, isActive, specifications
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '{}')
        `).run(
          id,
          finalBrandId,
          finalCategoryId,
          name || 'Device Model',
          modelSlug,
          series || null,
          imageUrl || null,
          releaseYear ? Number(releaseYear) : new Date().getFullYear(),
          parsedBasePrice || 15000,
          parsedBasePrice ? Math.round(parsedBasePrice * 0.7) : 10500,
          parsedBasePrice ? Math.round(parsedBasePrice * 1.25) : 18750,
          isPopular ? 1 : 0,
          isFeatured ? 1 : 0,
          isActive !== undefined ? (isActive ? 1 : 0) : 1
        );
      } else {
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
              minPrice = COALESCE(?, minPrice),
              maxPrice = COALESCE(?, maxPrice),
              isPopular = COALESCE(?, isPopular),
              isFeatured = COALESCE(?, isFeatured),
              isActive = COALESCE(?, isActive),
              updatedAt = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(
          finalBrandId,
          finalCategoryId,
          name || null,
          modelSlug || null,
          series || null,
          imageUrl || null,
          releaseYear ? Number(releaseYear) : null,
          parsedBasePrice,
          parsedBasePrice ? Math.round(parsedBasePrice * 0.7) : null,
          parsedBasePrice ? Math.round(parsedBasePrice * 1.25) : null,
          isPopular !== undefined ? (isPopular ? 1 : 0) : null,
          isFeatured !== undefined ? (isFeatured ? 1 : 0) : null,
          isActive !== undefined ? (isActive ? 1 : 0) : null,
          id
        );
      }

      // 1. Direct single variant quick price update
      if (variantId && variantPrice !== undefined) {
        const vNum = Number(variantPrice);
        if (!isNaN(vNum) && vNum > 0) {
          db.prepare(`
            UPDATE variants
            SET basePrice = ?, minPrice = ?, maxPrice = ?, updatedAt = CURRENT_TIMESTAMP
            WHERE id = ? AND modelId = ?
          `).run(vNum, Math.round(vNum * 0.7), Math.round(vNum * 1.25), variantId, id);
        }
      }

      // 2. Sync base price to all variants
      if (updateAllVariants && parsedBasePrice) {
        db.prepare(`
          UPDATE variants
          SET basePrice = ?, minPrice = ?, maxPrice = ?, updatedAt = CURRENT_TIMESTAMP
          WHERE modelId = ?
        `).run(parsedBasePrice, Math.round(parsedBasePrice * 0.7), Math.round(parsedBasePrice * 1.25), id);
      }

      // 3. If variants provided, update, insert, or optionally delete variants
      if (Array.isArray(variants) && variants.length > 0) {
        const retainedIds: string[] = [];
        const seenSlugs = new Set<string>();

        variants.forEach((v: any, idx: number) => {
          const isRealId = v.id && !String(v.id).startsWith('temp_') && !String(v.id).endsWith('_def');
          const variantName = v.name || `${v.ram ? v.ram + ' / ' : ''}${v.storage || 'Standard'}`.trim();
          const varPrice = v.basePrice !== undefined && v.basePrice !== null && !isNaN(Number(v.basePrice)) && Number(v.basePrice) > 0
            ? Number(v.basePrice)
            : (parsedBasePrice || 0);

          let rawSlug = (v.slug || variantName || `var-${idx + 1}`)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || `var-${idx + 1}`;
          let uniqueSlug = rawSlug;
          let counter = 2;
          while (seenSlugs.has(uniqueSlug)) {
            uniqueSlug = `${rawSlug}-${counter}`;
            counter++;
          }
          seenSlugs.add(uniqueSlug);

          let updated = false;
          if (isRealId) {
            const updateResult = db.prepare(`
              UPDATE variants
              SET name = COALESCE(?, name),
                  slug = ?,
                  storage = COALESCE(?, storage),
                  ram = COALESCE(?, ram),
                  basePrice = ?,
                  minPrice = ?,
                  maxPrice = ?,
                  updatedAt = CURRENT_TIMESTAMP
              WHERE id = ? AND modelId = ?
            `).run(
              variantName,
              uniqueSlug,
              v.storage || null,
              v.ram || null,
              varPrice,
              Math.round(varPrice * 0.7),
              Math.round(varPrice * 1.25),
              v.id,
              id
            );
            if (updateResult.changes > 0) {
              retainedIds.push(v.id);
              updated = true;
            }
          }

          if (!updated) {
            const varId = (isRealId && v.id) ? v.id : `v_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`;
            retainedIds.push(varId);
            db.prepare(`
              INSERT OR REPLACE INTO variants (id, modelId, name, slug, ram, storage, basePrice, minPrice, maxPrice, isDefault, isActive)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            `).run(
              varId,
              id,
              variantName,
              uniqueSlug,
              v.ram || null,
              v.storage || null,
              varPrice,
              Math.round(varPrice * 0.7),
              Math.round(varPrice * 1.25),
              idx === 0 ? 1 : 0
            );
          }
        });

        // Ensure models.basePrice matches the lowest or default variant if variants were updated
        const baseVariant = (db.prepare('SELECT basePrice FROM variants WHERE modelId = ? AND isDefault = 1 LIMIT 1').get(id) as any)
          || (db.prepare('SELECT MIN(basePrice) as basePrice FROM variants WHERE modelId = ?').get(id) as any);
        if (baseVariant && baseVariant.basePrice > 0) {
          const bp = Number(baseVariant.basePrice);
          db.prepare(`
            UPDATE models
            SET basePrice = ?, minPrice = ?, maxPrice = ?, updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(bp, Math.round(bp * 0.7), Math.round(bp * 1.25), id);
        }

        // Only prune unmentioned variants when explicitly specified
        if (replaceVariants && retainedIds.length > 0) {
          const placeholders = retainedIds.map(() => '?').join(',');
          try {
            db.prepare(`DELETE FROM variants WHERE modelId = ? AND id NOT IN (${placeholders})`).run(id, ...retainedIds);
          } catch (e) {
            // Ignore if foreign key reference prevents deletion
          }
        }
      } else if (parsedBasePrice && !variantId && !updateAllVariants) {
        // If single price update and no variants array sent, ensure default variants have matching price
        db.prepare(`
          UPDATE variants
          SET basePrice = ?,
              minPrice = ?,
              maxPrice = ?,
              updatedAt = CURRENT_TIMESTAMP
          WHERE modelId = ? AND isDefault = 1
        `).run(parsedBasePrice, Math.round(parsedBasePrice * 0.7), Math.round(parsedBasePrice * 1.25), id);
      }
    });

    transaction();

    flushDb();

    try {
      revalidatePath('/admin/catalog/models');
      revalidatePath('/sell');
      revalidatePath('/sell/[category]', 'page');
      revalidatePath('/sell/[category]/[brand]', 'page');
      revalidatePath('/sell/[category]/[brand]/[model]', 'page');
      revalidatePath('/');
    } catch (e) {}

    dbHelpers.createAuditLog({
      adminName: adminName || 'Admin User',
      action: 'UPDATE_MODEL',
      entityType: 'Model',
      entityId: id,
      details: `Updated model details for "${name || id}" with Base Price ₹${Number(parsedBasePrice || 0).toLocaleString('en-IN')}`,
    });

    return NextResponse.json(
      { success: true, message: 'Model updated successfully' },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const variantId = searchParams.get('variantId');

    if (!id && !variantId) {
      return NextResponse.json({ success: false, error: 'Model ID or Variant ID is required' }, { status: 400 });
    }

    if (variantId) {
      // Safely record in deleted_catalog_ids so seed never resurrects it
      try {
        db.prepare('INSERT OR REPLACE INTO deleted_catalog_ids (id, type) VALUES (?, ?)').run(variantId, 'variant');
      } catch (e) {}

      db.prepare('DELETE FROM variants WHERE id = ?').run(variantId);
      flushDb();

      try {
        revalidatePath('/admin/catalog/models');
        revalidatePath('/sell');
        revalidatePath('/');
      } catch (e) {}

      return NextResponse.json({ success: true, message: 'Variant deleted successfully' });
    }

    if (id) {
      // Record model and its variants in deleted_catalog_ids so seed never resurrects them
      try {
        db.prepare('INSERT OR REPLACE INTO deleted_catalog_ids (id, type) VALUES (?, ?)').run(id, 'model');
        const vRows = db.prepare('SELECT id FROM variants WHERE modelId = ?').all(id) as { id: string }[];
        const insertDel = db.prepare('INSERT OR REPLACE INTO deleted_catalog_ids (id, type) VALUES (?, ?)');
        for (const v of vRows) {
          insertDel.run(v.id, 'variant');
        }
      } catch (e) {}

      db.prepare('DELETE FROM variants WHERE modelId = ?').run(id);
      db.prepare('DELETE FROM models WHERE id = ?').run(id);
      flushDb();

      try {
        revalidatePath('/admin/catalog/models');
        revalidatePath('/sell');
        revalidatePath('/');
      } catch (e) {}

      return NextResponse.json({ success: true, message: 'Model deleted successfully' });
    }

    return NextResponse.json({ success: false, error: 'No ID provided' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
