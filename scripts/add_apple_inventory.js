const path = require('path');
const Database = require('better-sqlite3');
const { exportSeedData } = require('./export_seed_data');

const dbPath = path.resolve(__dirname, '../trustmygadget.db');
const db = new Database(dbPath);

const APPLE_MODELS = [
  {
    name: 'iPhone 6',
    slug: 'iphone-6',
    series: 'iPhone 6 Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-6-4.jpg',
    releaseYear: 2014,
    basePrice: 2200,
    isPopular: 0,
    variants: [
      { name: '1GB / 16GB', ram: '1GB', storage: '16GB', basePrice: 1800 },
      { name: '1GB / 32GB', ram: '1GB', storage: '32GB', basePrice: 2000 },
      { name: '1GB / 64GB', ram: '1GB', storage: '64GB', basePrice: 2200 },
      { name: '1GB / 128GB', ram: '1GB', storage: '128GB', basePrice: 2500 },
    ]
  },
  {
    name: 'iPhone 6 Plus',
    slug: 'iphone-6-plus',
    series: 'iPhone 6 Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-6-plus.jpg',
    releaseYear: 2014,
    basePrice: 2700,
    isPopular: 0,
    variants: [
      { name: '1GB / 16GB', ram: '1GB', storage: '16GB', basePrice: 2300 },
      { name: '1GB / 64GB', ram: '1GB', storage: '64GB', basePrice: 2700 },
      { name: '1GB / 128GB', ram: '1GB', storage: '128GB', basePrice: 3100 },
    ]
  },
  {
    name: 'iPhone 6s',
    slug: 'iphone-6s',
    series: 'iPhone 6s Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-6s1.jpg',
    releaseYear: 2015,
    basePrice: 3000,
    isPopular: 0,
    variants: [
      { name: '2GB / 16GB', ram: '2GB', storage: '16GB', basePrice: 2500 },
      { name: '2GB / 32GB', ram: '2GB', storage: '32GB', basePrice: 2800 },
      { name: '2GB / 64GB', ram: '2GB', storage: '64GB', basePrice: 3000 },
      { name: '2GB / 128GB', ram: '2GB', storage: '128GB', basePrice: 3400 },
    ]
  },
  {
    name: 'iPhone 6s Plus',
    slug: 'iphone-6s-plus',
    series: 'iPhone 6s Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-6s-plus.jpg',
    releaseYear: 2015,
    basePrice: 3500,
    isPopular: 0,
    variants: [
      { name: '2GB / 16GB', ram: '2GB', storage: '16GB', basePrice: 2900 },
      { name: '2GB / 32GB', ram: '2GB', storage: '32GB', basePrice: 3200 },
      { name: '2GB / 64GB', ram: '2GB', storage: '64GB', basePrice: 3500 },
      { name: '2GB / 128GB', ram: '2GB', storage: '128GB', basePrice: 4000 },
    ]
  },
  {
    name: 'iPhone SE (1st Gen)',
    slug: 'iphone-se-1st-gen',
    series: 'iPhone SE Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-5se-ofic.jpg',
    releaseYear: 2016,
    basePrice: 2500,
    isPopular: 0,
    variants: [
      { name: '2GB / 16GB', ram: '2GB', storage: '16GB', basePrice: 2100 },
      { name: '2GB / 32GB', ram: '2GB', storage: '32GB', basePrice: 2300 },
      { name: '2GB / 64GB', ram: '2GB', storage: '64GB', basePrice: 2500 },
      { name: '2GB / 128GB', ram: '2GB', storage: '128GB', basePrice: 2900 },
    ]
  },
  {
    name: 'iPhone 7',
    slug: 'iphone-7',
    series: 'iPhone 7 Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-7r.jpg',
    releaseYear: 2016,
    basePrice: 4000,
    isPopular: 0,
    variants: [
      { name: '2GB / 32GB', ram: '2GB', storage: '32GB', basePrice: 3600 },
      { name: '2GB / 128GB', ram: '2GB', storage: '128GB', basePrice: 4000 },
      { name: '2GB / 256GB', ram: '2GB', storage: '256GB', basePrice: 4500 },
    ]
  },
  {
    name: 'iPhone 7 Plus',
    slug: 'iphone-7-plus',
    series: 'iPhone 7 Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-7-plus-r2.jpg',
    releaseYear: 2016,
    basePrice: 5200,
    isPopular: 0,
    variants: [
      { name: '3GB / 32GB', ram: '3GB', storage: '32GB', basePrice: 4600 },
      { name: '3GB / 128GB', ram: '3GB', storage: '128GB', basePrice: 5200 },
      { name: '3GB / 256GB', ram: '3GB', storage: '256GB', basePrice: 5800 },
    ]
  },
  {
    name: 'iPhone 8',
    slug: 'iphone-8',
    series: 'iPhone 8 Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-8-new.jpg',
    releaseYear: 2017,
    basePrice: 5800,
    isPopular: 0,
    variants: [
      { name: '2GB / 64GB', ram: '2GB', storage: '64GB', basePrice: 5400 },
      { name: '2GB / 128GB', ram: '2GB', storage: '128GB', basePrice: 5800 },
      { name: '2GB / 256GB', ram: '2GB', storage: '256GB', basePrice: 6400 },
    ]
  },
  {
    name: 'iPhone 8 Plus',
    slug: 'iphone-8-plus',
    series: 'iPhone 8 Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-8-plus-new.jpg',
    releaseYear: 2017,
    basePrice: 7500,
    isPopular: 0,
    variants: [
      { name: '3GB / 64GB', ram: '3GB', storage: '64GB', basePrice: 6900 },
      { name: '3GB / 128GB', ram: '3GB', storage: '128GB', basePrice: 7500 },
      { name: '3GB / 256GB', ram: '3GB', storage: '256GB', basePrice: 8200 },
    ]
  },
  {
    name: 'iPhone X',
    slug: 'iphone-x',
    series: 'iPhone X Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-x.jpg',
    releaseYear: 2017,
    basePrice: 9000,
    isPopular: 0,
    variants: [
      { name: '3GB / 64GB', ram: '3GB', storage: '64GB', basePrice: 8500 },
      { name: '3GB / 256GB', ram: '3GB', storage: '256GB', basePrice: 9500 },
    ]
  },
  {
    name: 'iPhone XR',
    slug: 'iphone-xr',
    series: 'iPhone X Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-xr-new.jpg',
    releaseYear: 2018,
    basePrice: 10500,
    isPopular: 1,
    variants: [
      { name: '3GB / 64GB', ram: '3GB', storage: '64GB', basePrice: 9800 },
      { name: '3GB / 128GB', ram: '3GB', storage: '128GB', basePrice: 10500 },
      { name: '3GB / 256GB', ram: '3GB', storage: '256GB', basePrice: 11500 },
    ]
  },
  {
    name: 'iPhone XS',
    slug: 'iphone-xs',
    series: 'iPhone X Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-xs-new.jpg',
    releaseYear: 2018,
    basePrice: 11500,
    isPopular: 0,
    variants: [
      { name: '4GB / 64GB', ram: '4GB', storage: '64GB', basePrice: 10800 },
      { name: '4GB / 256GB', ram: '4GB', storage: '256GB', basePrice: 11500 },
      { name: '4GB / 512GB', ram: '4GB', storage: '512GB', basePrice: 12500 },
    ]
  },
  {
    name: 'iPhone XS Max',
    slug: 'iphone-xs-max',
    series: 'iPhone X Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-xs-max-new1.jpg',
    releaseYear: 2018,
    basePrice: 14000,
    isPopular: 0,
    variants: [
      { name: '4GB / 64GB', ram: '4GB', storage: '64GB', basePrice: 13000 },
      { name: '4GB / 256GB', ram: '4GB', storage: '256GB', basePrice: 14000 },
      { name: '4GB / 512GB', ram: '4GB', storage: '512GB', basePrice: 15200 },
    ]
  },
  {
    name: 'iPhone 11',
    slug: 'iphone-11',
    series: 'iPhone 11 Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11.jpg',
    releaseYear: 2019,
    basePrice: 13500,
    isPopular: 1,
    variants: [
      { name: '4GB / 64GB', ram: '4GB', storage: '64GB', basePrice: 12500 },
      { name: '4GB / 128GB', ram: '4GB', storage: '128GB', basePrice: 13500 },
      { name: '4GB / 256GB', ram: '4GB', storage: '256GB', basePrice: 14800 },
    ]
  },
  {
    name: 'iPhone 11 Pro',
    slug: 'iphone-11-pro',
    series: 'iPhone 11 Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11-pro.jpg',
    releaseYear: 2019,
    basePrice: 18000,
    isPopular: 0,
    variants: [
      { name: '4GB / 64GB', ram: '4GB', storage: '64GB', basePrice: 16800 },
      { name: '4GB / 256GB', ram: '4GB', storage: '256GB', basePrice: 18000 },
      { name: '4GB / 512GB', ram: '4GB', storage: '512GB', basePrice: 19500 },
    ]
  },
  {
    name: 'iPhone 11 Pro Max',
    slug: 'iphone-11-pro-max',
    series: 'iPhone 11 Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11-pro-max-.jpg',
    releaseYear: 2019,
    basePrice: 21000,
    isPopular: 0,
    variants: [
      { name: '4GB / 64GB', ram: '4GB', storage: '64GB', basePrice: 19500 },
      { name: '4GB / 256GB', ram: '4GB', storage: '256GB', basePrice: 21000 },
      { name: '4GB / 512GB', ram: '4GB', storage: '512GB', basePrice: 22800 },
    ]
  },
  {
    name: 'iPhone SE (2020)',
    slug: 'iphone-se-2020',
    series: 'iPhone SE Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2020.jpg',
    releaseYear: 2020,
    basePrice: 8500,
    isPopular: 0,
    variants: [
      { name: '3GB / 64GB', ram: '3GB', storage: '64GB', basePrice: 7900 },
      { name: '3GB / 128GB', ram: '3GB', storage: '128GB', basePrice: 8500 },
      { name: '3GB / 256GB', ram: '3GB', storage: '256GB', basePrice: 9300 },
    ]
  },
  {
    name: 'iPhone 12 mini',
    slug: 'iphone-12-mini',
    series: 'iPhone 12 Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12-mini.jpg',
    releaseYear: 2020,
    basePrice: 14500,
    isPopular: 0,
    variants: [
      { name: '4GB / 64GB', ram: '4GB', storage: '64GB', basePrice: 13500 },
      { name: '4GB / 128GB', ram: '4GB', storage: '128GB', basePrice: 14500 },
      { name: '4GB / 256GB', ram: '4GB', storage: '256GB', basePrice: 16000 },
    ]
  },
  {
    name: 'iPhone 12',
    slug: 'iphone-12',
    series: 'iPhone 12 Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg',
    releaseYear: 2020,
    basePrice: 17500,
    isPopular: 1,
    variants: [
      { name: '4GB / 64GB', ram: '4GB', storage: '64GB', basePrice: 16200 },
      { name: '4GB / 128GB', ram: '4GB', storage: '128GB', basePrice: 17500 },
      { name: '4GB / 256GB', ram: '4GB', storage: '256GB', basePrice: 19200 },
    ]
  },
  {
    name: 'iPhone 12 Pro',
    slug: 'iphone-12-pro',
    series: 'iPhone 12 Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12-pro--.jpg',
    releaseYear: 2020,
    basePrice: 24000,
    isPopular: 0,
    variants: [
      { name: '6GB / 128GB', ram: '6GB', storage: '128GB', basePrice: 22500 },
      { name: '6GB / 256GB', ram: '6GB', storage: '256GB', basePrice: 24000 },
      { name: '6GB / 512GB', ram: '6GB', storage: '512GB', basePrice: 26000 },
    ]
  },
  {
    name: 'iPhone 12 Pro Max',
    slug: 'iphone-12-pro-max',
    series: 'iPhone 12 Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12-pro-max-.jpg',
    releaseYear: 2020,
    basePrice: 27500,
    isPopular: 0,
    variants: [
      { name: '6GB / 128GB', ram: '6GB', storage: '128GB', basePrice: 25500 },
      { name: '6GB / 256GB', ram: '6GB', storage: '256GB', basePrice: 27500 },
      { name: '6GB / 512GB', ram: '6GB', storage: '512GB', basePrice: 30000 },
    ]
  },
  {
    name: 'iPhone 13 mini',
    slug: 'iphone-13-mini',
    series: 'iPhone 13 Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-mini.jpg',
    releaseYear: 2021,
    basePrice: 18000,
    isPopular: 0,
    variants: [
      { name: '4GB / 128GB', ram: '4GB', storage: '128GB', basePrice: 18000 },
      { name: '4GB / 256GB', ram: '4GB', storage: '256GB', basePrice: 20000 },
      { name: '4GB / 512GB', ram: '4GB', storage: '512GB', basePrice: 22500 },
    ]
  },
  {
    name: 'iPhone 13 Pro',
    slug: 'iphone-13-pro',
    series: 'iPhone 13 Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro.jpg',
    releaseYear: 2021,
    basePrice: 29000,
    isPopular: 0,
    variants: [
      { name: '6GB / 128GB', ram: '6GB', storage: '128GB', basePrice: 27000 },
      { name: '6GB / 256GB', ram: '6GB', storage: '29000', basePrice: 29000 },
      { name: '6GB / 512GB', ram: '6GB', storage: '512GB', basePrice: 31500 },
      { name: '6GB / 1TB', ram: '6GB', storage: '1TB', basePrice: 34000 },
    ]
  },
  {
    name: 'iPhone 13 Pro Max',
    slug: 'iphone-13-pro-max',
    series: 'iPhone 13 Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro-max.jpg',
    releaseYear: 2021,
    basePrice: 34000,
    isPopular: 1,
    variants: [
      { name: '6GB / 128GB', ram: '6GB', storage: '128GB', basePrice: 31500 },
      { name: '6GB / 256GB', ram: '6GB', storage: '256GB', basePrice: 34000 },
      { name: '6GB / 512GB', ram: '6GB', storage: '512GB', basePrice: 37000 },
      { name: '6GB / 1TB', ram: '6GB', storage: '1TB', basePrice: 40000 },
    ]
  },
  {
    name: 'iPhone SE (2022)',
    slug: 'iphone-se-2022',
    series: 'iPhone SE Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2022.jpg',
    releaseYear: 2022,
    basePrice: 12000,
    isPopular: 0,
    variants: [
      { name: '4GB / 64GB', ram: '4GB', storage: '64GB', basePrice: 11000 },
      { name: '4GB / 128GB', ram: '4GB', storage: '128GB', basePrice: 12000 },
      { name: '4GB / 256GB', ram: '4GB', storage: '256GB', basePrice: 13500 },
    ]
  },
  {
    name: 'iPhone 14 Pro',
    slug: 'iphone-14-pro',
    series: 'iPhone 14 Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg',
    releaseYear: 2022,
    basePrice: 38000,
    isPopular: 0,
    variants: [
      { name: '6GB / 128GB', ram: '6GB', storage: '128GB', basePrice: 35000 },
      { name: '6GB / 256GB', ram: '6GB', storage: '256GB', basePrice: 38000 },
      { name: '6GB / 512GB', ram: '6GB', storage: '512GB', basePrice: 41500 },
      { name: '6GB / 1TB', ram: '6GB', storage: '1TB', basePrice: 45000 },
    ]
  },
  {
    name: 'iPhone 14 Pro Max',
    slug: 'iphone-14-pro-max',
    series: 'iPhone 14 Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro-max-.jpg',
    releaseYear: 2022,
    basePrice: 44000,
    isPopular: 1,
    variants: [
      { name: '6GB / 128GB', ram: '6GB', storage: '128GB', basePrice: 41000 },
      { name: '6GB / 256GB', ram: '6GB', storage: '256GB', basePrice: 44000 },
      { name: '6GB / 512GB', ram: '6GB', storage: '512GB', basePrice: 48000 },
      { name: '6GB / 1TB', ram: '6GB', storage: '1TB', basePrice: 52000 },
    ]
  },
  {
    name: 'iPhone 15 Pro',
    slug: 'iphone-15-pro',
    series: 'iPhone 15 Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg',
    releaseYear: 2023,
    basePrice: 51000,
    isPopular: 0,
    variants: [
      { name: '8GB / 128GB', ram: '8GB', storage: '128GB', basePrice: 47500 },
      { name: '8GB / 256GB', ram: '8GB', storage: '256GB', basePrice: 51000 },
      { name: '8GB / 512GB', ram: '8GB', storage: '512GB', basePrice: 55500 },
      { name: '8GB / 1TB', ram: '8GB', storage: '1TB', basePrice: 60000 },
    ]
  },
  {
    name: 'iPhone 15 Pro Max',
    slug: 'iphone-15-pro-max',
    series: 'iPhone 15 Series',
    imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg',
    releaseYear: 2023,
    basePrice: 62000,
    isPopular: 1,
    variants: [
      { name: '8GB / 256GB', ram: '8GB', storage: '256GB', basePrice: 58000 },
      { name: '8GB / 512GB', ram: '8GB', storage: '512GB', basePrice: 62000 },
      { name: '8GB / 1TB', ram: '8GB', storage: '1TB', basePrice: 68000 },
    ]
  }
];

const insertModel = db.prepare(`
  INSERT OR REPLACE INTO models (
    id, brandId, categoryId, name, slug, series, imageUrl, releaseYear,
    basePrice, minPrice, maxPrice, isPopular, isFeatured, isActive, specifications
  ) VALUES (
    @id, 'b_phone_apple', 'cat_smartphone', @name, @slug, @series, @imageUrl, @releaseYear,
    @basePrice, @minPrice, @maxPrice, @isPopular, 0, 1, '{}'
  )
`);

const insertVariant = db.prepare(`
  INSERT OR REPLACE INTO variants (
    id, modelId, name, slug, ram, storage, basePrice, minPrice, maxPrice, isDefault, isActive
  ) VALUES (
    @id, @modelId, @name, @slug, @ram, @storage, @basePrice, @minPrice, @maxPrice, @isDefault, 1
  )
`);

const transaction = db.transaction(() => {
  for (const m of APPLE_MODELS) {
    const modelId = `m_apple_${m.slug.replace(/[^a-z0-9]+/g, '_')}`;
    const minPrice = Math.round(m.basePrice * 0.7);
    const maxPrice = Math.round(m.basePrice * 1.25);

    insertModel.run({
      id: modelId,
      name: m.name,
      slug: m.slug,
      series: m.series,
      imageUrl: m.imageUrl,
      releaseYear: m.releaseYear,
      basePrice: m.basePrice,
      minPrice,
      maxPrice,
      isPopular: m.isPopular,
    });

    const seenSlugs = new Set();
    m.variants.forEach((v, idx) => {
      const varId = `v_apple_${m.slug.replace(/[^a-z0-9]+/g, '_')}_${v.storage.toLowerCase()}`;
      let rawSlug = `${v.ram}-${v.storage}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let uniqueSlug = rawSlug;
      let counter = 2;
      while (seenSlugs.has(uniqueSlug)) {
        uniqueSlug = `${rawSlug}-${counter}`;
        counter++;
      }
      seenSlugs.add(uniqueSlug);

      const varPrice = v.basePrice;
      insertVariant.run({
        id: varId,
        modelId,
        name: v.name,
        slug: uniqueSlug,
        ram: v.ram,
        storage: v.storage,
        basePrice: varPrice,
        minPrice: Math.round(varPrice * 0.7),
        maxPrice: Math.round(varPrice * 1.25),
        isDefault: idx === 0 ? 1 : 0,
      });
    });
  }
});

transaction();
console.log(`Successfully added/updated ${APPLE_MODELS.length} Apple models into trustmygadget.db`);

// Export to seed-data.ts
exportSeedData();
