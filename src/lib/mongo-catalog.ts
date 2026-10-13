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
import {
  MongoModel,
  MongoVariant,
  MongoBrand,
  MongoCategory,
  MongoQuestion,
  MongoPricingRule,
} from './mongodb';

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

// ---------------------------------------------------------------------------
// QUESTIONS & ANSWERS (Persistent MongoDB Source of Truth)
// ---------------------------------------------------------------------------

export async function mongoGetAllQuestions() {
  if (!(await ensureMongo())) return null;
  try {
    const questions = await MongoQuestion.find({}).sort({ displayOrder: 1, createdAt: 1 }).lean();
    return questions.map((q: any) => ({
      ...q,
      targetCategory: q.targetCategory || 'ALL',
      answers: Array.isArray(q.answers) ? q.answers.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0)) : [],
    }));
  } catch (e) {
    console.warn('[mongo-catalog] mongoGetAllQuestions error:', e);
    return null;
  }
}

export async function mongoUpsertQuestion(questionData: any, answers?: any[]) {
  if (!(await ensureMongo())) return false;
  try {
    const clean: any = { ...questionData };
    clean.updatedAt = new Date();
    clean.targetCategory = clean.targetCategory || 'ALL';

    if (Array.isArray(answers)) {
      clean.answers = answers.map((a: any, idx: number) => ({
        id: a.id && !a.id.startsWith('ans_temp_') ? a.id : `ans_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        questionId: questionData.id,
        code: a.code || `OPT_${idx + 1}`,
        label: a.label || 'Choice',
        description: a.description || null,
        icon: a.icon || null,
        adjustmentType: a.adjustmentType || 'FIXED',
        adjustmentValue: Number(a.adjustmentValue) || 0,
        isRejection: Boolean(a.isRejection),
        warningMessage: a.warningMessage || null,
        displayOrder: a.displayOrder || (idx + 1),
        isActive: a.isActive !== false,
      }));
    }

    await MongoQuestion.findOneAndUpdate(
      { id: questionData.id },
      { $set: clean },
      { upsert: true, new: true }
    );
    return true;
  } catch (e) {
    console.warn('[mongo-catalog] mongoUpsertQuestion error:', e);
    return false;
  }
}

export async function mongoDeleteQuestion(questionId: string) {
  if (!(await ensureMongo())) return false;
  try {
    await MongoQuestion.deleteOne({ id: questionId });
    return true;
  } catch (e) {
    console.warn('[mongo-catalog] mongoDeleteQuestion error:', e);
    return false;
  }
}

export async function mongoUpdateAnswer(answerId: string, questionId: string, updateFields: any) {
  if (!(await ensureMongo())) return null;
  try {
    const question = await MongoQuestion.findOne({ id: questionId });
    if (!question) return null;

    let ansIndex = question.answers.findIndex((a: any) => a.id === answerId);
    if (ansIndex === -1 && answerId.startsWith('ans_temp_')) {
      const realId = `ans_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      question.answers.push({
        id: realId,
        questionId,
        code: updateFields.code || `OPT_${Date.now().toString().slice(-4)}`,
        label: updateFields.label || 'New Option',
        description: updateFields.description || null,
        icon: updateFields.icon || null,
        adjustmentType: updateFields.adjustmentType || 'FIXED',
        adjustmentValue: Number(updateFields.adjustmentValue) || 0,
        isRejection: Boolean(updateFields.isRejection),
        warningMessage: updateFields.warningMessage || null,
        displayOrder: 99,
        isActive: true,
      });
      await question.save();
      return realId;
    } else if (ansIndex !== -1) {
      const existing = question.answers[ansIndex];
      for (const [k, v] of Object.entries(updateFields)) {
        if (v !== undefined) (existing as any)[k] = v;
      }
      question.answers[ansIndex] = existing;
      await question.save();
      return answerId;
    }
    return null;
  } catch (e) {
    console.warn('[mongo-catalog] mongoUpdateAnswer error:', e);
    return null;
  }
}

export async function mongoDeleteAnswer(answerId: string) {
  if (!(await ensureMongo())) return false;
  try {
    await MongoQuestion.updateMany(
      {},
      { $pull: { answers: { id: answerId } } }
    );
    return true;
  } catch (e) {
    console.warn('[mongo-catalog] mongoDeleteAnswer error:', e);
    return false;
  }
}

export async function syncMongoQuestionsToSqlite(sqliteDb: any) {
  if (!(await ensureMongo())) return;
  try {
    const mongoQuestions = (await MongoQuestion.find({}).lean()) as any[];
    if (!mongoQuestions || mongoQuestions.length === 0) return;

    const upsertQ = sqliteDb.prepare(`
      INSERT OR REPLACE INTO questions (
        id, categoryId, targetCategory, brandId, modelId, title, subtitle,
        code, questionType, isRequired, displayOrder, isActive, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const upsertA = sqliteDb.prepare(`
      INSERT OR REPLACE INTO answers (
        id, questionId, code, label, description, icon, adjustmentType,
        adjustmentValue, isRejection, warningMessage, displayOrder, isActive, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const deleteOldA = sqliteDb.prepare('DELETE FROM answers WHERE questionId = ?');

    const tx = sqliteDb.transaction(() => {
      for (const q of mongoQuestions) {
        upsertQ.run(
          q.id,
          q.categoryId || null,
          q.targetCategory || 'ALL',
          q.brandId || null,
          q.modelId || null,
          q.title,
          q.subtitle || null,
          q.code,
          q.questionType || 'SINGLE_CHOICE',
          q.isRequired !== false ? 1 : 0,
          q.displayOrder || 0,
          q.isActive !== false ? 1 : 0
        );

        if (Array.isArray(q.answers) && q.answers.length > 0) {
          deleteOldA.run(q.id);
          for (let i = 0; i < q.answers.length; i++) {
            const a = q.answers[i];
            upsertA.run(
              a.id,
              q.id,
              a.code,
              a.label,
              a.description || null,
              a.icon || null,
              a.adjustmentType || 'FIXED',
              Number(a.adjustmentValue) || 0,
              a.isRejection ? 1 : 0,
              a.warningMessage || null,
              a.displayOrder || (i + 1),
              a.isActive !== false ? 1 : 0
            );
          }
        }
      }
    });

    tx();
    console.log(`[mongo-catalog] Synced ${mongoQuestions.length} questions from MongoDB → SQLite`);
  } catch (e) {
    console.warn('[mongo-catalog] syncMongoQuestionsToSqlite error:', e);
  }
}

export async function seedMongoQuestionsFromSqlite(sqliteDb: any) {
  if (!(await ensureMongo())) return;
  try {
    const existingCount = await MongoQuestion.countDocuments();
    if (existingCount > 0) return;

    const questions = sqliteDb.prepare('SELECT * FROM questions').all() as any[];
    const getAnswers = sqliteDb.prepare('SELECT * FROM answers WHERE questionId = ? ORDER BY displayOrder ASC');

    const ops = questions.map((q: any) => {
      const answers = getAnswers.all(q.id).map((a: any) => ({
        id: a.id,
        questionId: q.id,
        code: a.code,
        label: a.label,
        description: a.description || null,
        icon: a.icon || null,
        adjustmentType: a.adjustmentType || 'FIXED',
        adjustmentValue: Number(a.adjustmentValue) || 0,
        isRejection: a.isRejection === 1,
        warningMessage: a.warningMessage || null,
        displayOrder: a.displayOrder || 0,
        isActive: a.isActive === 1,
      }));

      let target = q.targetCategory;
      if (!target || target === 'ALL') {
        if (q.code.startsWith('PHONE_')) target = 'SMARTPHONE';
        else if (q.code.startsWith('LAPTOP_')) target = 'LAPTOP';
        else target = 'ALL';
      }

      return {
        updateOne: {
          filter: { id: q.id },
          update: {
            $setOnInsert: {
              id: q.id,
              categoryId: q.categoryId || (target === 'SMARTPHONE' ? 'cat_smartphone' : target === 'LAPTOP' ? 'cat_laptop' : null),
              targetCategory: target,
              brandId: q.brandId || null,
              modelId: q.modelId || null,
              title: q.title,
              subtitle: q.subtitle || null,
              code: q.code,
              questionType: q.questionType || 'SINGLE_CHOICE',
              isRequired: q.isRequired === 1,
              displayOrder: q.displayOrder || 0,
              isActive: q.isActive === 1,
              answers,
            },
          },
          upsert: true,
        },
      };
    });

    if (ops.length > 0) {
      await MongoQuestion.bulkWrite(ops);
      console.log(`[mongo-catalog] Seeded ${ops.length} questions into MongoDB`);
    }
  } catch (e) {
    console.warn('[mongo-catalog] seedMongoQuestionsFromSqlite error:', e);
  }
}

// ---------------------------------------------------------------------------
// PRICING RULES (Persistent MongoDB Source of Truth)
// ---------------------------------------------------------------------------

export async function mongoGetAllPricingRules(filter: any = {}) {
  if (!(await ensureMongo())) return null;
  try {
    return await MongoPricingRule.find(filter).sort({ createdAt: -1 }).lean();
  } catch (e) {
    console.warn('[mongo-catalog] mongoGetAllPricingRules error:', e);
    return null;
  }
}

export async function mongoUpsertPricingRule(ruleData: any) {
  if (!(await ensureMongo())) return false;
  try {
    const clean: any = { ...ruleData };
    clean.updatedAt = new Date();
    await MongoPricingRule.findOneAndUpdate(
      { id: ruleData.id },
      { $set: clean },
      { upsert: true, new: true }
    );
    return true;
  } catch (e) {
    console.warn('[mongo-catalog] mongoUpsertPricingRule error:', e);
    return false;
  }
}

export async function mongoDeletePricingRule(ruleId: string) {
  if (!(await ensureMongo())) return false;
  try {
    await MongoPricingRule.deleteOne({ id: ruleId });
    return true;
  } catch (e) {
    console.warn('[mongo-catalog] mongoDeletePricingRule error:', e);
    return false;
  }
}

export async function syncMongoPricingRulesToSqlite(sqliteDb: any) {
  if (!(await ensureMongo())) return;
  try {
    const rules = (await MongoPricingRule.find({}).lean()) as any[];
    if (!rules || rules.length === 0) return;

    const upsertR = sqliteDb.prepare(`
      INSERT OR REPLACE INTO pricing_rules (
        id, name, categoryId, targetCategory, brandId, modelId, variantId,
        questionCode, answerCode, ruleType, adjustmentType, adjustmentValue,
        priorityLevel, maxCap, minCap, isActive, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const tx = sqliteDb.transaction(() => {
      for (const r of rules) {
        upsertR.run(
          r.id,
          r.name,
          r.categoryId || null,
          r.targetCategory || 'ALL',
          r.brandId || null,
          r.modelId || null,
          r.variantId || null,
          r.questionCode || null,
          r.answerCode || null,
          r.ruleType || 'DEDUCTION',
          r.adjustmentType || 'FIXED',
          Number(r.adjustmentValue) || 0,
          r.priorityLevel || 'GLOBAL',
          r.maxCap || null,
          r.minCap || null,
          r.isActive !== false ? 1 : 0
        );
      }
    });

    tx();
    console.log(`[mongo-catalog] Synced ${rules.length} pricing rules from MongoDB → SQLite`);
  } catch (e) {
    console.warn('[mongo-catalog] syncMongoPricingRulesToSqlite error:', e);
  }
}

export async function seedMongoPricingRulesFromSqlite(sqliteDb: any) {
  if (!(await ensureMongo())) return;
  try {
    const existingCount = await MongoPricingRule.countDocuments();
    if (existingCount > 0) return;

    const rules = sqliteDb.prepare('SELECT * FROM pricing_rules').all() as any[];
    if (rules.length === 0) return;

    const ops = rules.map((r: any) => ({
      updateOne: {
        filter: { id: r.id },
        update: {
          $setOnInsert: {
            id: r.id,
            name: r.name,
            categoryId: r.categoryId || null,
            targetCategory: r.targetCategory || 'ALL',
            brandId: r.brandId || null,
            modelId: r.modelId || null,
            variantId: r.variantId || null,
            questionCode: r.questionCode || null,
            answerCode: r.answerCode || null,
            ruleType: r.ruleType || 'DEDUCTION',
            adjustmentType: r.adjustmentType || 'FIXED',
            adjustmentValue: Number(r.adjustmentValue) || 0,
            priorityLevel: r.priorityLevel || 'GLOBAL',
            maxCap: r.maxCap || null,
            minCap: r.minCap || null,
            isActive: r.isActive === 1,
          },
        },
        upsert: true,
      },
    }));

    await MongoPricingRule.bulkWrite(ops);
    console.log(`[mongo-catalog] Seeded ${ops.length} pricing rules into MongoDB`);
  } catch (e) {
    console.warn('[mongo-catalog] seedMongoPricingRulesFromSqlite error:', e);
  }
}

