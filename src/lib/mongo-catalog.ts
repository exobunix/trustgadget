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
    const [models, variants] = await Promise.all([
      MongoModel.find({}).sort({ releaseYear: -1, basePrice: -1, createdAt: -1 }).lean(),
      MongoVariant.find({}).lean(),
    ]);

    const variantsByModel = new Map<string, any[]>();
    for (const v of variants) {
      if (!variantsByModel.has(v.modelId)) variantsByModel.set(v.modelId, []);
      variantsByModel.get(v.modelId)!.push(v);
    }

    return models.map((m: any) => ({
      ...m,
      variants: variantsByModel.get(m.id) || [],
    }));
  } catch (e) {
    console.warn('[mongo-catalog] mongoGetAllModels error:', e);
    return null;
  }
}

export async function mongoGetModelById(modelId: string) {
  if (!(await ensureMongo())) return null;
  try {
    const model = await MongoModel.findOne({ id: modelId }).lean();
    if (!model) return null;
    const variants = await MongoVariant.find({ modelId }).lean();
    return { ...model, variants };
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
// SYNC: MongoDB → SQLite  (run on cold-start so public pages have latest data)
// ---------------------------------------------------------------------------

export async function syncMongoToSqlite(sqliteDb: any) {
  if (!(await ensureMongo())) return;

  try {
    const [mongoCategories, mongoBrands, mongoModels, mongoVariants] = await Promise.all([
      MongoCategory.find({}).lean() as Promise<any[]>,
      MongoBrand.find({}).lean() as Promise<any[]>,
      MongoModel.find({}).lean() as Promise<any[]>,
      MongoVariant.find({}).lean() as Promise<any[]>,
    ]);

    if (!mongoModels.length && !mongoVariants.length) {
      return;
    }

    const upsertCategory = sqliteDb.prepare(`
      INSERT OR REPLACE INTO categories (id, name, slug, icon, description, imageUrl, displayOrder, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const upsertBrand = sqliteDb.prepare(`
      INSERT OR REPLACE INTO brands (id, categoryId, name, slug, logoUrl, isPopular, displayOrder, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

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

    // Build lookup
    const variantsByModel = new Map<string, any[]>();
    for (const v of mongoVariants) {
      if (!variantsByModel.has(v.modelId)) variantsByModel.set(v.modelId, []);
      variantsByModel.get(v.modelId)!.push(v);
    }

    const transaction = sqliteDb.transaction(() => {
      // 1. Sync categories first
      for (const c of mongoCategories) {
        upsertCategory.run(
          c.id,
          c.name,
          c.slug,
          c.icon || 'Smartphone',
          c.description || null,
          c.imageUrl || null,
          c.displayOrder || 0,
          c.isActive !== false ? 1 : 0
        );
      }

      // 2. Sync brands next
      for (const b of mongoBrands) {
        upsertBrand.run(
          b.id,
          b.categoryId,
          b.name,
          b.slug,
          b.logoUrl || null,
          b.isPopular ? 1 : 0,
          b.displayOrder || 0,
          b.isActive !== false ? 1 : 0
        );
      }

      // 3. Sync models and variants
      for (const m of mongoModels) {
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
// SEED: SQLite → MongoDB (uses $setOnInsert so existing/edited data is NEVER overwritten)
// ---------------------------------------------------------------------------

export async function seedMongoFromSqlite(sqliteDb: any) {
  if (!(await ensureMongo())) return;

  try {
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
            $setOnInsert: {
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
            $setOnInsert: {
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

    // Seed models with $setOnInsert: NEVER overwrites models that already exist or were edited!
    if (models.length > 0) {
      const modelOps = models.map((m: any) => ({
        updateOne: {
          filter: { id: m.id },
          update: {
            $setOnInsert: {
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

    // Seed variants with $setOnInsert: NEVER overwrites variants that already exist or were edited!
    if (variants.length > 0) {
      const varOps = variants.map((v: any) => ({
        updateOne: {
          filter: { id: v.id },
          update: {
            $setOnInsert: {
              id: v.id,
              modelId: v.modelId,
              name: v.name,
              slug: v.slug,
              ram: v.ram || null,
              storage: v.storage || null,
              processor: v.processor || null,
              gpu: v.gpu || null,
              screenSize: v.screenSize || null,
              color: v.color || null,
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

    console.log(`[mongo-catalog] Seed check complete (checked ${models.length} models, ${variants.length} variants)`);
  } catch (e) {
    console.warn('[mongo-catalog] seedMongoFromSqlite error:', e);
  }
}
