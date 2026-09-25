const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.resolve(__dirname, '../trustmygadget.db');
const db = new Database(dbPath);

function exportSeedData() {
  const brands = db.prepare(`
    SELECT id, categoryId, name, slug, logoUrl, isPopular, displayOrder
    FROM brands
    ORDER BY categoryId, displayOrder
  `).all();

  const models = db.prepare(`
    SELECT id, brandId, categoryId, name, slug, series, imageUrl, releaseYear, basePrice, minPrice, maxPrice, isPopular, isFeatured, specifications
    FROM models
    ORDER BY brandId, releaseYear DESC, name
  `).all();

  const variants = db.prepare(`
    SELECT id, modelId, name, slug, ram, storage, processor, gpu, screenSize, color, basePrice, minPrice, maxPrice, isDefault
    FROM variants
    ORDER BY modelId, basePrice ASC
  `).all();

  const variantsByModel = new Map();
  for (const v of variants) {
    if (!variantsByModel.has(v.modelId)) variantsByModel.set(v.modelId, []);
    variantsByModel.get(v.modelId).push({
      id: v.id,
      name: v.name,
      slug: v.slug,
      ram: v.ram || undefined,
      storage: v.storage || undefined,
      processor: v.processor || undefined,
      gpu: v.gpu || undefined,
      screenSize: v.screenSize || undefined,
      color: v.color || undefined,
      basePrice: v.basePrice,
      minPrice: v.minPrice,
      maxPrice: v.maxPrice,
      isDefault: Boolean(v.isDefault)
    });
  }

  const seedModels = models.map(m => {
    let specs = {};
    try {
      specs = JSON.parse(m.specifications || '{}');
    } catch (e) {
      specs = {};
    }
    return {
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
      specifications: specs,
      variants: variantsByModel.get(m.id) || []
    };
  });

  const seedBrands = brands.map(b => ({
    id: b.id,
    categoryId: b.categoryId,
    name: b.name,
    slug: b.slug,
    logoUrl: b.logoUrl,
    isPopular: Boolean(b.isPopular),
    displayOrder: b.displayOrder
  }));

  console.log(`Exporting ${seedBrands.length} brands, ${seedModels.length} models, and ${variants.length} variants...`);

  // Read current seed-data.ts
  const seedDataPath = path.resolve(__dirname, '../src/lib/seed-data.ts');
  const currentContent = fs.readFileSync(seedDataPath, 'utf8');

  // We want to replace SEED_BRANDS and SEED_MODELS while keeping categories, questions, etc.
  const brandsStartIdx = currentContent.indexOf('export const SEED_BRANDS: SeedBrand[] = [');
  const modelsStartIdx = currentContent.indexOf('export const SEED_MODELS: SeedModel[] = [');
  const questionsStartIdx = currentContent.indexOf('export const SEED_QUESTIONS: SeedQuestion[] = [');

  if (brandsStartIdx === -1 || modelsStartIdx === -1 || questionsStartIdx === -1) {
    console.error('Could not locate markers in seed-data.ts');
    return;
  }

  const beforeBrands = currentContent.substring(0, brandsStartIdx);
  const afterModels = currentContent.substring(questionsStartIdx);

  const newBrandsStr = `export const SEED_BRANDS: SeedBrand[] = ${JSON.stringify(seedBrands, null, 2)};\n\n`;
  const newModelsStr = `export const SEED_MODELS: SeedModel[] = ${JSON.stringify(seedModels, null, 2)};\n\n`;

  const updatedFileContent = beforeBrands + newBrandsStr + newModelsStr + afterModels;
  fs.writeFileSync(seedDataPath, updatedFileContent, 'utf8');
  console.log('Successfully updated src/lib/seed-data.ts!');
}

module.exports = { exportSeedData };

if (require.main === module) {
  exportSeedData();
}
