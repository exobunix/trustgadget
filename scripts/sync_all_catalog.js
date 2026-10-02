const path = require('path');
const fs = require('fs');
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const mongoose = require('mongoose');
const Database = require('better-sqlite3');

async function main() {
  const envContent = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
  let mongoUri = '';
  for (const line of envContent.split('\n')) {
    if (line.trim().startsWith('MONGODB_URI=')) {
      mongoUri = line.trim().slice('MONGODB_URI='.length).replace(/^['"]|['"]$/g, '');
    }
  }

  const sqlite = new Database(path.resolve(__dirname, '../trustmygadget.db'));

  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db;

  const sqlCategories = sqlite.prepare('SELECT * FROM categories').all();
  const sqlBrands = sqlite.prepare('SELECT * FROM brands').all();
  const sqlModels = sqlite.prepare('SELECT * FROM models').all();
  const sqlVariants = sqlite.prepare('SELECT * FROM variants').all();

  console.log(`SQLite has: ${sqlCategories.length} categories, ${sqlBrands.length} brands, ${sqlModels.length} models, ${sqlVariants.length} variants`);

  // 1. Categories -> Mongo ($setOnInsert)
  console.log('Seeding categories to MongoDB...');
  const catOps = sqlCategories.map(c => ({
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
        }
      },
      upsert: true,
    }
  }));
  if (catOps.length) await db.collection('categories').bulkWrite(catOps);

  // 2. Brands -> Mongo ($setOnInsert)
  console.log('Seeding brands to MongoDB...');
  const brandOps = sqlBrands.map(b => ({
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
        }
      },
      upsert: true,
    }
  }));
  if (brandOps.length) await db.collection('brands').bulkWrite(brandOps);

  // 3. Models -> Mongo ($setOnInsert to preserve any existing user edits!)
  console.log('Seeding models to MongoDB with $setOnInsert (preserving existing edits)...');
  const modelOps = sqlModels.map(m => {
    let specs = {};
    try {
      specs = m.specifications ? (typeof m.specifications === 'string' ? JSON.parse(m.specifications) : m.specifications) : {};
    } catch (e) {}

    return {
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
            specifications: specs,
          }
        },
        upsert: true,
      }
    };
  });
  if (modelOps.length) await db.collection('models').bulkWrite(modelOps);

  // 4. Variants -> Mongo ($setOnInsert)
  console.log('Seeding variants to MongoDB with $setOnInsert (preserving existing edits)...');
  const varOps = sqlVariants.map(v => ({
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
        }
      },
      upsert: true,
    }
  }));
  if (varOps.length) await db.collection('variants').bulkWrite(varOps);

  // 5. Now check any models in MongoDB that are NOT in SQLite (e.g. m_apple_iphone_18_pro_max) and sync them back to SQLite!
  console.log('Checking for any models created directly in MongoDB...');
  const mongoModels = await db.collection('models').find({}).toArray();
  const mongoVariants = await db.collection('variants').find({}).toArray();

  console.log(`Total in MongoDB now: ${mongoModels.length} models, ${mongoVariants.length} variants`);

  const upsertSqlModel = sqlite.prepare(`
    INSERT OR REPLACE INTO models (
      id, brandId, categoryId, name, slug, series, imageUrl, releaseYear,
      basePrice, minPrice, maxPrice, isPopular, isFeatured, isActive, specifications
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const upsertSqlVariant = sqlite.prepare(`
    INSERT OR REPLACE INTO variants (
      id, modelId, name, slug, ram, storage, processor, gpu, basePrice, minPrice, maxPrice, isDefault, isActive
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tx = sqlite.transaction(() => {
    for (const m of mongoModels) {
      upsertSqlModel.run(
        m.id,
        m.brandId,
        m.categoryId,
        m.name,
        m.slug,
        m.series || null,
        m.imageUrl || null,
        m.releaseYear || 2024,
        Number(m.basePrice),
        m.minPrice != null ? Number(m.minPrice) : Math.round(Number(m.basePrice) * 0.7),
        m.maxPrice != null ? Number(m.maxPrice) : Math.round(Number(m.basePrice) * 1.25),
        m.isPopular ? 1 : 0,
        m.isFeatured ? 1 : 0,
        m.isActive !== false ? 1 : 0,
        typeof m.specifications === 'object' ? JSON.stringify(m.specifications) : (m.specifications || '{}')
      );
    }

    for (const v of mongoVariants) {
      upsertSqlVariant.run(
        v.id,
        v.modelId,
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
  });

  tx();

  const finalSqlModels = sqlite.prepare('SELECT count(*) as c FROM models').get().c;
  const finalSqlVariants = sqlite.prepare('SELECT count(*) as c FROM variants').get().c;
  console.log(`Final in SQLite: ${finalSqlModels} models, ${finalSqlVariants} variants`);

  await mongoose.disconnect();
  console.log('Catalog sync complete!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
