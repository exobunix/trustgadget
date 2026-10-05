const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const xlsx = require('xlsx');
const Database = require('better-sqlite3');
const mongoose = require('mongoose');
const dns = require('dns');

try {
  if (typeof dns.setServers === 'function') {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  }
} catch (e) {}

// 1. Database Connections
const dbPath = path.resolve(__dirname, '../trustmygadget.db');
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');

const envContent = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
let mongoUri = '';
for (const line of envContent.split('\n')) {
  if (line.trim().startsWith('MONGODB_URI=')) {
    mongoUri = line.trim().slice('MONGODB_URI='.length).replace(/^['"]|['"]$/g, '');
  }
}

// 2. Read Excel
const excelPath = path.resolve(__dirname, '../TrustGadgetmart_Product_Catalog.xlsx');
console.log(`Reading Excel catalog from: ${excelPath}`);
const wb = xlsx.readFile(excelPath);
const sheet = wb.Sheets['Product Upload'];
const rawRows = xlsx.utils.sheet_to_json(sheet);
console.log(`Total rows in Excel: ${rawRows.length}`);

// 3. Category Definitions
const CATEGORY_MAP = {
  'Mobile': {
    id: 'cat_smartphone',
    name: 'Smartphones',
    slug: 'smartphones',
    icon: 'Smartphone',
    description: 'Sell old iPhones, Samsung Galaxy, OnePlus, Xiaomi, and all top Android smartphones for top cash.',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
    displayOrder: 1,
    isActive: 1,
  },
  'Laptop / MacBook': {
    id: 'cat_laptop',
    name: 'Laptops',
    slug: 'laptops',
    icon: 'Laptop',
    description: 'Sell Apple MacBooks, Dell XPS, HP Pavilion, Lenovo ThinkPad, Gaming rigs, and ultrabooks instantly.',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    displayOrder: 2,
    isActive: 1,
  },
  'Tablet / iPad': {
    id: 'cat_tablet',
    name: 'Tablets',
    slug: 'tablets',
    icon: 'Tablet',
    description: 'Sell Apple iPads, Samsung Galaxy Tabs, Lenovo and Microsoft Surface tablets.',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
    displayOrder: 3,
    isActive: 1,
  }
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

// Brand Normalization
const BRAND_NAMES = {
  'MI_XIAOMI': 'Xiaomi',
  'NOTHING': 'Nothing',
  'IQOO': 'iQOO',
  'HONOR': 'Honor',
  'HUAWEI': 'Huawei',
  'INFINIX': 'Infinix',
  'INTEX': 'Intex',
  'MICROMAX': 'Micromax',
  'AMAZON': 'Amazon',
  'IBALL': 'iBall',
  'LAVA': 'Lava',
  'TOSHIBA': 'Toshiba',
  'GIONEE': 'Gionee',
  'TECNO': 'Tecno',
  'POCO': 'POCO',
  'MSI': 'MSI',
  'HCL': 'HCL',
  'Panasonic': 'Panasonic',
  'Asus': 'ASUS',
  'Apple': 'Apple',
  'Samsung': 'Samsung',
  'Dell': 'Dell',
  'HP': 'HP',
  'Lenovo': 'Lenovo',
  'LG': 'LG',
  'Motorola': 'Motorola',
  'Nokia': 'Nokia',
  'OnePlus': 'OnePlus',
  'Oppo': 'OPPO',
  'Realme': 'Realme',
  'Sony': 'Sony',
  'Vivo': 'Vivo',
  'Google': 'Google Pixel',
  'Microsoft': 'Microsoft Surface',
  'Acer': 'Acer'
};

const BRAND_SLUGS = {
  // Mobile
  'cat_smartphone:::Apple': 'apple',
  'cat_smartphone:::Samsung': 'samsung',
  'cat_smartphone:::OnePlus': 'oneplus',
  'cat_smartphone:::Xiaomi': 'xiaomi',
  'cat_smartphone:::Google': 'google-pixel',
  'cat_smartphone:::Motorola': 'motorola',
  'cat_smartphone:::Realme': 'realme',
  'cat_smartphone:::Vivo': 'vivo',
  'cat_smartphone:::OPPO': 'oppo',
  'cat_smartphone:::iQOO': 'iqoo',
  'cat_smartphone:::POCO': 'poco',
  'cat_smartphone:::Nothing': 'nothing',
  'cat_smartphone:::ASUS': 'asus-rog-phone',
  'cat_smartphone:::Nokia': 'nokia',
  'cat_smartphone:::Honor': 'honor',
  'cat_smartphone:::Infinix': 'infinix',
  'cat_smartphone:::Tecno': 'tecno',
  'cat_smartphone:::Huawei': 'huawei',
  'cat_smartphone:::Sony': 'sony-xperia',
  'cat_smartphone:::Lenovo': 'lenovo',
  'cat_smartphone:::LG': 'lg',
  'cat_smartphone:::Micromax': 'micromax',
  'cat_smartphone:::Gionee': 'gionee',
  'cat_smartphone:::Intex': 'intex',
  'cat_smartphone:::Panasonic': 'panasonic',

  // Laptop
  'cat_laptop:::Apple': 'apple-macbook',
  'cat_laptop:::Dell': 'dell',
  'cat_laptop:::HP': 'hp',
  'cat_laptop:::Lenovo': 'lenovo',
  'cat_laptop:::ASUS': 'asus',
  'cat_laptop:::Acer': 'acer',
  'cat_laptop:::Samsung': 'samsung-galaxy-book',
  'cat_laptop:::MSI': 'msi',
  'cat_laptop:::Microsoft': 'microsoft-surface',
  'cat_laptop:::Xiaomi': 'xiaomi-mi-notebook',
  'cat_laptop:::LG': 'lg-gram',
  'cat_laptop:::Honor': 'honor',
  'cat_laptop:::Toshiba': 'toshiba',
  'cat_laptop:::Sony': 'sony',
  'cat_laptop:::HCL': 'hcl',
  'cat_laptop:::Micromax': 'micromax',
  'cat_laptop:::Nokia': 'nokia',
  'cat_laptop:::iBall': 'iball',
  'cat_laptop:::Lava': 'lava',

  // Tablet
  'cat_tablet:::Apple': 'apple-ipad',
  'cat_tablet:::Samsung': 'samsung-galaxy-tab',
  'cat_tablet:::Amazon': 'amazon-kindle',
  'cat_tablet:::Lenovo': 'lenovo',
  'cat_tablet:::OnePlus': 'oneplus-pad',
  'cat_tablet:::Xiaomi': 'xiaomi-pad',
  'cat_tablet:::Microsoft': 'microsoft-surface',
  'cat_tablet:::Honor': 'honor',
  'cat_tablet:::Huawei': 'huawei',
  'cat_tablet:::Acer': 'acer',
  'cat_tablet:::ASUS': 'asus',
  'cat_tablet:::Dell': 'dell',
  'cat_tablet:::iBall': 'iball'
};

const BRAND_LOGOS = {
  'Apple': '/brands/apple.svg',
  'Samsung': '/brands/samsung.svg',
  'OnePlus': '/brands/oneplus.svg',
  'Xiaomi': '/brands/xiaomi.svg',
  'Google': '/brands/google.svg',
  'Motorola': '/brands/motorola.svg',
  'Realme': '/brands/realme.svg',
  'Vivo': '/brands/vivo.svg',
  'OPPO': '/brands/oppo.svg',
  'iQOO': '/brands/iqoo.svg',
  'POCO': '/brands/poco.svg',
  'Nothing': '/brands/nothing.svg',
  'ASUS': '/brands/asus.svg',
  'Nokia': '/brands/nokia.svg',
  'Honor': '/brands/honor.svg',
  'Infinix': '/brands/infinix.svg',
  'Tecno': '/brands/tecno.svg',
  'Huawei': '/brands/huawei.svg',
  'Sony': '/brands/sony.svg',
  'Lenovo': '/brands/lenovo.svg',
  'LG': '/brands/lg.svg',
  'Micromax': '/brands/micromax.svg',
  'Gionee': '/brands/gionee.svg',
  'Intex': '/brands/intex.svg',
  'Panasonic': '/brands/panasonic.svg',
  'Dell': '/brands/dell.svg',
  'HP': '/brands/hp.svg',
  'Acer': '/brands/acer.svg',
  'MSI': '/brands/msi.svg',
  'Microsoft': '/brands/microsoft.svg',
  'Toshiba': '/brands/toshiba.svg',
  'HCL': '/brands/hcl.svg',
  'iBall': '/brands/iball.svg',
  'Lava': '/brands/lava.svg',
  'Amazon': '/brands/amazon.svg'
};

const POPULAR_BRANDS = new Set([
  'Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Vivo', 'OPPO', 'Google',
  'Motorola', 'iQOO', 'POCO', 'Nothing', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'Amazon'
]);

// 4. Image Resolver
let uploadedCache = {};
const cachePath = path.resolve(__dirname, '../scratch/uploaded_images_cache.json');
if (fs.existsSync(cachePath)) {
  try { uploadedCache = JSON.parse(fs.readFileSync(cachePath, 'utf8')); } catch (e) {}
}

const imageKitBySlug = new Map();
for (const url of Object.values(uploadedCache)) {
  const filename = url.split('/').pop().replace(/\.jpg$/, '').toLowerCase();
  imageKitBySlug.set(filename, url);
  const parts = filename.split('-');
  if (parts.length > 1) {
    imageKitBySlug.set(parts.slice(1).join('-'), url);
  }
}

const CURATED_IMAGES = {
  macbook_pro: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
  macbook_air: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop&q=80',
  macbook_gen: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
  dell_xps: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80',
  dell_gen: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
  hp_gaming: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80',
  hp_gen: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
  lenovo_gaming: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80',
  lenovo_gen: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
  acer_gaming: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80',
  acer_gen: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
  asus_gaming: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80',
  asus_gen: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
  laptop_generic: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',

  ipad_pro: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
  ipad_air: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
  ipad_gen: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
  galaxy_tab: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80',
  kindle: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600&auto=format&fit=crop&q=80',
  tablet_generic: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',

  iphone_gen: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
  samsung_s_gen: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
  samsung_gen: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
  pixel_gen: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
  oneplus_gen: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',
  phone_generic: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'
};

function resolveDeviceImage(category, brand, modelName) {
  const normModel = modelName.toLowerCase();
  const slug = slugify(modelName);
  const brandSlug = slugify(brand);
  const combinedSlug = `${brandSlug}-${slug}`;

  if (imageKitBySlug.has(combinedSlug)) return imageKitBySlug.get(combinedSlug);
  if (imageKitBySlug.has(slug)) return imageKitBySlug.get(slug);

  for (const [key, url] of imageKitBySlug.entries()) {
    if (combinedSlug.includes(key) || (key.length > 8 && slug.includes(key))) {
      return url;
    }
  }

  if (category === 'Laptop / MacBook') {
    if (normModel.includes('macbook pro')) return CURATED_IMAGES.macbook_pro;
    if (normModel.includes('macbook air')) return CURATED_IMAGES.macbook_air;
    if (normModel.includes('macbook') || brand === 'Apple') return CURATED_IMAGES.macbook_gen;
    if (normModel.includes('xps') || normModel.includes('alienware')) return CURATED_IMAGES.dell_xps;
    if (brand === 'Dell') return CURATED_IMAGES.dell_gen;
    if (normModel.includes('victus') || normModel.includes('omen') || normModel.includes('gaming')) return CURATED_IMAGES.hp_gaming;
    if (brand === 'HP') return CURATED_IMAGES.hp_gen;
    if (normModel.includes('legion')) return CURATED_IMAGES.lenovo_gaming;
    if (brand === 'Lenovo') return CURATED_IMAGES.lenovo_gen;
    if (normModel.includes('nitro') || normModel.includes('predator')) return CURATED_IMAGES.acer_gaming;
    if (brand === 'Acer') return CURATED_IMAGES.acer_gen;
    if (normModel.includes('rog') || normModel.includes('tuf')) return CURATED_IMAGES.asus_gaming;
    if (brand === 'Asus') return CURATED_IMAGES.asus_gen;
    return CURATED_IMAGES.laptop_generic;
  }

  if (category === 'Tablet / iPad') {
    if (normModel.includes('ipad pro')) return CURATED_IMAGES.ipad_pro;
    if (normModel.includes('ipad air')) return CURATED_IMAGES.ipad_air;
    if (normModel.includes('ipad') || brand === 'Apple') return CURATED_IMAGES.ipad_gen;
    if (normModel.includes('tab') || brand === 'Samsung') return CURATED_IMAGES.galaxy_tab;
    if (normModel.includes('kindle') || brand === 'AMAZON') return CURATED_IMAGES.kindle;
    return CURATED_IMAGES.tablet_generic;
  }

  if (brand === 'Apple' || normModel.includes('iphone')) return CURATED_IMAGES.iphone_gen;
  if (brand === 'Samsung' && (normModel.includes('ultra') || normModel.includes('galaxy s') || normModel.includes('fold') || normModel.includes('flip'))) return CURATED_IMAGES.samsung_s_gen;
  if (brand === 'Samsung') return CURATED_IMAGES.samsung_gen;
  if (brand === 'Google' || normModel.includes('pixel')) return CURATED_IMAGES.pixel_gen;
  if (brand === 'OnePlus') return CURATED_IMAGES.oneplus_gen;

  return CURATED_IMAGES.phone_generic;
}

// 5. Build Groupings
const validRows = rawRows.filter(r => r.Model && r.Model.toString().trim().length > 0);
console.log(`Valid product rows: ${validRows.length}`);

const modelsGroup = new Map();
const brandsMap = new Map();
// Check existing brands to preserve their IDs
const existingBrands = sqlite.prepare('SELECT id, categoryId, slug, name FROM brands').all();
const existingBrandIdByCatSlug = new Map();
for (const eb of existingBrands) {
  existingBrandIdByCatSlug.set(`${eb.categoryId}:::${eb.slug}`, eb.id);
}

for (const r of validRows) {
  const catConf = CATEGORY_MAP[r.Category];
  if (!catConf) continue;

  const rawBrand = (r.Brand || '').trim();
  const normalizedBrand = BRAND_NAMES[rawBrand] || rawBrand;
  const brandKey = `${catConf.id}:::${normalizedBrand}`;
  const brandSlug = BRAND_SLUGS[brandKey] || slugify(normalizedBrand);
  let brandId = existingBrandIdByCatSlug.get(`${catConf.id}:::${brandSlug}`);
  if (!brandId) {
    brandId = `b_${catConf.slug.slice(0, 3)}_${slugify(normalizedBrand)}`.replace(/-/g, '_').slice(0, 48);
  }

  if (!brandsMap.has(brandKey)) {
    brandsMap.set(brandKey, {
      id: brandId,
      categoryId: catConf.id,
      name: normalizedBrand,
      slug: brandSlug,
      logoUrl: BRAND_LOGOS[normalizedBrand] || `/brands/${slugify(normalizedBrand)}.svg`,
      isPopular: POPULAR_BRANDS.has(normalizedBrand) ? 1 : 0,
      displayOrder: POPULAR_BRANDS.has(normalizedBrand) ? 1 : 10,
      isActive: 1,
    });
  }

  const modelName = r.Model.toString().trim();
  const modelKey = `${catConf.id}:::${brandId}:::${modelName}`;

  if (!modelsGroup.has(modelKey)) {
    modelsGroup.set(modelKey, {
      categoryId: catConf.id,
      categorySlug: catConf.slug,
      brandId,
      brandName: normalizedBrand,
      brandSlug,
      modelName,
      rawCategory: r.Category,
      rawBrand,
      rows: []
    });
  }

  modelsGroup.get(modelKey).rows.push(r);
}

// 6. Build Models & Variants Lists
const usedModelSlugs = new Set();
const finalModels = [];
const finalVariants = [];

for (const [mKey, mInfo] of modelsGroup.entries()) {
  const brandSlug = mInfo.brandSlug;
  const rawModelSlug = slugify(mInfo.modelName);
  let baseModelSlug = `${brandSlug}-${rawModelSlug}`;
  if (rawModelSlug.startsWith(`${brandSlug}-`)) {
    baseModelSlug = rawModelSlug;
  }
  let modelSlug = baseModelSlug;
  let counter = 1;
  while (usedModelSlugs.has(modelSlug)) {
    counter++;
    modelSlug = `${baseModelSlug}-${counter}`;
  }
  usedModelSlugs.add(modelSlug);

  const hModel = crypto.createHash('md5').update(mInfo.categoryId + ':::' + mInfo.brandId + ':::' + mInfo.modelName).digest('hex').slice(0, 10);
  const modelId = `m_${slugify(mInfo.brandName).slice(0, 12)}_${slugify(mInfo.modelName).slice(0, 24)}_${hModel}`.replace(/-/g, '_');

  const imageUrl = resolveDeviceImage(mInfo.rawCategory, mInfo.rawBrand, mInfo.modelName);

  const variants = [];
  const usedVariantSlugs = new Set();

  mInfo.rows.forEach((r, idx) => {
    const rawRamStorage = (r['RAM / Storage'] || '').toString().trim();
    let ram = '';
    let storage = '';
    if (rawRamStorage) {
      if (rawRamStorage.includes('/')) {
        const parts = rawRamStorage.split('/').map(s => s.trim());
        ram = parts[0];
        storage = parts[1];
      } else {
        storage = rawRamStorage;
      }
    }

    const rawVariant = (r['Variant'] || '').toString().trim();
    let variantName = '';
    if (rawVariant && rawVariant !== 'Not applicable (no variant level)') {
      variantName = rawVariant;
    } else if (rawRamStorage) {
      variantName = rawRamStorage;
    } else {
      variantName = 'Standard Specification';
    }

    const price = Number(r['TrustGadgetmart Price']) || 1000;
    const basePrice = price;
    const minPrice = Math.round(basePrice * 0.7);
    const maxPrice = basePrice;

    let vSlug = slugify(variantName);
    if (!vSlug || vSlug === 'standard-specification') {
      vSlug = `std-${idx + 1}`;
    }
    let uniqueVSlug = vSlug;
    let vCount = 1;
    while (usedVariantSlugs.has(uniqueVSlug)) {
      vCount++;
      uniqueVSlug = `${vSlug}-${vCount}`;
    }
    usedVariantSlugs.add(uniqueVSlug);

    const hVar = crypto.createHash('md5').update(modelId + ':::' + idx + ':::' + uniqueVSlug).digest('hex').slice(0, 8);
    const variantId = `v_${modelId.slice(2, 20)}_${idx}_${hVar}`;

    const vItem = {
      id: variantId,
      modelId,
      name: variantName,
      slug: uniqueVSlug,
      ram: ram || null,
      storage: storage || null,
      processor: null,
      gpu: null,
      screenSize: null,
      color: null,
      basePrice,
      minPrice,
      maxPrice,
      isDefault: idx === 0 ? 1 : 0,
      isActive: 1,
    };
    variants.push(vItem);
    finalVariants.push(vItem);
  });

  const allBasePrices = variants.map(v => v.basePrice);
  const allMinPrices = variants.map(v => v.minPrice);
  const allMaxPrices = variants.map(v => v.maxPrice);

  const modelBasePrice = Math.max(...allBasePrices);
  const modelMinPrice = Math.min(...allMinPrices);
  const modelMaxPrice = Math.max(...allMaxPrices);

  const yearMatch = mInfo.modelName.match(/\b(201\d|202\d)\b/);
  const releaseYear = yearMatch ? parseInt(yearMatch[1], 10) : 2024;

  const isPopular = POPULAR_BRANDS.has(mInfo.brandName) && modelBasePrice > 15000 ? 1 : 0;
  const isFeatured = modelBasePrice > 40000 ? 1 : 0;

  finalModels.push({
    id: modelId,
    brandId: mInfo.brandId,
    categoryId: mInfo.categoryId,
    categorySlug: mInfo.categorySlug,
    brandName: mInfo.brandName,
    brandSlug: mInfo.brandSlug,
    name: mInfo.modelName,
    slug: modelSlug,
    series: mInfo.brandName,
    imageUrl,
    releaseYear,
    basePrice: modelBasePrice,
    minPrice: modelMinPrice,
    maxPrice: modelMaxPrice,
    isPopular,
    isFeatured,
    isActive: 1,
    specifications: JSON.stringify({}),
    variants
  });
}

console.log(`\nProcessed Catalog Summary:`);
console.log(`- Categories: ${Object.keys(CATEGORY_MAP).length}`);
console.log(`- Brands: ${brandsMap.size}`);
console.log(`- Models: ${finalModels.length}`);
console.log(`- Variants: ${finalVariants.length}`);

async function main() {
  console.log('\n--- Step 1: Updating SQLite Database ---');

  // Insert or update categories
  const insertCat = sqlite.prepare(`
    INSERT INTO categories (id, name, slug, icon, description, imageUrl, displayOrder, isActive, updatedAt)
    VALUES (@id, @name, @slug, @icon, @description, @imageUrl, @displayOrder, @isActive, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      slug = excluded.slug,
      icon = excluded.icon,
      description = excluded.description,
      imageUrl = excluded.imageUrl,
      displayOrder = excluded.displayOrder,
      isActive = excluded.isActive,
      updatedAt = CURRENT_TIMESTAMP
  `);

  const insertBrand = sqlite.prepare(`
    INSERT INTO brands (id, categoryId, name, slug, logoUrl, isPopular, displayOrder, isActive, updatedAt)
    VALUES (@id, @categoryId, @name, @slug, @logoUrl, @isPopular, @displayOrder, @isActive, CURRENT_TIMESTAMP)
    ON CONFLICT(categoryId, slug) DO UPDATE SET
      name = excluded.name,
      logoUrl = excluded.logoUrl,
      isPopular = excluded.isPopular,
      displayOrder = excluded.displayOrder,
      isActive = 1,
      updatedAt = CURRENT_TIMESTAMP
  `);

  const insertModel = sqlite.prepare(`
    INSERT INTO models (id, brandId, categoryId, name, slug, series, imageUrl, releaseYear, basePrice, minPrice, maxPrice, isPopular, isFeatured, isActive, specifications, updatedAt)
    VALUES (@id, @brandId, @categoryId, @name, @slug, @series, @imageUrl, @releaseYear, @basePrice, @minPrice, @maxPrice, @isPopular, @isFeatured, 1, @specifications, CURRENT_TIMESTAMP)
  `);

  const insertVariant = sqlite.prepare(`
    INSERT INTO variants (id, modelId, name, slug, ram, storage, processor, gpu, screenSize, color, basePrice, minPrice, maxPrice, isDefault, isActive, updatedAt)
    VALUES (@id, @modelId, @name, @slug, @ram, @storage, @processor, @gpu, @screenSize, @color, @basePrice, @minPrice, @maxPrice, @isDefault, 1, CURRENT_TIMESTAMP)
  `);

  const transaction = sqlite.transaction(() => {
    // 1. Categories
    for (const cat of Object.values(CATEGORY_MAP)) {
      insertCat.run(cat);
    }

    // 2. PURGE ALL EXISTING MODELS AND VARIANTS FIRST
    console.log('Purging existing models and variants from SQLite...');
    sqlite.prepare('DELETE FROM variants').run();
    sqlite.prepare('DELETE FROM models').run();
    sqlite.prepare('DELETE FROM valuation_sessions').run();
    sqlite.prepare('DELETE FROM deleted_catalog_ids').run();

    // 3. Brands
    for (const b of brandsMap.values()) {
      insertBrand.run(b);
    }

    // 4. Insert new models & variants
    console.log('Inserting new models and variants into SQLite...');
    for (const m of finalModels) {
      insertModel.run({
        id: m.id,
        brandId: m.brandId,
        categoryId: m.categoryId,
        name: m.name,
        slug: m.slug,
        series: m.series,
        imageUrl: m.imageUrl,
        releaseYear: m.releaseYear,
        basePrice: m.basePrice,
        minPrice: m.minPrice,
        maxPrice: m.maxPrice,
        isPopular: m.isPopular,
        isFeatured: m.isFeatured,
        specifications: m.specifications,
      });
    }

    for (const v of finalVariants) {
      insertVariant.run(v);
    }
  });

  transaction();
  console.log('SQLite database successfully updated!');

  // Check counts in SQLite
  const sqCats = sqlite.prepare('SELECT count(*) as c FROM categories').get().c;
  const sqBrands = sqlite.prepare('SELECT count(*) as c FROM brands').get().c;
  const sqModels = sqlite.prepare('SELECT count(*) as c FROM models').get().c;
  const sqVariants = sqlite.prepare('SELECT count(*) as c FROM variants').get().c;
  console.log(`SQLite verified counts: ${sqCats} categories, ${sqBrands} brands, ${sqModels} models, ${sqVariants} variants`);

  // --- Step 2: Updating MongoDB Atlas ---
  console.log('\n--- Step 2: Synchronizing with MongoDB Atlas ---');
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 });
      const mDb = mongoose.connection.db;

      console.log('Connected to MongoDB. Purging existing models and variants...');
      await mDb.collection('variants').deleteMany({});
      await mDb.collection('models').deleteMany({});
      await mDb.collection('deleted_catalog_ids').deleteMany({});

      // Upsert Categories
      console.log('Updating categories in MongoDB...');
      const catOps = Object.values(CATEGORY_MAP).map(c => ({
        updateOne: {
          filter: { id: c.id },
          update: { $set: c },
          upsert: true
        }
      }));
      if (catOps.length) await mDb.collection('categories').bulkWrite(catOps);

      // Upsert Brands
      console.log('Updating brands in MongoDB...');
      const brandOps = Array.from(brandsMap.values()).map(b => ({
        updateOne: {
          filter: { id: b.id },
          update: { $set: b },
          upsert: true
        }
      }));
      if (brandOps.length) await mDb.collection('brands').bulkWrite(brandOps);

      // Insert Models in batches of 500
      console.log('Inserting models into MongoDB in batches...');
      const modelDocs = finalModels.map(m => ({
        id: m.id,
        brandId: m.brandId,
        categoryId: m.categoryId,
        name: m.name,
        slug: m.slug,
        series: m.series,
        imageUrl: m.imageUrl,
        releaseYear: m.releaseYear,
        basePrice: m.basePrice,
        minPrice: m.minPrice,
        maxPrice: m.maxPrice,
        isPopular: Boolean(m.isPopular),
        isFeatured: Boolean(m.isFeatured),
        isActive: true,
        specifications: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      for (let i = 0; i < modelDocs.length; i += 500) {
        const chunk = modelDocs.slice(i, i + 500);
        await mDb.collection('models').insertMany(chunk);
      }

      // Insert Variants in batches of 500
      console.log('Inserting variants into MongoDB in batches...');
      const variantDocs = finalVariants.map(v => ({
        id: v.id,
        modelId: v.modelId,
        name: v.name,
        slug: v.slug,
        ram: v.ram,
        storage: v.storage,
        processor: v.processor,
        gpu: v.gpu,
        screenSize: v.screenSize,
        color: v.color,
        basePrice: v.basePrice,
        minPrice: v.minPrice,
        maxPrice: v.maxPrice,
        isDefault: Boolean(v.isDefault),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      for (let i = 0; i < variantDocs.length; i += 500) {
        const chunk = variantDocs.slice(i, i + 500);
        await mDb.collection('variants').insertMany(chunk);
      }

      const mgCats = await mDb.collection('categories').countDocuments();
      const mgBrands = await mDb.collection('brands').countDocuments();
      const mgModels = await mDb.collection('models').countDocuments();
      const mgVariants = await mDb.collection('variants').countDocuments();
      console.log(`MongoDB Atlas verified counts: ${mgCats} categories, ${mgBrands} brands, ${mgModels} models, ${mgVariants} variants`);

      await mongoose.disconnect();
    } catch (mErr) {
      console.error('MongoDB sync error:', mErr.message);
    }
  }

  // --- Step 3: Update src/lib/seed-data.ts ---
  console.log('\n--- Step 3: Updating src/lib/seed-data.ts ---');
  try {
    const seedDataPath = path.resolve(__dirname, '../src/lib/seed-data.ts');
    let seedContent = fs.readFileSync(seedDataPath, 'utf8');

    // 1. Update SEED_CATEGORIES if needed
    const catStart = seedContent.indexOf('export const SEED_CATEGORIES: SeedCategory[] = [');
    const brandsStart = seedContent.indexOf('export const SEED_BRANDS: SeedBrand[] = [');
    const modelsStart = seedContent.indexOf('export const SEED_MODELS: SeedModel[] = [');
    const questionsStart = seedContent.indexOf('export const SEED_QUESTIONS: SeedQuestion[] = [');

    if (brandsStart !== -1 && modelsStart !== -1 && questionsStart !== -1) {
      const allBrandsArray = Array.from(brandsMap.values()).map(b => ({
        id: b.id,
        categoryId: b.categoryId,
        name: b.name,
        slug: b.slug,
        logoUrl: b.logoUrl,
        isPopular: Boolean(b.isPopular),
        displayOrder: b.displayOrder,
      }));

      const allModelsArray = finalModels.map(m => ({
        id: m.id,
        brandId: m.brandId,
        categoryId: m.categoryId,
        name: m.name,
        slug: m.slug,
        series: m.series,
        imageUrl: m.imageUrl,
        releaseYear: m.releaseYear,
        basePrice: m.basePrice,
        minPrice: m.minPrice,
        maxPrice: m.maxPrice,
        isPopular: Boolean(m.isPopular),
        isFeatured: Boolean(m.isFeatured),
        specifications: {},
        variants: m.variants.map(v => ({
          id: v.id,
          name: v.name,
          slug: v.slug,
          ram: v.ram || undefined,
          storage: v.storage || undefined,
          basePrice: v.basePrice,
          minPrice: v.minPrice,
          maxPrice: v.maxPrice,
          isDefault: Boolean(v.isDefault),
        }))
      }));

      const beforeBrands = seedContent.substring(0, brandsStart);
      const afterModels = seedContent.substring(questionsStart);

      const newBrandsStr = `export const SEED_BRANDS: SeedBrand[] = ${JSON.stringify(allBrandsArray, null, 2)};\n\n`;
      const newModelsStr = `export const SEED_MODELS: SeedModel[] = ${JSON.stringify(allModelsArray, null, 2)};\n\n`;

      fs.writeFileSync(seedDataPath, beforeBrands + newBrandsStr + newModelsStr + afterModels, 'utf8');
      console.log(`Successfully updated seed-data.ts with ${allBrandsArray.length} brands and ${allModelsArray.length} models!`);
    } else {
      console.warn('Could not locate markers in seed-data.ts, skipped seed-data.ts rewrite.');
    }
  } catch (seedErr) {
    console.warn('seed-data.ts update error:', seedErr.message);
  }

  // --- Step 4: Generate sitemap.xml & sitemap.ts ---
  console.log('\n--- Step 4: Generating sitemap.xml & sitemap.ts ---');
  const baseUrl = 'https://trustmygadget.com';
  const currentDate = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/sell', priority: '0.9', changefreq: 'daily' },
    { url: '/how-it-works', priority: '0.8', changefreq: 'weekly' },
    { url: '/why-us', priority: '0.8', changefreq: 'weekly' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/faqs', priority: '0.7', changefreq: 'weekly' },
    { url: '/blog', priority: '0.7', changefreq: 'daily' },
    { url: '/contact', priority: '0.6', changefreq: 'monthly' },
    { url: '/terms', priority: '0.5', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.5', changefreq: 'monthly' },
    { url: '/support', priority: '0.6', changefreq: 'monthly' },
    { url: '/track-order', priority: '0.7', changefreq: 'daily' },
  ];

  const categoryUrls = Object.values(CATEGORY_MAP).map(c => ({
    url: `/sell/${c.slug}`,
    priority: '0.9',
    changefreq: 'daily'
  }));

  const brandUrls = Array.from(brandsMap.values()).map(b => {
    const cat = Object.values(CATEGORY_MAP).find(c => c.id === b.categoryId);
    const catSlug = cat ? cat.slug : 'smartphones';
    return {
      url: `/sell/${catSlug}/${b.slug}`,
      priority: '0.8',
      changefreq: 'daily'
    };
  });

  const modelUrls = finalModels.map(m => ({
    url: `/sell/${m.categorySlug}/${m.brandSlug}/${m.slug}`,
    priority: '0.7',
    changefreq: 'weekly'
  }));

  const allSitemapEntries = [
    ...staticUrls,
    ...categoryUrls,
    ...brandUrls,
    ...modelUrls
  ];

  console.log(`Total URLs to include in sitemap: ${allSitemapEntries.length}`);

  // Build XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const entry of allSitemapEntries) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${entry.url}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority}</priority>\n`;
    xml += `  </url>\n`;
  }
  xml += `</urlset>\n`;

  const sitemapXmlPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(sitemapXmlPath, xml, 'utf8');
  console.log(`Saved public/sitemap.xml (${(Buffer.byteLength(xml) / 1024).toFixed(1)} KB, ${allSitemapEntries.length} URLs)`);

  console.log('\n========================================');
  console.log('CATALOG IMPORT & DATABASE SYNC COMPLETE!');
  console.log('========================================');
}

main().catch(err => {
  console.error('Fatal error during catalog import:', err);
  process.exit(1);
});
