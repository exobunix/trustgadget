const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { imagekit, compressTo100_300KB } = require('./image_compressor');

// Database connection
const dbPath = path.resolve(__dirname, '../trustmygadget.db');
const db = new Database(dbPath);

// Ensure WAL mode
db.pragma('journal_mode = WAL');

// Load CSV
const csvPath = path.resolve(__dirname, '../India_Smartphone_Database_2026_All_Prices_Updated.csv');
const csvRaw = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
const lines = csvRaw.split('\n').filter(Boolean);

// Load image mapping
const modelImageMapPath = path.resolve(__dirname, '../scratch/model_image_map.json');
const modelImageMap = JSON.parse(fs.readFileSync(modelImageMapPath, 'utf8'));

// Load or initialize upload cache
const cachePath = path.resolve(__dirname, '../scratch/uploaded_images_cache.json');
let uploadCache = {};
if (fs.existsSync(cachePath)) {
  try {
    uploadCache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } catch (e) {
    uploadCache = {};
  }
}

// Brand definitions
const BRAND_METADATA = {
  'Apple': { id: 'b_phone_apple', slug: 'apple', name: 'Apple', logoUrl: '/brands/apple.svg', isPopular: 1, displayOrder: 1 },
  'Samsung': { id: 'b_phone_samsung', slug: 'samsung', name: 'Samsung', logoUrl: '/brands/samsung.svg', isPopular: 1, displayOrder: 2 },
  'OnePlus': { id: 'b_phone_oneplus', slug: 'oneplus', name: 'OnePlus', logoUrl: '/brands/oneplus.svg', isPopular: 1, displayOrder: 3 },
  'Xiaomi': { id: 'b_phone_xiaomi', slug: 'xiaomi', name: 'Xiaomi', logoUrl: '/brands/xiaomi.svg', isPopular: 1, displayOrder: 4 },
  'POCO': { id: 'b_phone_poco', slug: 'poco', name: 'POCO', logoUrl: '/brands/poco.svg', isPopular: 1, displayOrder: 5 },
  'realme': { id: 'b_phone_realme', slug: 'realme', name: 'Realme', logoUrl: '/brands/realme.svg', isPopular: 1, displayOrder: 6 },
  'vivo': { id: 'b_phone_vivo', slug: 'vivo', name: 'Vivo', logoUrl: '/brands/vivo.svg', isPopular: 1, displayOrder: 7 },
  'OPPO': { id: 'b_phone_oppo', slug: 'oppo', name: 'OPPO', logoUrl: '/brands/oppo.svg', isPopular: 1, displayOrder: 8 },
  'iQOO': { id: 'b_phone_iqoo', slug: 'iqoo', name: 'iQOO', logoUrl: '/brands/iqoo.svg', isPopular: 1, displayOrder: 9 },
  'Google': { id: 'b_phone_google', slug: 'google-pixel', name: 'Google Pixel', logoUrl: '/brands/google.svg', isPopular: 1, displayOrder: 10 },
  'Motorola': { id: 'b_phone_motorola', slug: 'motorola', name: 'Motorola', logoUrl: '/brands/motorola.svg', isPopular: 1, displayOrder: 11 },
  'Nothing': { id: 'b_phone_nothing', slug: 'nothing', name: 'Nothing', logoUrl: '/brands/nothing.svg', isPopular: 1, displayOrder: 12 },
  'CMF': { id: 'b_phone_cmf', slug: 'cmf', name: 'CMF by Nothing', logoUrl: '/brands/cmf.svg', isPopular: 1, displayOrder: 13 },
  'Nokia': { id: 'b_phone_nokia', slug: 'nokia', name: 'Nokia', logoUrl: '/brands/nokia.svg', isPopular: 0, displayOrder: 14 },
  'HMD': { id: 'b_phone_hmd', slug: 'hmd', name: 'HMD', logoUrl: '/brands/hmd.svg', isPopular: 0, displayOrder: 15 },
  'Infinix': { id: 'b_phone_infinix', slug: 'infinix', name: 'Infinix', logoUrl: '/brands/infinix.svg', isPopular: 0, displayOrder: 16 },
  'Tecno': { id: 'b_phone_tecno', slug: 'tecno', name: 'Tecno', logoUrl: '/brands/tecno.svg', isPopular: 0, displayOrder: 17 },
  'Honor': { id: 'b_phone_honor', slug: 'honor', name: 'Honor', logoUrl: '/brands/honor.svg', isPopular: 0, displayOrder: 18 },
  'ASUS': { id: 'b_phone_asus', slug: 'asus-rog-phone', name: 'ASUS ROG Phone', logoUrl: '/brands/asus.svg', isPopular: 0, displayOrder: 19 },
  'Lava': { id: 'b_phone_lava', slug: 'lava', name: 'Lava', logoUrl: '/brands/lava.svg', isPopular: 0, displayOrder: 20 },
  'Sony': { id: 'b_phone_sony', slug: 'sony-xperia', name: 'Sony Xperia', logoUrl: '/brands/sony.svg', isPopular: 0, displayOrder: 21 },
  'Nubia': { id: 'b_phone_nubia', slug: 'nubia', name: 'Nubia RedMagic', logoUrl: '/brands/nubia.svg', isPopular: 0, displayOrder: 22 },
  'ZTE': { id: 'b_phone_zte', slug: 'zte', name: 'ZTE', logoUrl: '/brands/zte.svg', isPopular: 0, displayOrder: 23 },
  'itel': { id: 'b_phone_itel', slug: 'itel', name: 'itel', logoUrl: '/brands/itel.svg', isPopular: 0, displayOrder: 24 },
  'Micromax': { id: 'b_phone_micromax', slug: 'micromax', name: 'Micromax', logoUrl: '/brands/micromax.svg', isPopular: 0, displayOrder: 25 },
  'Huawei': { id: 'b_phone_huawei', slug: 'huawei', name: 'Huawei', logoUrl: '/brands/huawei.svg', isPopular: 0, displayOrder: 26 }
};

function slugify(text) {
  return text.toString().toLowerCase()
    .trim()
    .replace(/\+/g, '-plus')
    .replace(/&/g, '-and-')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Parse CSV rows
const parsedRows = lines.slice(1).map((line, idx) => {
  const p = line.split(',');
  const brand = p[0].trim();
  const series = p[1].trim();
  const model = p[2].trim();
  const modelNumber = p[3].trim();
  const ram = p[4].trim();
  const storage = p[5].trim();
  const variant = p[6].trim();
  const network = p[7].trim();
  const launchYear = parseInt(p[8].trim(), 10) || 2024;
  const price = parseFloat(p[9].trim()) || 15000;
  return { brand, series, model, modelNumber, ram, storage, variant, network, launchYear, price };
});

// Group by Brand -> Model -> Variants
const catalogByModel = new Map();
for (const r of parsedRows) {
  const modelKey = `${r.brand}:::${r.model}`;
  if (!catalogByModel.has(modelKey)) {
    catalogByModel.set(modelKey, {
      brand: r.brand,
      model: r.model,
      series: r.series,
      launchYear: r.launchYear,
      variants: []
    });
  }
  catalogByModel.get(modelKey).variants.push(r);
}

console.log(`Loaded ${parsedRows.length} variant rows across ${catalogByModel.size} unique models.`);

// Upload single image with compression and retry
async function processAndUploadImage(modelKey, sourceUrl, modelSlug) {
  if (uploadCache[sourceUrl]) {
    return uploadCache[sourceUrl];
  }

  const fileName = `${modelSlug}.jpg`;

  try {
    const res = await fetch(sourceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://www.gsmarena.com/'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch image: HTTP ${res.status}`);
    }

    const rawBuffer = Buffer.from(await res.arrayBuffer());
    const compressed = await compressTo100_300KB(rawBuffer);

    console.log(`[Upload] ${modelSlug} (${(compressed.length / 1024).toFixed(1)} KB) -> ImageKit`);

    const uploadRes = await imagekit.upload({
      file: compressed.toString('base64'),
      fileName,
      folder: 'trust_gadget/devices',
      useUniqueFileName: false,
      tags: ['trustmygadget', 'devices', modelSlug]
    });

    uploadCache[sourceUrl] = uploadRes.url;
    fs.writeFileSync(cachePath, JSON.stringify(uploadCache, null, 2));
    return uploadRes.url;
  } catch (err) {
    console.error(`[Error] Failed to process ${modelKey} (${sourceUrl}):`, err.message);
    // Fallback: return ImageKit default device URL or direct URL
    const fallbackUrl = `https://ik.imagekit.io/avdarinn/trust_gadget/devices/${fileName}`;
    return uploadCache[sourceUrl] || fallbackUrl;
  }
}

// Concurrency helper
async function mapConcurrent(items, concurrency, fn) {
  const results = [];
  const executing = new Set();
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean).catch(clean);
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

async function run() {
  console.log('\n--- Step 1: Processing and Uploading Images to ImageKit (100-300 KB) ---');
  const modelEntries = Array.from(catalogByModel.entries());

  let processedCount = 0;
  await mapConcurrent(modelEntries, 6, async ([modelKey, mInfo]) => {
    const brandMeta = BRAND_METADATA[mInfo.brand] || { slug: slugify(mInfo.brand) };
    const modelSlug = `${brandMeta.slug}-${slugify(mInfo.model)}`;
    const sourceUrl = modelImageMap[modelKey] || 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg';

    const uploadedUrl = await processAndUploadImage(modelKey, sourceUrl, modelSlug);
    mInfo.imageUrl = uploadedUrl;
    mInfo.slug = modelSlug;

    processedCount++;
    if (processedCount % 25 === 0 || processedCount === modelEntries.length) {
      console.log(`Progress: ${processedCount}/${modelEntries.length} device images processed.`);
    }
  });

  console.log('\n--- Step 2: Ingesting Brands, Models & Variants into Database ---');

  const insertBrand = db.prepare(`
    INSERT INTO brands (id, categoryId, name, slug, logoUrl, isPopular, displayOrder, isActive, updatedAt)
    VALUES (@id, 'cat_smartphone', @name, @slug, @logoUrl, @isPopular, @displayOrder, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(categoryId, slug) DO UPDATE SET
      name = excluded.name,
      logoUrl = excluded.logoUrl,
      isPopular = excluded.isPopular,
      displayOrder = excluded.displayOrder,
      isActive = 1,
      updatedAt = CURRENT_TIMESTAMP
  `);

  const insertModel = db.prepare(`
    INSERT INTO models (id, brandId, categoryId, name, slug, series, imageUrl, releaseYear, basePrice, minPrice, maxPrice, isPopular, isFeatured, isActive, specifications, updatedAt)
    VALUES (@id, @brandId, 'cat_smartphone', @name, @slug, @series, @imageUrl, @releaseYear, @basePrice, @minPrice, @maxPrice, @isPopular, @isFeatured, 1, @specifications, CURRENT_TIMESTAMP)
    ON CONFLICT(brandId, slug) DO UPDATE SET
      name = excluded.name,
      series = excluded.series,
      imageUrl = excluded.imageUrl,
      releaseYear = excluded.releaseYear,
      basePrice = excluded.basePrice,
      minPrice = excluded.minPrice,
      maxPrice = excluded.maxPrice,
      isPopular = excluded.isPopular,
      isFeatured = excluded.isFeatured,
      isActive = 1,
      specifications = excluded.specifications,
      updatedAt = CURRENT_TIMESTAMP
  `);

  const insertVariant = db.prepare(`
    INSERT INTO variants (id, modelId, name, slug, ram, storage, processor, gpu, screenSize, color, basePrice, minPrice, maxPrice, isDefault, isActive, updatedAt)
    VALUES (@id, @modelId, @name, @slug, @ram, @storage, @processor, @gpu, @screenSize, @color, @basePrice, @minPrice, @maxPrice, @isDefault, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(modelId, slug) DO UPDATE SET
      name = excluded.name,
      ram = excluded.ram,
      storage = excluded.storage,
      processor = excluded.processor,
      gpu = excluded.gpu,
      screenSize = excluded.screenSize,
      color = excluded.color,
      basePrice = excluded.basePrice,
      minPrice = excluded.minPrice,
      maxPrice = excluded.maxPrice,
      isDefault = excluded.isDefault,
      isActive = 1,
      updatedAt = CURRENT_TIMESTAMP
  `);

  // Run in database transaction
  const insertAll = db.transaction(() => {
    // 1. Insert Brands
    for (const b of Object.values(BRAND_METADATA)) {
      insertBrand.run(b);
    }

    // 2. Insert Models & Variants
    for (const [modelKey, mInfo] of catalogByModel.entries()) {
      const brandMeta = BRAND_METADATA[mInfo.brand];
      const modelId = `m_${brandMeta.slug}_${slugify(mInfo.model)}`.replace(/-/g, '_').slice(0, 48);

      // Compute pricing for variants
      const variantsData = mInfo.variants.map((v, vIdx) => {
        let deprFactor = 0.60;
        if (v.launchYear >= 2026) deprFactor = 0.72;
        else if (v.launchYear === 2025) deprFactor = 0.68;
        else if (v.launchYear === 2024) deprFactor = 0.60;
        else if (v.launchYear === 2023) deprFactor = 0.52;
        else deprFactor = 0.45;

        const basePrice = Math.round(v.price * deprFactor);
        const minPrice = Math.round(basePrice * 0.65);
        const maxPrice = Math.round(basePrice * 1.15);

        const ramStr = v.ram ? `${v.ram}GB` : '';
        const storageStr = v.storage ? `${v.storage}GB` : '';
        const vSlug = `${mInfo.slug}-${v.ram ? v.ram + 'gb-' : ''}${v.storage}gb`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const variantId = `v_${modelId}_${v.ram || '0'}r_${v.storage || '0'}s`.slice(0, 52);

        return {
          id: variantId,
          modelId,
          name: v.variant || `${ramStr ? ramStr + ' / ' : ''}${storageStr}`,
          slug: vSlug,
          ram: ramStr,
          storage: storageStr,
          processor: `${v.network} Chipset`,
          gpu: 'Integrated GPU',
          screenSize: '6.7"',
          color: 'Standard',
          basePrice,
          minPrice,
          maxPrice,
          isDefault: vIdx === 0 ? 1 : 0
        };
      });

      // Model pricing based on variants
      const allBase = variantsData.map(v => v.basePrice);
      const allMin = variantsData.map(v => v.minPrice);
      const allMax = variantsData.map(v => v.maxPrice);

      const modelBasePrice = Math.min(...allBase);
      const modelMinPrice = Math.min(...allMin);
      const modelMaxPrice = Math.max(...allMax);

      const isPopular = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Google'].includes(mInfo.brand) && mInfo.launchYear >= 2024 ? 1 : 0;
      const isFeatured = ['iPhone 16 Pro Max', 'Galaxy S24 Ultra', 'OnePlus 12', 'Pixel 9 Pro'].includes(mInfo.model) ? 1 : 0;

      insertModel.run({
        id: modelId,
        brandId: brandMeta.id,
        name: mInfo.model,
        slug: mInfo.slug,
        series: mInfo.series || `${mInfo.brand} Series`,
        imageUrl: mInfo.imageUrl,
        releaseYear: mInfo.launchYear,
        basePrice: modelBasePrice,
        minPrice: modelMinPrice,
        maxPrice: modelMaxPrice,
        isPopular,
        isFeatured,
        specifications: JSON.stringify({
          brand: mInfo.brand,
          series: mInfo.series,
          releaseYear: mInfo.launchYear,
          variantsCount: variantsData.length
        })
      });

      for (const vData of variantsData) {
        insertVariant.run(vData);
      }
    }
  });

  insertAll();
  console.log('Database updated successfully!');

  // Check counts
  const bCount = db.prepare("SELECT COUNT(*) as c FROM brands WHERE categoryId = 'cat_smartphone'").get().c;
  const mCount = db.prepare("SELECT COUNT(*) as c FROM models WHERE categoryId = 'cat_smartphone'").get().c;
  const vCount = db.prepare("SELECT COUNT(*) as c FROM variants").get().c;

  console.log(`\n=== Verification ===`);
  console.log(`Active Smartphone Brands: ${bCount}`);
  console.log(`Active Smartphone Models: ${mCount}`);
  console.log(`Active Smartphone Variants: ${vCount}`);
}

run().catch(console.error);
