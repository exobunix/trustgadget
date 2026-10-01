/**
 * MongoDB-backed catalog persistence for models & variants.
 *
 * On Vercel, the SQLite file lives in /tmp and is wiped on every cold start.
 * This module uses MongoDB Atlas as the *persistent* source of truth for all
 * admin edits (model creation, variant additions, price changes).
 *
 * Write path:  Admin API → MongoDB (persist) + SQLite (cache)
 * Read path:   Admin API → MongoDB (authoritative)
 * Public pages: SQLite   (fast, local – synced from MongoDB on init)
 */

import { connectToDatabase } from './mongodb';
import { MongoModel, MongoVariant, MongoBrand, MongoCategory } from './mongodb';

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

/** Thin wrapper – connects lazily and swallows errors gracefully. */
async function ensureMongo() {
  try {
    await connectToDatabase();
    return true;
  } catch (e) {
    console.warn('[mongo-catalog] MongoDB connection failed:', e);
    return false;
  }
}

// ---------------------------------------------------------------------------
// MODELS
// ---------------------------------------------------------------------------

export async function mongoGetAllModels() {
  if (!(await ensureMongo())) return null;
  try {
    const models = await MongoModel.find({}).sort({ createdAt: -1 }).lean();
    // Attach variants
    const enriched = await Promise.all(
      models.map(async (m: any) => {
        const variants = await MongoVariant.find({ modelId: m.id }).lean();
        return { ...m, variants };
      })
    );
    return enriched;
  } catch (e) {
    console.warn('[mongo-catalog] mongoGetAllModels error:', e);
    return null;
  }
}

export async function mongoGetModelById(modelId: string) {
  if (!(await ensureMongo())) return null;
  try {
    return await MongoModel.findOne({ id: modelId }).lean();
  } catch (e) {
    console.warn('[mongo-catalog] mongoGetModelById error:', e);
    return null;
  }
}

export async function mongoCreateModel(modelData: any, variants: any[]) {
  if (!(await ensureMongo())) return false;
  try {
    // Upsert model
    await MongoModel.findOneAndUpdate(
      { id: modelData.id },
      { $set: modelData },
      { upsert: true, new: true }
    );

    // Upsert variants
    if (Array.isArray(variants) && variants.length > 0) {
      const bulkOps = variants.map((v) => ({
        updateOne: {
          filter: { id: v.id },
          update: { $set: v },
          upsert: true,
        },
      }));
      await MongoVariant.bulkWrite(bulkOps);
    }
    return true;
  } catch (e) {
    console.warn('[mongo-catalog] mongoCreateModel error:', e);
    return false;
  }
}

export async function mongoUpdateModel(modelId: string, updateFields: any) {
  if (!(await ensureMongo())) return false;
  try {
    // Remove undefined fields to avoid overwriting with undefined
    const clean: any = {};
    for (const [k, v] of Object.entries(updateFields)) {
      if (v !== undefined) clean[k] = v;
    }
    clean.updatedAt = new Date();

    await MongoModel.findOneAndUpdate(
      { id: modelId },
      { $set: clean },
      { upsert: true, new: true }
    );
    return true;
  } catch (e) {
    console.warn('[mongo-catalog] mongoUpdateModel error:', e);
    return false;
  }
}

export async function mongoUpdateVariant(variantId: string, modelId: string, updateFields: any) {
  if (!(await ensureMongo())) return false;
  try {
    const clean: any = {};
    for (const [k, v] of Object.entries(updateFields)) {
      if (v !== undefined) clean[k] = v;
    }
    clean.updatedAt = new Date();

    await MongoVariant.findOneAndUpdate(
      { id: variantId, modelId },
      { $set: clean },
      { upsert: true, new: true }
    );
    return true;
  } catch (e) {
    console.warn('[mongo-catalog] mongoUpdateVariant error:', e);
    return false;
  }
}

export async function mongoUpdateAllVariantsByModel(modelId: string, updateFields: any) {
  if (!(await ensureMongo())) return false;
  try {
    const clean: any = {};
    for (const [k, v] of Object.entries(updateFields)) {
      if (v !== undefined) clean[k] = v;
    }
    clean.updatedAt = new Date();

    await MongoVariant.updateMany({ modelId }, { $set: clean });
    return true;
  } catch (e) {
    console.warn('[mongo-catalog] mongoUpdateAllVariantsByModel error:', e);
    return false;
  }
}

export async function mongoUpsertVariants(modelId: string, variants: any[], deleteOthers = false) {
  if (!(await ensureMongo())) return false;
  try {
    const retainedIds: string[] = [];

    if (Array.isArray(variants) && variants.length > 0) {
      const bulkOps = variants.map((v) => {
        retainedIds.push(v.id);
        return {
          updateOne: {
            filter: { id: v.id },
            update: { $set: { ...v, modelId, updatedAt: new Date() } },
            upsert: true,
          },
        };
      });
      await MongoVariant.bulkWrite(bulkOps);
    }

    if (deleteOthers && retainedIds.length > 0) {
      await MongoVariant.deleteMany({ modelId, id: { $nin: retainedIds } });
    }

    return true;
  } catch (e) {
    console.warn('[mongo-catalog] mongoUpsertVariants error:', e);
    return false;
  }
}

export async function mongoDeleteVariant(variantId: string) {
  if (!(await ensureMongo())) return false;
  try {
    await MongoVariant.deleteOne({ id: variantId });
    return true;
  } catch (e) {
    console.warn('[mongo-catalog] mongoDeleteVariant error:', e);
    return false;
  }
}

export async function mongoDeleteModel(modelId: string) {
  if (!(await ensureMongo())) return false;
  try {
    await MongoVariant.deleteMany({ modelId });
    await MongoModel.deleteOne({ id: modelId });
    return true;
  } catch (e) {
    console.warn('[mongo-catalog] mongoDeleteModel error:', e);
    return false;
  }
}

// ---------------------------------------------------------------------------
// SYNC: MongoDB → SQLite  (run on every cold-start so public pages see data)
// ---------------------------------------------------------------------------

export async function syncMongoToSqlite(sqliteDb: any) {
  if (!(await ensureMongo())) return;

  try {
    const mongoModels = await MongoModel.find({}).lean() as any[];
    const mongoVariants = await MongoVariant.find({}).lean() as any[];

    if (!mongoModels.length && !mongoVariants.length) {
      // MongoDB is empty — nothing to sync (first deploy or empty state)
      return;
    }

    // Build lookup
    const variantsByModel = new Map<string, any[]>();
    for (const v of mongoVariants) {
      if (!variantsByModel.has(v.modelId)) variantsByModel.set(v.modelId, []);
      variantsByModel.get(v.modelId)!.push(v);
    }

    const upsertModel = sqliteDb.prepare(`
      INSERT OR REPLACE INTO models (
        id, brandId, categoryId, name, slug, series, imageUrl, releaseYear,
        basePrice, minPrice, maxPrice, isPopular, isFeatured, isActive, specifications
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const upsertVariant = sqliteDb.prepare(`
      INSERT OR REPLACE INTO variants (
        id, modelId, name, slug, ram, storage, processor, gpu, basePrice, minPrice, maxPrice, isDefault, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = sqliteDb.transaction(() => {
      for (const m of mongoModels) {
        // Validate that the brand exists in SQLite before inserting
        const brandExists = sqliteDb.prepare('SELECT id FROM brands WHERE id = ?').get(m.brandId);
        if (!brandExists) continue; // skip models whose brand doesn't exist in SQLite

        const categoryExists = sqliteDb.prepare('SELECT id FROM categories WHERE id = ?').get(m.categoryId);
        if (!categoryExists) continue;

        upsertModel.run(
          m.id,
          m.brandId,
          m.categoryId,
          m.name,
          m.slug,
          m.series || null,
          m.imageUrl || null,
          m.releaseYear || new Date().getFullYear(),
          Number(m.basePrice),
          m.minPrice != null ? Number(m.minPrice) : Math.round(Number(m.basePrice) * 0.7),
          m.maxPrice != null ? Number(m.maxPrice) : Math.round(Number(m.basePrice) * 1.25),
          m.isPopular ? 1 : 0,
          m.isFeatured ? 1 : 0,
          m.isActive !== false ? 1 : 0,
          typeof m.specifications === 'object' ? JSON.stringify(m.specifications) : (m.specifications || '{}')
        );

        const variants = variantsByModel.get(m.id) || [];
        for (const v of variants) {
          upsertVariant.run(
            v.id,
            m.id,
            v.name,
            v.slug,
            v.ram || null,
            v.storage || null,
            v.processor || null,
            v.gpu || null,
            Number(v.basePrice),
            v.minPrice != null ? Number(v.minPrice) : Math.round(Number(v.basePrice) * 0.7),
            v.maxPrice != null ? Number(v.maxPrice) : Math.round(Number(v.basePrice) * 1.25),
            v.isDefault ? 1 : 0,
            v.isActive !== false ? 1 : 0
          );
        }
      }
    });

    transaction();
    console.log(`[mongo-catalog] Synced ${mongoModels.length} models and ${mongoVariants.length} variants from MongoDB → SQLite`);
  } catch (e) {
    console.warn('[mongo-catalog] syncMongoToSqlite error:', e);
  }
}

// ---------------------------------------------------------------------------
// INITIAL SEED: SQLite → MongoDB  (one-time: populates MongoDB from seed data)
// ---------------------------------------------------------------------------

export async function seedMongoFromSqlite(sqliteDb: any) {
  if (!(await ensureMongo())) return;

  try {
    // Check if MongoDB already has models
    const existingCount = await MongoModel.countDocuments();
    if (existingCount > 0) {
      // MongoDB already seeded – don't overwrite
      return;
    }

    const models = sqliteDb.prepare('SELECT * FROM models').all() as any[];
    const variants = sqliteDb.prepare('SELECT * FROM variants').all() as any[];
    const brands = sqliteDb.prepare('SELECT * FROM brands').all() as any[];
    const categories = sqliteDb.prepare('SELECT * FROM categories').all() as any[];

    // Seed categories
    if (categories.length > 0) {
      const catOps = categories.map((c: any) => ({
        updateOne: {
          filter: { id: c.id },
          update: {
            $set: {
              id: c.id,
              name: c.name,
              slug: c.slug,
              icon: c.icon || 'Smartphone',
              description: c.description || null,
              imageUrl: c.imageUrl || null,
              displayOrder: c.displayOrder || 0,
              isActive: c.isActive === 1 || c.isActive === true,
            },
          },
          upsert: true,
        },
      }));
      await MongoCategory.bulkWrite(catOps);
    }

    // Seed brands
    if (brands.length > 0) {
      const brandOps = brands.map((b: any) => ({
        updateOne: {
          filter: { id: b.id },
          update: {
            $set: {
              id: b.id,
              categoryId: b.categoryId,
              name: b.name,
              slug: b.slug,
              logoUrl: b.logoUrl || null,
              isPopular: b.isPopular === 1 || b.isPopular === true,
              displayOrder: b.displayOrder || 0,
              isActive: b.isActive === 1 || b.isActive === true,
            },
          },
          upsert: true,
        },
      }));
      await MongoBrand.bulkWrite(brandOps);
    }

    // Seed models
    if (models.length > 0) {
      const modelOps = models.map((m: any) => ({
        updateOne: {
          filter: { id: m.id },
          update: {
            $set: {
              id: m.id,
              brandId: m.brandId,
              categoryId: m.categoryId,
              name: m.name,
              slug: m.slug,
              series: m.series || null,
              imageUrl: m.imageUrl || null,
              releaseYear: m.releaseYear || 2024,
              basePrice: Number(m.basePrice),
              minPrice: m.minPrice != null ? Number(m.minPrice) : Math.round(Number(m.basePrice) * 0.7),
              maxPrice: m.maxPrice != null ? Number(m.maxPrice) : Math.round(Number(m.basePrice) * 1.25),
              isPopular: m.isPopular === 1 || m.isPopular === true,
              isFeatured: m.isFeatured === 1 || m.isFeatured === true,
              isActive: m.isActive === 1 || m.isActive === true,
              specifications: m.specifications ? (typeof m.specifications === 'string' ? JSON.parse(m.specifications) : m.specifications) : {},
            },
          },
          upsert: true,
        },
      }));
      await MongoModel.bulkWrite(modelOps);
    }

    // Seed variants
    if (variants.length > 0) {
      const varOps = variants.map((v: any) => ({
        updateOne: {
          filter: { id: v.id },
          update: {
            $set: {
              id: v.id,
              modelId: v.modelId,
              name: v.name,
              slug: v.slug,
              ram: v.ram || null,
              storage: v.storage || null,
              processor: v.processor || null,
              gpu: v.gpu || null,
              basePrice: Number(v.basePrice),
              minPrice: v.minPrice != null ? Number(v.minPrice) : Math.round(Number(v.basePrice) * 0.7),
              maxPrice: v.maxPrice != null ? Number(v.maxPrice) : Math.round(Number(v.basePrice) * 1.25),
              isDefault: v.isDefault === 1 || v.isDefault === true,
              isActive: v.isActive === 1 || v.isActive === true,
            },
          },
          upsert: true,
        },
      }));
      await MongoVariant.bulkWrite(varOps);
    }

    console.log(`[mongo-catalog] Initial seed complete: ${models.length} models, ${variants.length} variants → MongoDB`);
  } catch (e) {
    console.warn('[mongo-catalog] seedMongoFromSqlite error:', e);
  }
}
